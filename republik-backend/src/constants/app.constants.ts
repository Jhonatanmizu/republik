import { getEnvConfig } from '../config/env.config.js';

const env = getEnvConfig();

export const APP_CONSTANTS = {
  API_PREFIX: env.API_PREFIX,
  DEFAULT_PORT: env.PORT,
  DEFAULT_FRONTEND_ORIGIN: env.FRONTEND_ORIGIN,
  COOKIES: {
    ACCESS_TOKEN: env.COOKIE_ACCESS_NAME,
    REFRESH_TOKEN: env.COOKIE_REFRESH_NAME,
    CSRF_TOKEN: env.COOKIE_CSRF_NAME,
  },
  HEADERS: {
    CSRF_TOKEN: 'x-csrf-token',
    AUTHORIZATION: 'authorization',
  },
  TOKEN_TTL: {
    ACCESS_SECONDS: env.JWT_ACCESS_TTL_SECONDS,
    REFRESH_SECONDS: env.JWT_REFRESH_TTL_SECONDS,
    OTP_SECONDS: env.OTP_TTL_SECONDS,
  },
  THROTTLE: {
    DEFAULT_TTL_MS: env.THROTTLE_DEFAULT_TTL_MS,
    DEFAULT_LIMIT: env.THROTTLE_DEFAULT_LIMIT,
    AUTH_TTL_MS: env.THROTTLE_AUTH_TTL_MS,
    AUTH_LIMIT: env.THROTTLE_AUTH_LIMIT,
  },
} as const;

export const USER_ROLE = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const ENROLLMENT_STATUS = {
  CURSANDO: 'CURSANDO',
  FORMADO: 'FORMADO',
  POS_GRADUACAO: 'POS_GRADUACAO',
} as const;
export type EnrollmentStatus =
  (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

export const VERIFICATION_STATUS = {
  UNVERIFIED: 'UNVERIFIED',
  PENDING_DOC: 'PENDING_DOC',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;
export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export const LISTING_TYPE = {
  HOUSING: 'HOUSING',
  MARKETPLACE: 'MARKETPLACE',
} as const;
export type ListingType = (typeof LISTING_TYPE)[keyof typeof LISTING_TYPE];

export const LISTING_STATUS = {
  DISPONIVEL: 'DISPONIVEL',
  RESERVADO: 'RESERVADO',
  ALUGADO_VENDIDO: 'ALUGADO_VENDIDO',
  PAUSADO: 'PAUSADO',
} as const;
export type ListingStatus =
  (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];

export const HOUSING_MODALITY = {
  QUARTO_INDIVIDUAL: 'QUARTO_INDIVIDUAL',
  SUITE: 'SUITE',
  VAGA_COMPARTILHADA: 'VAGA_COMPARTILHADA',
  REPUBLICA: 'REPUBLICA',
  STUDIO_KITNET: 'STUDIO_KITNET',
} as const;
export type HousingModality =
  (typeof HOUSING_MODALITY)[keyof typeof HOUSING_MODALITY];

export const GENDER_PREFERENCE = {
  MISTO: 'MISTO',
  SO_MENINAS: 'SO_MENINAS',
  SO_MENINOS: 'SO_MENINOS',
} as const;
export type GenderPreference =
  (typeof GENDER_PREFERENCE)[keyof typeof GENDER_PREFERENCE];

export const MARKETPLACE_CATEGORY = {
  MOVEIS: 'MOVEIS',
  ELETRODOMESTICOS: 'ELETRODOMESTICOS',
  ELETRONICOS_ESTUDO: 'ELETRONICOS_ESTUDO',
  UTENSILIOS: 'UTENSILIOS',
  BICICLETAS: 'BICICLETAS',
} as const;
export type MarketplaceCategory =
  (typeof MARKETPLACE_CATEGORY)[keyof typeof MARKETPLACE_CATEGORY];

export const ITEM_CONDITION = {
  NOVO: 'NOVO',
  ESTADO_DE_NOVO: 'ESTADO_DE_NOVO',
  SEMINOVO: 'SEMINOVO',
  USADO: 'USADO',
} as const;
export type ItemCondition =
  (typeof ITEM_CONDITION)[keyof typeof ITEM_CONDITION];

export const OTP_PURPOSE = {
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  RESET_PASSWORD: 'RESET_PASSWORD',
  INSTANT_EDU_VERIFY: 'INSTANT_EDU_VERIFY',
} as const;
export type OtpPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];

export const DOC_VERIFICATION_DECISION = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  NEEDS_RESUBMISSION: 'NEEDS_RESUBMISSION',
} as const;
export type DocVerificationDecision =
  (typeof DOC_VERIFICATION_DECISION)[keyof typeof DOC_VERIFICATION_DECISION];

export const SAFETY_REPORT_STATUS = {
  PENDING: 'PENDING',
  PAUSED_LISTING: 'PAUSED_LISTING',
  BANNED_USER: 'BANNED_USER',
  RESOLVED: 'RESOLVED',
} as const;
export type SafetyReportStatus =
  (typeof SAFETY_REPORT_STATUS)[keyof typeof SAFETY_REPORT_STATUS];
