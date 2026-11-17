import { z } from 'zod';

const BooleanStringSchema = z
  .enum(['true', 'false', '1', '0'])
  .transform((val) => val === 'true' || val === '1');

export const BackendEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_PREFIX: z.string().min(1).default('api'),
  BODY_LIMIT: z.string().min(1).default('12mb'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://127.0.0.1:3000'),
  PUBLIC_BACKEND_URL: z.string().url().default('http://localhost:3001'),

  // Database & Seeding (.env driven)
  DATABASE_URL: z
    .string()
    .min(1)
    .default(
      'postgresql://republik:republik_secret_2026@localhost:5432/republik_db',
    ),
  DB_POOL_MAX: z.coerce.number().int().positive().default(20),
  DB_AUTO_MIGRATE: BooleanStringSchema.default('true'),
  DB_AUTO_SEED: BooleanStringSchema.default('true'),
  SEED_DEFAULT_PASSWORD: z.string().min(8).default('Republik@2026'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@republik.com.br'),
  SEED_ADMIN_NAME: z.string().min(2).default('Super Admin Republik'),
  SEED_ADMIN_WHATSAPP: z.string().min(8).default('+55 (11) 99999-0000'),

  // JWT, Cookies & CSRF Security
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default('republik-super-secret-access-key-2026-lgpd'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default('republik-super-secret-refresh-key-2026-lgpd'),
  CSRF_SECRET: z
    .string()
    .min(16)
    .default('republik-csrf-double-submit-secret-2026'),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(604_800),
  OTP_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  EXPOSE_DEMO_OTP: BooleanStringSchema.default('true'),
  COOKIE_ACCESS_NAME: z.string().min(1).default('republik_access_token'),
  COOKIE_REFRESH_NAME: z.string().min(1).default('republik_refresh_token'),
  COOKIE_CSRF_NAME: z.string().min(1).default('republik_csrf_token'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_SECURE: BooleanStringSchema.optional(),

  // Rate Limiting & Security Headers
  THROTTLE_DEFAULT_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_DEFAULT_LIMIT: z.coerce.number().int().positive().default(120),
  THROTTLE_AUTH_TTL_MS: z.coerce.number().int().positive().default(60_000),
  THROTTLE_AUTH_LIMIT: z.coerce.number().int().positive().default(15),
  CSP_CONNECT_SRC: z
    .string()
    .default("'self' http://localhost:3000 http://localhost:3001"),
  HSTS_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(63_072_000),

  // Email Strategy (Resend | Console)
  EMAIL_DRIVER: z.enum(['resend', 'console']).default('resend'),
  RESEND_API_URL: z
    .string()
    .url()
    .default('https://api.resend.com/emails'),
  RESEND_API_KEY: z.string().default(''),
  RESEND_FROM_EMAIL: z
    .string()
    .default('Republik <nao-responda@republik.com.br>'),

  // Storage Strategy (Local | S3)
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  LOCAL_STORAGE_PATH: z.string().min(1).default('./uploads'),
  S3_ENDPOINT: z.string().url().default('http://localhost:9000'),
  S3_REGION: z.string().min(1).default('us-east-1'),
  S3_BUCKET: z.string().min(1).default('republik-uploads'),
  S3_ACCESS_KEY_ID: z.string().default(''),
  S3_SECRET_ACCESS_KEY: z.string().default(''),
  S3_PUBLIC_URL: z.string().default(''),

  // Domain & LGPD Configuration
  RECOGNIZED_ACADEMIC_DOMAINS: z
    .string()
    .default(
      'usp.br,alumni.usp.br,ufba.br,uefs.br,ecomp.uefs.br,unicamp.br,dac.unicamp.br,ufmg.br,ufrj.br,unb.br,ufsc.br,edu.br',
    ),
  LGPD_CONTROLLER_NAME: z
    .string()
    .default('Republik Tecnologia Universitária Ltda.'),
  LGPD_DPO_EMAIL: z.string().email().default('privacidade@republik.com.br'),
  DEFAULT_COVER_PHOTO_HOUSING: z
    .string()
    .url()
    .default(
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
    ),
  DEFAULT_COVER_PHOTO_MARKETPLACE: z
    .string()
    .url()
    .default(
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',
    ),

  // Observability
  OBSERVE_APP_KEY: z.string().default('YOUR_APP_KEY'),
  OBSERVE_APP_SECRET: z.string().default('YOUR_APP_SECRET'),
  OBSERVE_SERVICE_ID: z.string().default('republik-backend'),
});

export type BackendEnvConfig = z.infer<typeof BackendEnvSchema>;

let cachedEnv: BackendEnvConfig | null = null;

export function getEnvConfig(): BackendEnvConfig {
  if (cachedEnv) {
    return cachedEnv;
  }
  const parsed = BackendEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.message}`,
    );
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

