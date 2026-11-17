# 03 — Authentication, JWT Security, CSRF, Rate-Limiting & LGPD

## Security Architecture
1. **Password Hashing**:
   - PBKDF2-HMAC-SHA512 / Scrypt / Argon2id using Node's native `node:crypto` (`scrypt` / `argon2` parameters) with per-password cryptographic random salts and constant-time comparison (`timingSafeEqual`).
2. **JWT Access + Rotating Refresh Tokens**:
   - Access Token: 15-minute expiry, signed with HMAC-SHA256, stored in `HttpOnly; SameSite=Lax; Path=/` cookie (`republik_access_token`) and also accepted via `Authorization: Bearer` for API test flexibility.
   - Refresh Token: 7-day expiry, stored in `HttpOnly; SameSite=Lax; Path=/api/auth` cookie (`republik_refresh_token`). Token hash is persisted in `refresh_tokens` table and rotated on every refresh.
3. **CSRF Protection (Double-Submit Cookie + Origin Verification)**:
   - On state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`), a non-HttpOnly `republik_csrf_token` cookie must match the `x-csrf-token` request header (or valid first-party `Origin`).
   - Endpoint `GET /api/auth/csrf` issues/refreshes the CSRF token.
4. **Rate Limiting & Throttling**:
   - `@nestjs/throttler` configured globally (e.g., 100 req/min default) with stricter limits on sensitive auth endpoints (`/api/auth/login`, `/api/auth/otp/*` at 10 req/min).
5. **Security Headers**:
   - Helmet middleware (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`).
6. **LGPD Compliance (Lei nº 13.709/2018)**:
   - WhatsApp number masking on public listing responses when `hideWhatsappForGuests` is enabled and user is not verified/authorized.
   - `GET /api/users/me/lgpd-export`: Exports all user profile data, listings, verification records, and messages as structured JSON.
   - `DELETE /api/users/me`: Permanently deletes the user's account and cascades across listings, tokens, and personal data.

## Status
- [ ] Implement CSRF guard & security headers middleware
- [ ] Implement `@nestjs/throttler` configuration
- [ ] Implement Auth service, controller, guards (`JwtAuthGuard`, `OptionalJwtAuthGuard`, `RolesGuard`)
- [ ] Implement OTP verification & Password Recovery flows
- [ ] Implement LGPD export & account deletion endpoints

