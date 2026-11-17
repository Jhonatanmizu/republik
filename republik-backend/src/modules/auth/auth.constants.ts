import { getEnvConfig } from '../../config/env.config.js';

export const AUTH_MESSAGES = {
  EMAIL_ALREADY_REGISTERED:
    'Este endereço de e-mail já está cadastrado na Republik.',
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos. Verifique seus dados.',
  ACCOUNT_BANNED:
    'Esta conta foi suspensa pela equipe de Segurança & Confiança.',
  REFRESH_TOKEN_MISSING: 'Token de atualização não encontrado.',
  REFRESH_TOKEN_INVALID: 'Sessão expirada. Faça login novamente.',
  OTP_SENT: 'Código de 6 dígitos enviado para o seu e-mail.',
  OTP_INVALID_OR_EXPIRED:
    'Código de verificação inválido ou expirado. Solicite um novo código.',
  PASSWORD_RESET_SUCCESS: 'Senha atualizada com sucesso.',
  LOGGED_OUT: 'Sessão encerrada com segurança.',
  INSTITUTIONAL_EMAIL_REQUIRED:
    'Informe um e-mail institucional válido (.edu.br, .usp.br, .ufba.br, .uefs.br, .unicamp.br, .ufmg.br).',
} as const;

export function getRecognizedAcademicDomains(): string[] {
  const raw = getEnvConfig().RECOGNIZED_ACADEMIC_DOMAINS;
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

export function extractAcademicDomain(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return null;
  if (domain.endsWith('.edu.br') || domain.endsWith('.br')) {
    for (const known of getRecognizedAcademicDomains()) {
      if (domain === known || domain.endsWith(`.${known}`)) {
        return domain;
      }
    }
  }
  return null;
}
