import { timingSafeEqual } from 'node:crypto';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestMiddleware,
  PipeTransform,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { getEnvConfig } from '../../config/env.config.js';
import { APP_CONSTANTS, USER_ROLE } from '../../constants/app.constants.js';
import {
  generateRandomToken,
  type JwtPayload,
  verifyJwtToken,
} from '../crypto/crypto.util.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const SKIP_CSRF_KEY = 'SKIP_CSRF_CHECK';
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);

export function parseCookieHeader(
  cookieHeader: string | undefined,
): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const pair of cookieHeader.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) {
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
}

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const env = getEnvConfig();
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src ${env.CSP_CONNECT_SRC}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()',
    );
    res.setHeader(
      'Strict-Transport-Security',
      `max-age=${env.HSTS_MAX_AGE_SECONDS}; includeSubDomains; preload`,
    );
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    const cookies = parseCookieHeader(req.headers.cookie);
    if (!cookies[APP_CONSTANTS.COOKIES.CSRF_TOKEN]) {
      const csrfToken = generateRandomToken(24);
      const isSecure = env.COOKIE_SECURE ?? env.NODE_ENV === 'production';
      res.cookie(APP_CONSTANTS.COOKIES.CSRF_TOKEN, csrfToken, {
        httpOnly: false,
        sameSite: env.COOKIE_SAME_SITE,
        secure: isSecure,
        path: '/',
        maxAge: APP_CONSTANTS.TOKEN_TTL.REFRESH_SECONDS * 1000,
      });
    }

    next();
  }
}

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const cookies = parseCookieHeader(req.headers.cookie);
    const csrfCookie = cookies[APP_CONSTANTS.COOKIES.CSRF_TOKEN];
    const csrfHeaderRaw = req.headers[APP_CONSTANTS.HEADERS.CSRF_TOKEN];
    const csrfHeader = Array.isArray(csrfHeaderRaw)
      ? csrfHeaderRaw[0]
      : csrfHeaderRaw;

    if (csrfCookie && csrfHeader) {
      const cookieBuf = Buffer.from(csrfCookie);
      const headerBuf = Buffer.from(csrfHeader);
      if (
        cookieBuf.length === headerBuf.length &&
        timingSafeEqual(cookieBuf, headerBuf)
      ) {
        return true;
      }
      throw new ForbiddenException('CSRF token mismatch.');
    }

    const hasAuthCookie = Boolean(
      cookies[APP_CONSTANTS.COOKIES.ACCESS_TOKEN] ||
      cookies[APP_CONSTANTS.COOKIES.REFRESH_TOKEN],
    );
    if (hasAuthCookie) {
      throw new ForbiddenException(
        'Missing or invalid x-csrf-token header for cookie-authenticated session.',
      );
    }

    return true;
  }
}

function extractAccessToken(req: Request): string | null {
  const cookies = parseCookieHeader(req.headers.cookie);
  const cookieToken = cookies[APP_CONSTANTS.COOKIES.ACCESS_TOKEN];
  if (cookieToken) {
    return cookieToken;
  }
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractAccessToken(req);
    if (!token) {
      throw new UnauthorizedException(
        'Autenticação necessária. Faça login na sua conta Republik.',
      );
    }
    const secret = getEnvConfig().JWT_ACCESS_SECRET;
    const payload = verifyJwtToken(token, secret);
    if (!payload) {
      throw new UnauthorizedException('Sessão expirada ou token inválido.');
    }
    req.user = payload;
    return true;
  }
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractAccessToken(req);
    if (!token) {
      return true;
    }
    const secret = getEnvConfig().JWT_ACCESS_SECRET;
    const payload = verifyJwtToken(token, secret);
    if (payload) {
      req.user = payload;
    }
    return true;
  }
}

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.user || req.user.role !== USER_ROLE.ADMIN) {
      throw new ForbiddenException(
        'Acesso restrito à equipe de moderação Trust & Safety da Republik.',
      );
    }
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) { }

  transform(value: unknown): T {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const message = firstIssue
        ? `${firstIssue.path.join('.') || 'campo'}: ${firstIssue.message}`
        : 'Dados inválidos na requisição.';
      throw new BadRequestException({
        message,
        issues: parsed.error.issues,
      });
    }
    return parsed.data;
  }
}
