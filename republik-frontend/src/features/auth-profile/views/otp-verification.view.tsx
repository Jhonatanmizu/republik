"use client";

import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { AUTH_PROFILE_CONSTANTS } from "../auth-profile.constants";
import { useAuthViewModel } from "../view-models/use-auth.vm";

export function OtpVerificationView() {
  const { state, actions } = useAuthViewModel();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Screen 12 FhzQG & Mobile 7 h1VHz — Auth Verification & Password Recovery Suite */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Academic Verification Info */}
        <div className="rounded-3xl border border-border-subtle bg-text-primary p-8 text-white lg:col-span-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-emerald px-3.5 py-1 text-xs font-extrabold text-white">
            <ShieldCheck className="h-4 w-4" />
            <span>{AUTH_PROFILE_CONSTANTS.OTP_SUITE.LEFT_BADGE}</span>
          </span>

          <h1 className="mt-4 font-sans text-2xl font-extrabold leading-tight text-white">
            {AUTH_PROFILE_CONSTANTS.OTP_SUITE.LEFT_TITLE}
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-white/80">
            {AUTH_PROFILE_CONSTANTS.OTP_SUITE.LEFT_DESC}
          </p>

          <ul className="mt-6 space-y-3 text-xs font-bold text-trust-emerald-light">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-trust-emerald" />
              <span>Selo Estudante Verificado automático no perfil</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-trust-emerald" />
              <span>Criptografia de ponta e proteção sob a LGPD</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-trust-emerald" />
              <span>Acesso imediato aos grupos e contatos das repúblicas</span>
            </li>
          </ul>
        </div>

        {/* Right: Step 1 OTP & Step 2 New Password */}
        <div className="space-y-6 lg:col-span-7">
          {state.feedbackMessage ? (
            <div className="rounded-2xl border border-trust-emerald bg-trust-emerald-light p-4 text-xs font-bold text-trust-emerald-dark">
              {state.feedbackMessage}
            </div>
          ) : null}

          {/* OTP Verification Card (Also Mobile 7 h1VHz layout) */}
          <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-8">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">
              {AUTH_PROFILE_CONSTANTS.OTP_SUITE.STEP_1_HEADER}
            </span>
            <h2 className="mt-1 font-sans text-xl font-extrabold text-text-primary">
              {AUTH_PROFILE_CONSTANTS.OTP_SUITE.OTP_TITLE}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Enviamos um código de segurança de 6 dígitos para {state.email}
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                maxLength={6}
                value={state.otpCode}
                onChange={(e) => actions.setOtpCode(e.target.value)}
                className="w-full rounded-2xl border-2 border-brand-primary bg-bg-secondary px-4 py-3 text-center font-mono text-2xl font-extrabold tracking-widest text-text-primary sm:w-56"
              />
              <button
                type="button"
                onClick={() => void actions.submitVerifyOtp()}
                className="rounded-2xl bg-brand-primary px-6 py-3.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
              >
                {AUTH_PROFILE_CONSTANTS.OTP_SUITE.VERIFY_CTA}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void actions.submitRequestOtp()}
              className="mt-3 text-xs font-bold text-text-secondary underline hover:text-brand-primary"
            >
              {AUTH_PROFILE_CONSTANTS.OTP_SUITE.RESEND_CTA}
            </button>
          </div>

          {/* Password Reset Card */}
          <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-trust-emerald">
              <KeyRound className="h-3.5 w-3.5" />
              <span>{AUTH_PROFILE_CONSTANTS.OTP_SUITE.RECOVERY_HEADER}</span>
            </span>
            <h2 className="mt-1 font-sans text-xl font-extrabold text-text-primary">
              {AUTH_PROFILE_CONSTANTS.OTP_SUITE.RECOVERY_TITLE}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {AUTH_PROFILE_CONSTANTS.OTP_SUITE.RECOVERY_DESC}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new-password-input"
                  className="block text-xs font-bold text-text-primary"
                >
                  Nova Senha
                </label>
                <input
                  id="new-password-input"
                  type="password"
                  value={state.newPassword}
                  onChange={(e) => actions.setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-primary"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => void actions.submitResetPassword()}
                  className="w-full rounded-xl bg-text-primary py-3 text-xs font-extrabold text-white transition hover:opacity-90"
                >
                  {AUTH_PROFILE_CONSTANTS.OTP_SUITE.UPDATE_PASSWORD_CTA}
                </button>
              </div>
            </div>

            <p className="mt-4 text-xs font-medium text-text-muted">
              {AUTH_PROFILE_CONSTANTS.OTP_SUITE.LGPD_FOOTER}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
