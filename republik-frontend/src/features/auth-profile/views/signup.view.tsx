"use client";

import { CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes.constants";
import { AUTH_PROFILE_CONSTANTS } from "../auth-profile.constants";
import { useAuthViewModel } from "../view-models/use-auth.vm";

export function SignUpView() {
  const { state, actions } = useAuthViewModel();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Main Split Content (Screen 8 LD2ge) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Academic Trust & Community Value Proposition */}
        <div className="space-y-6 rounded-3xl border border-border-subtle bg-text-primary p-8 text-white lg:col-span-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-extrabold text-brand-primary">
            <GraduationCap className="h-4 w-4" />
            <span>{AUTH_PROFILE_CONSTANTS.SIGNUP.LEFT_PILL}</span>
          </span>

          <blockquote className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-sm italic leading-relaxed text-white/90">
              {AUTH_PROFILE_CONSTANTS.SIGNUP.QUOTE}
            </p>
            <footer className="mt-3 text-xs font-bold text-trust-emerald-light">
              {AUTH_PROFILE_CONSTANTS.SIGNUP.QUOTE_AUTHOR}
            </footer>
          </blockquote>

          <div className="space-y-4 pt-2">
            <h2 className="font-sans text-lg font-extrabold text-white">
              {AUTH_PROFILE_CONSTANTS.SIGNUP.WHY_TITLE}
            </h2>
            {AUTH_PROFILE_CONSTANTS.SIGNUP.BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-trust-emerald" />
                <div>
                  <h3 className="text-sm font-bold text-white">{b.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/75">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sign-Up & Academic Link Form */}
        <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-8 lg:col-span-7">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-primary">
              {AUTH_PROFILE_CONSTANTS.SIGNUP.FORM_PILL}
            </span>
            <Link
              href={APP_ROUTES.LOGIN}
              className="text-xs font-extrabold text-text-secondary underline hover:text-brand-primary"
            >
              {AUTH_PROFILE_CONSTANTS.SIGNUP.HEADER_CTA}
            </Link>
          </div>

          <h1 className="mt-2 font-sans text-2xl font-extrabold text-text-primary sm:text-3xl">
            {AUTH_PROFILE_CONSTANTS.SIGNUP.FORM_TITLE}
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            {AUTH_PROFILE_CONSTANTS.SIGNUP.FORM_SUBTITLE}
          </p>

          {state.errorMessage ? (
            <div className="mt-4 rounded-xl border border-brand-primary-border bg-brand-primary-light p-3 text-xs font-bold text-brand-primary">
              {state.errorMessage}
            </div>
          ) : null}

          {state.feedbackMessage ? (
            <div className="mt-4 rounded-xl border border-trust-emerald bg-trust-emerald-light p-3 text-xs font-bold text-trust-emerald-dark">
              {state.feedbackMessage}
            </div>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void actions.submitRegister();
            }}
            className="mt-6 space-y-5"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              {AUTH_PROFILE_CONSTANTS.SIGNUP.SECTION_1}
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-bold text-text-primary"
                >
                  {AUTH_PROFILE_CONSTANTS.SIGNUP.NAME_LABEL}
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={state.fullName}
                  onChange={(e) => actions.setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm font-semibold text-text-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-bold text-text-primary"
                  >
                    {AUTH_PROFILE_CONSTANTS.SIGNUP.EMAIL_LABEL}
                  </label>
                  <span className="text-[10px] font-extrabold text-trust-emerald">
                    {AUTH_PROFILE_CONSTANTS.SIGNUP.ACADEMIC_EMAIL_BADGE}
                  </span>
                </div>
                <input
                  id="signup-email"
                  type="email"
                  value={state.email}
                  onChange={(e) => actions.setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm font-semibold text-text-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-whatsapp"
                className="block text-xs font-bold text-text-primary"
              >
                {AUTH_PROFILE_CONSTANTS.SIGNUP.WHATSAPP_LABEL}
              </label>
              <p className="text-[11px] text-text-muted">
                {AUTH_PROFILE_CONSTANTS.SIGNUP.WHATSAPP_HINT}
              </p>
              <input
                id="signup-whatsapp"
                type="text"
                value={state.whatsapp}
                onChange={(e) => actions.setWhatsapp(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm font-semibold text-text-primary"
              />
            </div>

            <p className="border-t border-border-subtle pt-4 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              {AUTH_PROFILE_CONSTANTS.SIGNUP.SECTION_2}
            </p>

            <div>
              <span className="block text-xs font-bold text-text-primary">
                {AUTH_PROFILE_CONSTANTS.SIGNUP.UNI_LABEL}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {AUTH_PROFILE_CONSTANTS.SIGNUP.UNI_CHIPS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => actions.setUniversityCode(u)}
                    className={`rounded-xl border px-4 py-2 text-xs font-extrabold transition ${
                      state.universityCode === u
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-border-subtle bg-bg-secondary text-text-secondary"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-text-primary">
                {AUTH_PROFILE_CONSTANTS.SIGNUP.STATUS_LABEL}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {AUTH_PROFILE_CONSTANTS.SIGNUP.STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => actions.setEnrollmentStatus(opt.id)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                      state.enrollmentStatus === opt.id
                        ? "border-text-primary bg-text-primary text-white"
                        : "border-border-subtle bg-bg-secondary text-text-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-bold text-text-primary"
                >
                  {AUTH_PROFILE_CONSTANTS.SIGNUP.PASSWORD_LABEL}
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={state.password}
                  onChange={(e) => actions.setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm font-semibold text-text-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="signup-confirm-password"
                    className="block text-xs font-bold text-text-primary"
                  >
                    {AUTH_PROFILE_CONSTANTS.SIGNUP.CONFIRM_PASSWORD_LABEL}
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-trust-emerald">
                    <CheckCircle2 className="h-3 w-3" />
                    As senhas coincidem
                  </span>
                </div>
                <input
                  id="signup-confirm-password"
                  type="password"
                  value={state.confirmPassword}
                  onChange={(e) => actions.setConfirmPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm font-semibold text-text-primary"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-bg-secondary p-3.5 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={state.acceptLgpd}
                onChange={(e) => actions.setAcceptLgpd(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-primary"
              />
              <span>{AUTH_PROFILE_CONSTANTS.SIGNUP.LGPD_CONSENT}</span>
            </label>

            <button
              type="submit"
              disabled={state.isSubmitting}
              className="w-full rounded-xl bg-brand-primary py-3.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
            >
              {AUTH_PROFILE_CONSTANTS.SIGNUP.SUBMIT_CTA}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
