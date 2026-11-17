import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { getEnvConfig } from '../../config/env.config.js';

export const EMAIL_SERVICE_PORT = Symbol('EMAIL_SERVICE_PORT');

export interface SendOtpEmailInput {
  readonly to: string;
  readonly code: string;
  readonly purpose: string;
}

export interface EmailServicePort {
  sendOtpEmail(
    input: SendOtpEmailInput,
  ): Promise<{ delivered: boolean; provider: string }>;
}

@Injectable()
export class ConsoleEmailStrategy implements EmailServicePort {
  private readonly logger = new Logger(ConsoleEmailStrategy.name);

  async sendOtpEmail(
    input: SendOtpEmailInput,
  ): Promise<{ delivered: boolean; provider: string }> {
    this.logger.log(
      `[ConsoleEmailStrategy] OTP (${input.purpose}) for ${input.to}: ${input.code}`,
    );
    return { delivered: true, provider: 'console' };
  }
}

@Injectable()
export class ResendEmailStrategy implements EmailServicePort {
  private readonly logger = new Logger(ResendEmailStrategy.name);
  private readonly fallback = new ConsoleEmailStrategy();

  async sendOtpEmail(
    input: SendOtpEmailInput,
  ): Promise<{ delivered: boolean; provider: string }> {
    const env = getEnvConfig();
    const apiKey = env.RESEND_API_KEY.trim();
    const fromEmail = env.RESEND_FROM_EMAIL;

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not configured in .env; falling back to ConsoleEmailStrategy.',
      );
      return this.fallback.sendOtpEmail(input);
    }

    const response = await fetch(env.RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [input.to],
        subject: `Seu código de verificação Republik: ${input.code}`,
        html: `<div style="font-family:sans-serif;color:#1B2925;padding:24px;">
          <h2 style="color:#F64A33;">Republik — Comunidade Universitária Verificada</h2>
          <p>Use o código de 6 dígitos abaixo para confirmar sua ação (${input.purpose}):</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:6px;padding:16px;background:#FFF1ED;border-radius:12px;display:inline-block;">${input.code}</div>
          <p style="color:#52615B;font-size:13px;margin-top:16px;">Protegido sob a LGPD (Lei nº 13.709/2018).</p>
        </div>`,
      }),
    });

    if (!response.ok) {
      this.logger.error(`Resend API returned status ${response.status}`);
      return this.fallback.sendOtpEmail(input);
    }

    return { delivered: true, provider: 'resend' };
  }
}

@Global()
@Module({
  providers: [
    ConsoleEmailStrategy,
    ResendEmailStrategy,
    {
      provide: EMAIL_SERVICE_PORT,
      inject: [ResendEmailStrategy, ConsoleEmailStrategy],
      useFactory: (
        resendStrategy: ResendEmailStrategy,
        consoleStrategy: ConsoleEmailStrategy,
      ): EmailServicePort => {
        const env = getEnvConfig();
        return env.EMAIL_DRIVER === 'console'
          ? consoleStrategy
          : resendStrategy;
      },
    },
  ],
  exports: [EMAIL_SERVICE_PORT],
})
export class MailModule {}
