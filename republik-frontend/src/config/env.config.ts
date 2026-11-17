export const FRONTEND_ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api",
  SITE_URL: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://republik.com.br"
  ).replace(/\/$/, ""),
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Republik",
  DPO_EMAIL: process.env.NEXT_PUBLIC_DPO_EMAIL ?? "privacidade@republik.com.br",
  SUPPORT_WHATSAPP: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "5511972331902",
  CSRF_COOKIE_NAME:
    process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME ?? "republik_csrf_token",
  CSRF_HEADER_NAME: process.env.NEXT_PUBLIC_CSRF_HEADER_NAME ?? "x-csrf-token",
} as const;
