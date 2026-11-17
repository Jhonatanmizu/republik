# 01 — Infrastructure, Docker Compose & Strategy Adapters

## Decisions & Architecture
1. **Docker Compose Topology (`docker-compose.yml`)**:
   - `postgres`: PostgreSQL 17 Alpine with healthcheck, persistent volume, and `pg_trgm` / `unaccent` extensions initialized.
   - `backend`: NestJS 12 ESM container (`republik-backend`), running `.env`-controlled schema sync (`DB_AUTO_MIGRATE`) and seeding (`DB_AUTO_SEED`) on startup.
   - `frontend`: Next.js 16 container (`republik-frontend`) connected to `backend`.
   - Removed the deprecated `quay.io/minio/minio:latest` container so `docker compose up` starts `postgres`, `backend`, and `frontend` without any registry 401 errors. S3 storage connects to any S3-compatible endpoint configured via `S3_ENDPOINT` in `.env`, while `STORAGE_DRIVER=local` stores files in `/app/uploads`.
2. **Centralized `.env` Configuration**:
   - Backend: `src/config/env.config.ts` validates all environment variables via Zod (`BackendEnvSchema`), including database seeding flags (`DB_AUTO_MIGRATE`, `DB_AUTO_SEED`, `SEED_DEFAULT_PASSWORD`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME`, `SEED_ADMIN_WHATSAPP`), JWT/CSRF secrets & TTLs, cookie names, rate-limit thresholds, CSP/HSTS headers, Resend/S3 credentials, academic domains, and LGPD metadata.
   - Standalone CLI Seed Runner: `npm run db:seed` (`src/database/seed.cli.ts`).
   - Frontend: `src/config/env.config.ts` centralizes `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_DPO_EMAIL`, `NEXT_PUBLIC_SUPPORT_WHATSAPP`, `NEXT_PUBLIC_CSRF_COOKIE_NAME`, and `NEXT_PUBLIC_CSRF_HEADER_NAME`.
3. **Email Strategy Pattern (`src/shared/mail/`)**:
   - Port interface: `EmailServicePort` (`sendOtpEmail`).
   - Concrete Strategy 1: `ResendEmailStrategy` — sends transactional HTML emails via `RESEND_API_URL` using `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
   - Concrete Strategy 2: `ConsoleEmailStrategy` — logs structured email payloads and OTP codes when `EMAIL_DRIVER=console` or `RESEND_API_KEY` is empty.
4. **Storage Strategy Pattern (`src/shared/storage/`)**:
   - Port interface: `StorageServicePort` (`uploadFile`, `deleteFile`).
   - Concrete Strategy 1: `LocalStorageStrategy` — stores uploaded files under `LOCAL_STORAGE_PATH` and serves them using `PUBLIC_BACKEND_URL`.
   - Concrete Strategy 2: `S3StorageStrategy` — uploads objects to AWS S3 / S3-compatible storage (`STORAGE_DRIVER=s3`).

## Status
- [x] Create `docker-compose.yml`
- [x] Create `republik-backend/Dockerfile` and `republik-frontend/Dockerfile`
- [x] Centralize all configuration into `.env` + `env.config.ts` (Backend & Frontend)
- [x] Implement `.env`-driven seeding (`DB_AUTO_SEED`) and `npm run db:seed`
- [x] Implement `StorageServicePort`, `LocalStorageStrategy`, `S3StorageStrategy`
- [x] Implement `EmailServicePort`, `ResendEmailStrategy`, `ConsoleEmailStrategy`
