"use client";

import {
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { VERIFICATION_MODAL_TEXT } from "../shared-shell.constants";
import { useVerificationModalViewModel } from "../view-models/use-verification-modal.vm";

export interface StudentVerificationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function StudentVerificationModal({
  isOpen,
  onClose,
}: StudentVerificationModalProps) {
  const { state, actions } = useVerificationModalViewModel();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={VERIFICATION_MODAL_TEXT.TITLE}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-2xl md:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label={VERIFICATION_MODAL_TEXT.CLOSE_BUTTON}
          className="absolute top-5 right-5 rounded-full bg-bg-tertiary p-2 text-text-secondary transition hover:bg-brand-primary-light hover:text-brand-primary"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-trust-emerald-light px-3.5 py-1.5 text-xs font-bold tracking-wide text-trust-emerald">
          <ShieldCheck className="h-4 w-4" />
          <span>{VERIFICATION_MODAL_TEXT.BADGE}</span>
        </div>

        <h2 className="font-sans text-2xl font-extrabold text-text-primary md:text-3xl">
          {VERIFICATION_MODAL_TEXT.TITLE}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {VERIFICATION_MODAL_TEXT.SUBTITLE}
        </p>

        {state.feedbackMessage ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-trust-emerald bg-trust-emerald-light p-4 text-sm font-semibold text-trust-emerald-dark">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-trust-emerald" />
            <span>{state.feedbackMessage}</span>
          </div>
        ) : null}

        {state.errorMessage ? (
          <div className="mt-4 rounded-xl border border-brand-primary-border bg-brand-primary-light p-3 text-sm font-medium text-brand-primary">
            {state.errorMessage}
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          {/* Option 1: Instant .edu.br / .usp.br verification */}
          <div className="rounded-2xl border-2 border-trust-emerald/40 bg-trust-emerald-light/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-emerald px-3 py-1 text-xs font-bold text-white">
                <Sparkles className="h-3.5 w-3.5" />
                {VERIFICATION_MODAL_TEXT.OPTION_1.SPEED_TAG}
              </span>
              {state.isDomainRecognized ? (
                <span className="text-xs font-bold text-trust-emerald">
                  {VERIFICATION_MODAL_TEXT.OPTION_1.DOMAIN_RECOGNIZED}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 font-sans text-base font-bold text-text-primary">
              {VERIFICATION_MODAL_TEXT.OPTION_1.TITLE}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              {VERIFICATION_MODAL_TEXT.OPTION_1.DESCRIPTION}
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={state.institutionalEmail}
                onChange={(e) => actions.setInstitutionalEmail(e.target.value)}
                placeholder={VERIFICATION_MODAL_TEXT.OPTION_1.EMAIL_PLACEHOLDER}
                className="flex-1 rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-trust-emerald"
              />
              <button
                type="button"
                disabled={state.isSubmitting}
                onClick={() => void actions.sendInstantOtp()}
                className="rounded-xl bg-trust-emerald px-5 py-3 text-xs font-bold text-white transition hover:bg-trust-emerald-dark disabled:opacity-60"
              >
                {VERIFICATION_MODAL_TEXT.OPTION_1.SEND_CODE_CTA}
              </button>
            </div>

            {state.otpSent ? (
              <div className="mt-4 rounded-xl border border-border-subtle bg-white p-4">
                <label
                  htmlFor="instant-otp-input"
                  className="block text-xs font-bold text-text-primary"
                >
                  {VERIFICATION_MODAL_TEXT.OPTION_1.OTP_LABEL}
                  {state.demoOtpHint
                    ? ` (Código de demonstração: ${state.demoOtpHint})`
                    : ""}
                </label>
                <div className="mt-2 flex gap-3">
                  <input
                    id="instant-otp-input"
                    type="text"
                    maxLength={6}
                    value={state.otpCode}
                    onChange={(e) => actions.setOtpCode(e.target.value)}
                    className="w-40 rounded-xl border border-border-subtle px-4 py-2.5 text-center font-mono text-lg font-bold tracking-widest text-text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => void actions.confirmInstantOtp()}
                    className="rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-95"
                  >
                    {VERIFICATION_MODAL_TEXT.OPTION_1.VERIFY_OTP_CTA}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Option 2: Manual Enrollment Certificate PDF/Photo */}
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-amber-light px-3 py-1 text-xs font-bold text-warning-amber">
              <GraduationCap className="h-3.5 w-3.5" />
              {VERIFICATION_MODAL_TEXT.OPTION_2.TAG}
            </span>

            <h3 className="mt-3 font-sans text-base font-bold text-text-primary">
              {VERIFICATION_MODAL_TEXT.OPTION_2.TITLE}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              {VERIFICATION_MODAL_TEXT.OPTION_2.DESCRIPTION}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={state.universityName}
                onChange={(e) => actions.setUniversityName(e.target.value)}
                placeholder={VERIFICATION_MODAL_TEXT.OPTION_2.UNI_PLACEHOLDER}
                className="rounded-xl border border-border-subtle bg-white px-3.5 py-2.5 text-xs font-medium text-text-primary"
              />
              <input
                type="text"
                value={state.registrationNumber}
                onChange={(e) => actions.setRegistrationNumber(e.target.value)}
                placeholder={VERIFICATION_MODAL_TEXT.OPTION_2.RA_PLACEHOLDER}
                className="rounded-xl border border-border-subtle bg-white px-3.5 py-2.5 text-xs font-medium text-text-primary"
              />
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border-subtle bg-white px-4 py-2.5 text-xs font-semibold text-text-secondary hover:border-brand-primary">
                <Upload className="h-4 w-4 text-brand-primary" />
                <span>{state.selectedFileName}</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      actions.setSelectedFileName(file.name);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                disabled={state.isSubmitting}
                onClick={() => void actions.submitEnrollmentDocument()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-text-primary px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>{VERIFICATION_MODAL_TEXT.OPTION_2.SUBMIT_DOC_CTA}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
