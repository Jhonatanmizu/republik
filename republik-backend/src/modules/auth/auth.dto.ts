import { z } from 'zod';
import {
  ENROLLMENT_STATUS,
  OTP_PURPOSE,
} from '../../constants/app.constants.js';

export const RegisterDtoSchema = z.object({
  fullName: z.string().min(2, 'Informe seu nome completo.').max(120),
  email: z.string().email('Informe um e-mail válido.').toLowerCase(),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .max(128),
  whatsapp: z.string().min(8, 'Informe seu WhatsApp com DDD.').max(30),
  universityCode: z.string().min(2).max(20).optional().default('UEFS'),
  courseName: z.string().min(2).max(120).optional().default('Graduação'),
  courseSemester: z.string().min(1).max(40).optional().default('1º Semestre'),
  enrollmentStatus: z
    .enum([
      ENROLLMENT_STATUS.CURSANDO,
      ENROLLMENT_STATUS.FORMADO,
      ENROLLMENT_STATUS.POS_GRADUACAO,
    ])
    .optional()
    .default(ENROLLMENT_STATUS.CURSANDO),
  acceptLgpdTerms: z.boolean().refine((val) => val === true, {
    message: 'É necessário aceitar os Termos de Uso e Política LGPD.',
  }),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email('Informe um e-mail válido.').toLowerCase(),
  password: z.string().min(1, 'Informe sua senha.'),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const RequestOtpDtoSchema = z.object({
  email: z.string().email('Informe um e-mail válido.').toLowerCase(),
  purpose: z
    .enum([
      OTP_PURPOSE.VERIFY_EMAIL,
      OTP_PURPOSE.RESET_PASSWORD,
      OTP_PURPOSE.INSTANT_EDU_VERIFY,
    ])
    .default(OTP_PURPOSE.INSTANT_EDU_VERIFY),
});

export type RequestOtpDto = z.infer<typeof RequestOtpDtoSchema>;

export const VerifyOtpDtoSchema = z.object({
  email: z.string().email('Informe um e-mail válido.').toLowerCase(),
  code: z
    .string()
    .length(6, 'O código deve conter exatamente 6 dígitos.')
    .regex(/^\d{6}$/, 'O código deve conter apenas números.'),
  purpose: z
    .enum([
      OTP_PURPOSE.VERIFY_EMAIL,
      OTP_PURPOSE.RESET_PASSWORD,
      OTP_PURPOSE.INSTANT_EDU_VERIFY,
    ])
    .default(OTP_PURPOSE.INSTANT_EDU_VERIFY),
});

export type VerifyOtpDto = z.infer<typeof VerifyOtpDtoSchema>;

export const ResetPasswordDtoSchema = z.object({
  email: z.string().email('Informe um e-mail válido.').toLowerCase(),
  code: z
    .string()
    .length(6, 'O código deve conter 6 dígitos.')
    .regex(/^\d{6}$/),
  newPassword: z
    .string()
    .min(8, 'A nova senha deve ter no mínimo 8 caracteres.')
    .max(128),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;

export const SubmitEnrollmentDocDtoSchema = z.object({
  universityName: z.string().min(2).max(120),
  registrationNumber: z.string().min(3).max(40),
  documentName: z.string().min(3).max(180),
  documentUrl: z.string().min(3).max(500),
});

export type SubmitEnrollmentDocDto = z.infer<
  typeof SubmitEnrollmentDocDtoSchema
>;

