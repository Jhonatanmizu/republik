import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { APP_CONSTANTS } from '../../constants/app.constants.js';
import {
  generateRandomToken,
  type JwtPayload,
} from '../../shared/crypto/crypto.util.js';
import {
  CurrentUser,
  JwtAuthGuard,
  OptionalJwtAuthGuard,
  SkipCsrf,
  ZodValidationPipe,
  parseCookieHeader,
} from '../../shared/security/security.js';
import { AUTH_MESSAGES } from './auth.constants.js';
import {
  type LoginDto,
  LoginDtoSchema,
  type RegisterDto,
  RegisterDtoSchema,
  type RequestOtpDto,
  RequestOtpDtoSchema,
  type ResetPasswordDto,
  ResetPasswordDtoSchema,
  type SubmitEnrollmentDocDto,
  SubmitEnrollmentDocDtoSchema,
  type VerifyOtpDto,
  VerifyOtpDtoSchema,
} from './auth.dto.js';
import { type AuthSessionResult, AuthService } from './auth.service.js';

function attachAuthCookies(res: Response, session: AuthSessionResult): void {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN, session.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: APP_CONSTANTS.TOKEN_TTL.ACCESS_SECONDS * 1000,
  });

  res.cookie(APP_CONSTANTS.COOKIES.REFRESH_TOKEN, session.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: APP_CONSTANTS.TOKEN_TTL.REFRESH_SECONDS * 1000,
  });

  res.cookie(APP_CONSTANTS.COOKIES.CSRF_TOKEN, session.csrfToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: APP_CONSTANTS.TOKEN_TTL.REFRESH_SECONDS * 1000,
  });
}

function clearAuthCookies(res: Response): void {
  res.clearCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN, { path: '/' });
  res.clearCookie(APP_CONSTANTS.COOKIES.REFRESH_TOKEN, { path: '/' });
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('csrf')
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = parseCookieHeader(req.headers.cookie);
    const existing = cookies[APP_CONSTANTS.COOKIES.CSRF_TOKEN];
    const csrfToken = existing ?? generateRandomToken(24);

    res.cookie(APP_CONSTANTS.COOKIES.CSRF_TOKEN, csrfToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: APP_CONSTANTS.TOKEN_TTL.REFRESH_SECONDS * 1000,
    });

    return { csrfToken };
  }

  @Post('register')
  @SkipCsrf()
  @Throttle({
    default: {
      limit: APP_CONSTANTS.THROTTLE.AUTH_LIMIT,
      ttl: APP_CONSTANTS.THROTTLE.AUTH_TTL_MS,
    },
  })
  async register(
    @Body(new ZodValidationPipe(RegisterDtoSchema)) dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.register(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    attachAuthCookies(res, session);
    return {
      user: session.user,
      accessToken: session.accessToken,
      csrfToken: session.csrfToken,
    };
  }

  @Post('login')
  @SkipCsrf()
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: APP_CONSTANTS.THROTTLE.AUTH_LIMIT,
      ttl: APP_CONSTANTS.THROTTLE.AUTH_TTL_MS,
    },
  })
  async login(
    @Body(new ZodValidationPipe(LoginDtoSchema)) dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.login(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    attachAuthCookies(res, session);
    return {
      user: session.user,
      accessToken: session.accessToken,
      csrfToken: session.csrfToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = parseCookieHeader(req.headers.cookie);
    const refreshToken = cookies[APP_CONSTANTS.COOKIES.REFRESH_TOKEN];
    if (!refreshToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_TOKEN_MISSING);
    }
    const session = await this.authService.rotateRefreshToken(refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    attachAuthCookies(res, session);
    return {
      user: session.user,
      accessToken: session.accessToken,
      csrfToken: session.csrfToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = parseCookieHeader(req.headers.cookie);
    const refreshToken = cookies[APP_CONSTANTS.COOKIES.REFRESH_TOKEN];
    await this.authService.logout(refreshToken);
    clearAuthCookies(res);
    return { message: AUTH_MESSAGES.LOGGED_OUT };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload) {
    const profile = await this.authService.getMe(user.sub);
    return { user: profile };
  }

  @Post('otp/request')
  @SkipCsrf()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: APP_CONSTANTS.THROTTLE.AUTH_LIMIT,
      ttl: APP_CONSTANTS.THROTTLE.AUTH_TTL_MS,
    },
  })
  async requestOtp(
    @Body(new ZodValidationPipe(RequestOtpDtoSchema)) dto: RequestOtpDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.authService.requestOtp(dto, user?.sub);
  }

  @Post('otp/verify')
  @SkipCsrf()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: APP_CONSTANTS.THROTTLE.AUTH_LIMIT,
      ttl: APP_CONSTANTS.THROTTLE.AUTH_TTL_MS,
    },
  })
  async verifyOtp(
    @Body(new ZodValidationPipe(VerifyOtpDtoSchema)) dto: VerifyOtpDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.authService.verifyOtp(dto, user?.sub);
  }

  @Post('password/reset')
  @SkipCsrf()
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: APP_CONSTANTS.THROTTLE.AUTH_LIMIT,
      ttl: APP_CONSTANTS.THROTTLE.AUTH_TTL_MS,
    },
  })
  async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordDtoSchema)) dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto);
  }

  @Post('verification/document')
  @UseGuards(JwtAuthGuard)
  async submitVerificationDocument(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(SubmitEnrollmentDocDtoSchema))
    dto: SubmitEnrollmentDocDto,
  ) {
    return this.authService.submitEnrollmentDocument(user.sub, dto);
  }
}

