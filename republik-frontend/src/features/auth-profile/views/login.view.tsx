"use client";

import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes.constants";
import { AUTH_PROFILE_CONSTANTS } from "../auth-profile.constants";
import { useAuthViewModel } from "../view-models/use-auth.vm";

export function LoginView() {
  const { state, actions } = useAuthViewModel();

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Screen 9 g2TWf — Centered Login & Password Recovery Workspace */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Card: Sign-In */}
        <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-8">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-trust-emerald">
              <ShieldCheck className="h-4 w-4" />
              Acesso Seguro JWT + CSRF
            </span>
            <Link
              href={APP_ROUTES.REGISTER}
              className="text-xs font-extrabold text-brand-primary underline"
            >
              {AUTH_PROFILE_CONSTANTS.LOGIN.HEADER_CTA}
            </Link>
          </div>

          <h1 className="mt-3 font-sans text-2xl font-extrabold text-text-primary">
            {AUTH_PROFILE_CONSTANTS.LOGIN.TITLE}
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            {AUTH_PROFILE_CONSTANTS.LOGIN.SUBTITLE}
          </p>

          {state.feedbackMessage ? (
            <div className="mt-4 rounded-xl border border-trust-emerald bg-trust-emerald-light p-3 text-xs font-bold text-trust-emerald-dark">
              {state.feedbackMessage}
            </div>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void actions.submitLogin();
            }}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-text-primary"
              >
                {AUTH_PROFILE_CONSTANTS.LOGIN.EMAIL_LABEL}
              </label>
              <input
                id="login-email"
                type="email"
                value={state.email}
                onChange={(e) => actions.setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-text-primary"
                >
                  {AUTH_PROFILE_CONSTANTS.LOGIN.PASSWORD_LABEL}
                </label>
                <Link
                  href={APP_ROUTES.VERIFY_OTP}
                  className="text-xs font-bold text-brand-primary underline"
                >
                  {AUTH_PROFILE_CONSTANTS.LOGIN.FORGOT_LINK}
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                value={state.password}
                onChange={(e) => actions.setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-primary"
              />
            </div>

            <button
              type="submit"
              disabled={state.isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
            >
              <Lock className="h-4 w-4" />
              <span>{AUTH_PROFILE_CONSTANTS.LOGIN.SUBMIT_CTA}</span>
            </button>
          </form>
        </div>

        {/* Right Card: 6-Digit OTP Password Recovery Flow */}
        <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-light px-3 py-1 text-[11px] font-extrabold text-brand-primary">
            <KeyRound className="h-3.5 w-3.5" />
            <span>{AUTH_PROFILE_CONSTANTS.LOGIN.RECOVERY_HEADER}</span>
          </span>

          <h2 className="mt-3 font-sans text-xl font-extrabold text-text-primary">
            {AUTH_PROFILE_CONSTANTS.LOGIN.RECOVERY_TITLE}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            {AUTH_PROFILE_CONSTANTS.LOGIN.RECOVERY_DESC}
          </p>

          <div className="mt-5 rounded-2xl border border-border-subtle bg-bg-secondary p-4">
            <p className="text-xs font-bold text-text-primary">
              Código enviado para {state.email}
            </p>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {state.otpCode
                .padEnd(6, "0")
                .slice(0, 6)
                .split("")
                .map((digit, index) => (
                  <div
                    key={`digit-${index}-${digit}`}
                    className="flex h-12 items-center justify-center rounded-xl border border-brand-primary bg-white font-mono text-lg font-extrabold text-text-primary"
                  >
                    {digit}
                  </div>
                ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => void actions.submitRequestOtp()}
              className="w-full rounded-xl border border-border-subtle bg-bg-secondary py-2.5 text-xs font-bold text-text-primary"
            >
              Enviar novo código de 6 dígitos (Resend)
            </button>

            <Link
              href={APP_ROUTES.VERIFY_OTP}
              className="block w-full rounded-xl bg-text-primary py-3.5 text-center text-xs font-extrabold text-white"
            >
              {AUTH_PROFILE_CONSTANTS.LOGIN.RECOVERY_CTA}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
