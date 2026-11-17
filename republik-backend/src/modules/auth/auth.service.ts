import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getEnvConfig } from '../../config/env.config.js';
import {
  APP_CONSTANTS,
  OTP_PURPOSE,
  VERIFICATION_STATUS,
} from '../../constants/app.constants.js';
import { DRIZZLE_DB } from '../../database/database.constants.js';
import * as schema from '../../database/schema.js';
import {
  generateRandomToken,
  generateSixDigitOtp,
  hashPassword,
  sha256Hex,
  signJwtToken,
  verifyPassword,
} from '../../shared/crypto/crypto.util.js';
import {
  EMAIL_SERVICE_PORT,
  type EmailServicePort,
} from '../../shared/mail/mail.module.js';
import { AUTH_MESSAGES, extractAcademicDomain } from './auth.constants.js';
import type {
  LoginDto,
  RegisterDto,
  RequestOtpDto,
  ResetPasswordDto,
  SubmitEnrollmentDocDto,
  VerifyOtpDto,
} from './auth.dto.js';

export interface PublicUserDto {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly whatsapp: string;
  readonly hideWhatsappForGuests: boolean;
  readonly avatarUrl: string | null;
  readonly universityId: string | null;
  readonly universityCode: string;
  readonly universityName: string;
  readonly courseName: string;
  readonly courseSemester: string;
  readonly enrollmentStatus: string;
  readonly verificationStatus: string;
  readonly verifiedDomain: string | null;
  readonly role: string;
  readonly createdAt: string;
}

export interface AuthSessionResult {
  readonly user: PublicUserDto;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly csrfToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(EMAIL_SERVICE_PORT)
    private readonly emailService: EmailServicePort,
  ) {}

  private get jwtAccessSecret(): string {
    return getEnvConfig().JWT_ACCESS_SECRET;
  }

  async toPublicUser(
    userRow: typeof schema.users.$inferSelect,
  ): Promise<PublicUserDto> {
    let universityCode = 'USP';
    let universityName = 'Universidade de São Paulo';
    if (userRow.universityId) {
      const [uni] = await this.db
        .select()
        .from(schema.universities)
        .where(eq(schema.universities.id, userRow.universityId))
        .limit(1);
      if (uni) {
        universityCode = uni.code;
        universityName = uni.name;
      }
    }
    return {
      id: userRow.id,
      fullName: userRow.fullName,
      email: userRow.email,
      whatsapp: userRow.whatsapp,
      hideWhatsappForGuests: userRow.hideWhatsappForGuests,
      avatarUrl: userRow.avatarUrl,
      universityId: userRow.universityId,
      universityCode,
      universityName,
      courseName: userRow.courseName,
      courseSemester: userRow.courseSemester,
      enrollmentStatus: userRow.enrollmentStatus,
      verificationStatus: userRow.verificationStatus,
      verifiedDomain: userRow.verifiedDomain,
      role: userRow.role,
      createdAt: userRow.createdAt.toISOString(),
    };
  }

  private async issueSessionTokens(
    userRow: typeof schema.users.$inferSelect,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthSessionResult> {
    const accessToken = signJwtToken(
      {
        sub: userRow.id,
        email: userRow.email,
        role: userRow.role,
      },
      this.jwtAccessSecret,
      APP_CONSTANTS.TOKEN_TTL.ACCESS_SECONDS,
    );

    const rawRefreshToken = generateRandomToken(40);
    const refreshTokenHash = sha256Hex(rawRefreshToken);
    const expiresAt = new Date(
      Date.now() + APP_CONSTANTS.TOKEN_TTL.REFRESH_SECONDS * 1000,
    );

    await this.db.insert(schema.refreshTokens).values({
      userId: userRow.id,
      tokenHash: refreshTokenHash,
      userAgent: meta?.userAgent ?? null,
      ipAddress: meta?.ipAddress ?? null,
      expiresAt,
    });

    const csrfToken = generateRandomToken(24);
    const publicUser = await this.toPublicUser(userRow);

    return {
      user: publicUser,
      accessToken,
      refreshToken: rawRefreshToken,
      csrfToken,
    };
  }

  async register(
    dto: RegisterDto,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthSessionResult> {
    const [existing] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))
      .limit(1);

    if (existing) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED);
    }

    const [uni] = await this.db
      .select()
      .from(schema.universities)
      .where(eq(schema.universities.code, dto.universityCode.toUpperCase()))
      .limit(1);

    const passwordHash = await hashPassword(dto.password);
    const academicDomain = extractAcademicDomain(dto.email);

    const [inserted] = await this.db
      .insert(schema.users)
      .values({
        fullName: dto.fullName,
        email: dto.email,
        passwordHash,
        whatsapp: dto.whatsapp,
        hideWhatsappForGuests: true,
        universityId: uni?.id ?? null,
        courseName: dto.courseName,
        courseSemester: dto.courseSemester,
        enrollmentStatus: dto.enrollmentStatus,
        verificationStatus: academicDomain
          ? VERIFICATION_STATUS.VERIFIED
          : VERIFICATION_STATUS.UNVERIFIED,
        verifiedDomain: academicDomain,
      })
      .returning();

    if (!inserted) {
      throw new BadRequestException('Não foi possível criar a conta.');
    }

    return this.issueSessionTokens(inserted, meta);
  }

  async login(
    dto: LoginDto,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthSessionResult> {
    const [userRow] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))
      .limit(1);

    if (!userRow) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (userRow.isBanned) {
      throw new ForbiddenException(AUTH_MESSAGES.ACCOUNT_BANNED);
    }

    const passwordMatches = await verifyPassword(
      dto.password,
      userRow.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    return this.issueSessionTokens(userRow, meta);
  }

  async rotateRefreshToken(
    rawRefreshToken: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthSessionResult> {
    const tokenHash = sha256Hex(rawRefreshToken);
    const [stored] = await this.db
      .select()
      .from(schema.refreshTokens)
      .where(
        and(
          eq(schema.refreshTokens.tokenHash, tokenHash),
          isNull(schema.refreshTokens.revokedAt),
        ),
      )
      .limit(1);

    if (!stored || stored.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_TOKEN_INVALID);
    }

    // Revoke old refresh token immediately (rotation)
    await this.db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(schema.refreshTokens.id, stored.id));

    const [userRow] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, stored.userId))
      .limit(1);

    if (!userRow || userRow.isBanned) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_TOKEN_INVALID);
    }

    return this.issueSessionTokens(userRow, meta);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }
    const tokenHash = sha256Hex(rawRefreshToken);
    await this.db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(schema.refreshTokens.tokenHash, tokenHash));
  }

  async getMe(userId: string): Promise<PublicUserDto> {
    const [userRow] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!userRow) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_TOKEN_INVALID);
    }
    return this.toPublicUser(userRow);
  }

  async requestOtp(
    dto: RequestOtpDto,
    currentUserId?: string,
  ): Promise<{
    message: string;
    email: string;
    academicDomain: string | null;
    demoOtpCode?: string;
  }> {
    const academicDomain = extractAcademicDomain(dto.email);
    if (
      dto.purpose === OTP_PURPOSE.INSTANT_EDU_VERIFY &&
      !academicDomain
    ) {
      throw new BadRequestException(
        AUTH_MESSAGES.INSTITUTIONAL_EMAIL_REQUIRED,
      );
    }

    const code = generateSixDigitOtp();
    const codeHash = sha256Hex(code);
    const expiresAt = new Date(
      Date.now() + APP_CONSTANTS.TOKEN_TTL.OTP_SECONDS * 1000,
    );

    await this.db.insert(schema.otpCodes).values({
      email: dto.email,
      userId: currentUserId ?? null,
      codeHash,
      purpose: dto.purpose,
      expiresAt,
    });

    await this.emailService.sendOtpEmail({
      to: dto.email,
      code,
      purpose: dto.purpose,
    });

    const env = getEnvConfig();
    return {
      message: AUTH_MESSAGES.OTP_SENT,
      email: dto.email,
      academicDomain,
      ...(env.EXPOSE_DEMO_OTP ? { demoOtpCode: code } : {}),
    };
  }

  async verifyOtp(
    dto: VerifyOtpDto,
    currentUserId?: string,
  ): Promise<{
    verified: boolean;
    academicDomain: string | null;
    user: PublicUserDto | null;
  }> {
    const codeHash = sha256Hex(dto.code);
    const [otpRow] = await this.db
      .select()
      .from(schema.otpCodes)
      .where(
        and(
          eq(schema.otpCodes.email, dto.email),
          eq(schema.otpCodes.codeHash, codeHash),
          isNull(schema.otpCodes.consumedAt),
        ),
      )
      .orderBy(desc(schema.otpCodes.createdAt))
      .limit(1);

    if (!otpRow || otpRow.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException(AUTH_MESSAGES.OTP_INVALID_OR_EXPIRED);
    }

    await this.db
      .update(schema.otpCodes)
      .set({ consumedAt: new Date() })
      .where(eq(schema.otpCodes.id, otpRow.id));

    const academicDomain = extractAcademicDomain(dto.email) ?? 'usp.br';
    const targetUserId = currentUserId ?? otpRow.userId;

    let updatedUser: PublicUserDto | null = null;
    if (targetUserId) {
      const [row] = await this.db
        .update(schema.users)
        .set({
          verificationStatus: VERIFICATION_STATUS.VERIFIED,
          verifiedDomain: academicDomain,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, targetUserId))
        .returning();
      if (row) {
        updatedUser = await this.toPublicUser(row);
      }
    } else {
      const [rowByEmail] = await this.db
        .update(schema.users)
        .set({
          verificationStatus: VERIFICATION_STATUS.VERIFIED,
          verifiedDomain: academicDomain,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.email, dto.email))
        .returning();
      if (rowByEmail) {
        updatedUser = await this.toPublicUser(rowByEmail);
      }
    }

    return {
      verified: true,
      academicDomain,
      user: updatedUser,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const codeHash = sha256Hex(dto.code);
    const [otpRow] = await this.db
      .select()
      .from(schema.otpCodes)
      .where(
        and(
          eq(schema.otpCodes.email, dto.email),
          eq(schema.otpCodes.codeHash, codeHash),
          isNull(schema.otpCodes.consumedAt),
        ),
      )
      .orderBy(desc(schema.otpCodes.createdAt))
      .limit(1);

    if (!otpRow || otpRow.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException(AUTH_MESSAGES.OTP_INVALID_OR_EXPIRED);
    }

    await this.db
      .update(schema.otpCodes)
      .set({ consumedAt: new Date() })
      .where(eq(schema.otpCodes.id, otpRow.id));

    const newPasswordHash = await hashPassword(dto.newPassword);
    await this.db
      .update(schema.users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.email, dto.email));

    return { message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS };
  }

  async submitEnrollmentDocument(
    userId: string,
    dto: SubmitEnrollmentDocDto,
  ): Promise<{ id: string; status: string }> {
    const [reqRow] = await this.db
      .insert(schema.verificationRequests)
      .values({
        userId,
        universityName: dto.universityName,
        registrationNumber: dto.registrationNumber,
        documentName: dto.documentName,
        documentUrl: dto.documentUrl,
        status: 'PENDING',
      })
      .returning();

    await this.db
      .update(schema.users)
      .set({
        verificationStatus: VERIFICATION_STATUS.PENDING_DOC,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    return {
      id: reqRow?.id ?? '',
      status: reqRow?.status ?? 'PENDING',
    };
  }
}

