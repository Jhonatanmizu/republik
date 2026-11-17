import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Injectable,
  NotFoundException,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Module } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Response } from 'express';
import { z } from 'zod';
import { getEnvConfig } from '../../config/env.config.js';
import {
  APP_CONSTANTS,
  ENROLLMENT_STATUS,
} from '../../constants/app.constants.js';
import { DRIZZLE_DB } from '../../database/database.constants.js';
import * as schema from '../../database/schema.js';
import type { JwtPayload } from '../../shared/crypto/crypto.util.js';
import {
  CurrentUser,
  JwtAuthGuard,
  ZodValidationPipe,
} from '../../shared/security/security.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuthService, type PublicUserDto } from '../auth/auth.service.js';

export const UpdateProfileDtoSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  whatsapp: z.string().min(8).max(30).optional(),
  hideWhatsappForGuests: z.boolean().optional(),
  universityCode: z.string().min(2).max(20).optional(),
  courseName: z.string().min(2).max(120).optional(),
  courseSemester: z.string().min(1).max(40).optional(),
  enrollmentStatus: z
    .enum([
      ENROLLMENT_STATUS.CURSANDO,
      ENROLLMENT_STATUS.FORMADO,
      ENROLLMENT_STATUS.POS_GRADUACAO,
    ])
    .optional(),
  avatarUrl: z.string().max(500).nullable().optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly authService: AuthService,
  ) {}

  async listUniversities() {
    const rows = await this.db
      .select()
      .from(schema.universities)
      .orderBy(asc(schema.universities.code));
    return rows.map((u) => ({
      id: u.id,
      code: u.code,
      name: u.name,
      campusName: u.campusName,
      city: u.city,
      state: u.state,
      emailDomains: u.emailDomains,
    }));
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicUserDto> {
    let universityId: string | undefined;
    if (dto.universityCode) {
      const [uni] = await this.db
        .select()
        .from(schema.universities)
        .where(eq(schema.universities.code, dto.universityCode.toUpperCase()))
        .limit(1);
      if (uni) {
        universityId = uni.id;
      }
    }

    const updateFields: Partial<typeof schema.users.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (dto.fullName !== undefined) updateFields.fullName = dto.fullName;
    if (dto.whatsapp !== undefined) updateFields.whatsapp = dto.whatsapp;
    if (dto.hideWhatsappForGuests !== undefined) {
      updateFields.hideWhatsappForGuests = dto.hideWhatsappForGuests;
    }
    if (universityId !== undefined) updateFields.universityId = universityId;
    if (dto.courseName !== undefined) updateFields.courseName = dto.courseName;
    if (dto.courseSemester !== undefined) {
      updateFields.courseSemester = dto.courseSemester;
    }
    if (dto.enrollmentStatus !== undefined) {
      updateFields.enrollmentStatus = dto.enrollmentStatus;
    }
    if (dto.avatarUrl !== undefined) updateFields.avatarUrl = dto.avatarUrl;

    const [updated] = await this.db
      .update(schema.users)
      .set(updateFields)
      .where(eq(schema.users.id, userId))
      .returning();

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.authService.toPublicUser(updated);
  }

  async exportLgpdData(userId: string) {
    const [userRow] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!userRow) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const publicProfile = await this.authService.toPublicUser(userRow);
    const userListings = await this.db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.ownerId, userId));
    const userVerifications = await this.db
      .select()
      .from(schema.verificationRequests)
      .where(eq(schema.verificationRequests.userId, userId));
    const sentMessages = await this.db
      .select()
      .from(schema.messages)
      .where(eq(schema.messages.senderId, userId));

    const env = getEnvConfig();
    return {
      lgpdComplianceLaw: 'Lei Geral de Proteção de Dados (Lei nº 13.709/2018)',
      article: 'Art. 18, II e V — Direito de Acesso e Portabilidade de Dados',
      exportedAt: new Date().toISOString(),
      controller: env.LGPD_CONTROLLER_NAME,
      dpoContact: env.LGPD_DPO_EMAIL,
      subject: publicProfile,
      listings: userListings,
      verificationHistory: userVerifications,
      messagesCount: sentMessages.length,
      messages: sentMessages,
    };
  }

  async deleteAccountPermanently(userId: string): Promise<void> {
    await this.db.delete(schema.users).where(eq(schema.users.id, userId));
  }
}

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('universities')
  async getUniversities() {
    const universities = await this.usersService.listUniversities();
    return { universities };
  }

  @Patch('users/me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpdateProfileDtoSchema)) dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.updateProfile(user.sub, dto);
    return { user: updated };
  }

  @Get('users/me/lgpd-export')
  @UseGuards(JwtAuthGuard)
  async exportLgpd(@CurrentUser() user: JwtPayload) {
    return this.usersService.exportLgpdData(user.sub);
  }

  @Delete('users/me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.usersService.deleteAccountPermanently(user.sub);
    res.clearCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN, { path: '/' });
    res.clearCookie(APP_CONSTANTS.COOKIES.REFRESH_TOKEN, { path: '/' });
    return {
      deleted: true,
      message:
        'Sua conta e todos os dados vinculados foram excluídos definitivamente (Art. 18, VI da LGPD).',
    };
  }
}

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

