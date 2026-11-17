"use client";

import { CheckCircle2, Download, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes.constants";
import { AUTH_PROFILE_CONSTANTS } from "../auth-profile.constants";
import { useUserProfileViewModel } from "../view-models/use-user-profile.vm";

export function UserProfileView() {
  const { state, actions } = useUserProfileViewModel();

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Header Card (Screen 10 n3QYlm) */}
      <section className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-text-primary font-sans text-2xl font-extrabold text-white">
              JM
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-sans text-2xl font-extrabold text-text-primary">
                  {state.fullName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-trust-emerald-light px-3 py-1 text-xs font-extrabold text-trust-emerald">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {AUTH_PROFILE_CONSTANTS.PROFILE.VERIFIED_BADGE}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-text-primary">
                Cursando • {state.universityCode} (Engenharia de Computação)
              </p>
              <p className="text-xs text-text-secondary">
                {AUTH_PROFILE_CONSTANTS.PROFILE.SUBTITLE}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={state.isSaving}
            onClick={() => void actions.saveProfile()}
            className="rounded-xl bg-brand-primary px-6 py-3 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
          >
            {AUTH_PROFILE_CONSTANTS.PROFILE.SAVE_CTA}
          </button>
        </div>

        {state.feedbackMessage ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-trust-emerald bg-trust-emerald-light px-4 py-3 text-xs font-bold text-trust-emerald-dark">
            <CheckCircle2 className="h-4 w-4" />
            <span>{state.feedbackMessage}</span>
          </div>
        ) : null}

        {/* Form Fields */}
        <div className="mt-6 border-t border-border-subtle pt-6">
          <h2 className="font-sans text-lg font-extrabold text-text-primary">
            {AUTH_PROFILE_CONSTANTS.PROFILE.FORM_TITLE}
          </h2>
          <p className="text-xs text-text-secondary">
            {AUTH_PROFILE_CONSTANTS.PROFILE.FORM_SUB}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-bold text-text-secondary"
              >
                Nome completo
              </label>
              <input
                id="profile-name"
                type="text"
                value={state.fullName}
                onChange={(e) => actions.setFullName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-2.5 text-sm font-semibold text-text-primary"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-bold text-text-secondary"
              >
                E-mail universitário / login
              </label>
              <input
                id="profile-email"
                type="email"
                readOnly
                value={state.email}
                className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-2.5 text-sm font-semibold text-text-secondary"
              />
            </div>

            <div>
              <label
                htmlFor="profile-whatsapp"
                className="block text-xs font-bold text-text-secondary"
              >
                Número do WhatsApp (Conexão direta nos anúncios)
              </label>
              <input
                id="profile-whatsapp"
                type="text"
                value={state.whatsapp}
                onChange={(e) => actions.setWhatsapp(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-2.5 text-sm font-semibold text-text-primary"
              />
            </div>

            <div>
              <label
                htmlFor="profile-semester"
                className="block text-xs font-bold text-text-secondary"
              >
                Status do curso
              </label>
              <input
                id="profile-semester"
                type="text"
                value={state.courseSemester}
                onChange={(e) => actions.setCourseSemester(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-2.5 text-sm font-semibold text-text-primary"
              />
            </div>
          </div>

          {/* WhatsApp LGPD Privacy Toggle */}
          <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-trust-emerald/40 bg-trust-emerald-light/40 p-4">
            <div>
              <p className="text-xs font-extrabold text-text-primary">
                {AUTH_PROFILE_CONSTANTS.PROFILE.WHATSAPP_PRIVACY_TITLE}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {AUTH_PROFILE_CONSTANTS.PROFILE.WHATSAPP_PRIVACY_DESC}
              </p>
            </div>
            <input
              type="checkbox"
              checked={state.hideWhatsappForGuests}
              onChange={(e) =>
                actions.setHideWhatsappForGuests(e.target.checked)
              }
              className="h-5 w-5 accent-trust-emerald"
            />
          </label>
        </div>
      </section>

      {/* Active Listings Summary */}
      <section className="mt-6 rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-extrabold text-text-primary">
            {AUTH_PROFILE_CONSTANTS.PROFILE.ACTIVE_LISTINGS_TITLE}
          </h2>
          <Link
            href={APP_ROUTES.DASHBOARD}
            className="text-xs font-extrabold text-brand-primary underline"
          >
            {AUTH_PROFILE_CONSTANTS.PROFILE.MANAGE_ALL}
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-4">
            <span className="text-[10px] font-extrabold uppercase text-brand-primary">
              VAGA EM REPÚBLICA
            </span>
            <h3 className="mt-1 font-sans text-sm font-extrabold text-text-primary">
              Quarto Individual Mobiliado • Bairro Cidade Nova (em frente à
              UEFS)
            </h3>
            <p className="mt-2 font-sans text-base font-extrabold text-trust-emerald">
              R$ 550 /mês (c/ contas) • Disponível
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-4">
            <span className="text-[10px] font-extrabold uppercase text-brand-primary">
              DESAPEGO • MÓVEL
            </span>
            <h3 className="mt-1 font-sans text-sm font-extrabold text-text-primary">
              Escrivaninha de Estudo 1,20m + Cadeira Giratória Preta
            </h3>
            <p className="mt-2 font-sans text-base font-extrabold text-trust-emerald">
              R$ 240 • Disponível
            </p>
          </div>
        </div>
      </section>

      {/* LGPD Portability & Account Deletion Section */}
      <section className="mt-6 rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-extrabold text-text-primary">
            {AUTH_PROFILE_CONSTANTS.PROFILE.LGPD_SECTION_TITLE}
          </h2>
          <Link
            href={APP_ROUTES.LGPD}
            className="text-xs font-extrabold text-brand-primary underline"
          >
            {AUTH_PROFILE_CONSTANTS.PROFILE.LGPD_PAGE_LINK}
          </Link>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          {AUTH_PROFILE_CONSTANTS.PROFILE.LGPD_SECTION_DESC}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void actions.exportMyDataLgpd()}
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-secondary px-4 py-2.5 text-xs font-extrabold text-text-primary transition hover:border-brand-primary"
          >
            <Download className="h-4 w-4 text-brand-primary" />
            <span>{AUTH_PROFILE_CONSTANTS.PROFILE.EXPORT_DATA_CTA}</span>
          </button>

          <button
            type="button"
            onClick={() => void actions.deleteMyAccount()}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-primary-border bg-brand-primary-light px-4 py-2.5 text-xs font-extrabold text-brand-primary"
          >
            <Trash2 className="h-4 w-4" />
            <span>{AUTH_PROFILE_CONSTANTS.PROFILE.DELETE_ACCOUNT_CTA}</span>
          </button>
        </div>

        {state.exportedLgpdJson ? (
          <pre className="mt-4 max-h-60 overflow-auto rounded-2xl bg-text-primary p-4 font-mono text-[11px] text-white">
            {state.exportedLgpdJson}
          </pre>
        ) : null}
      </section>
    </div>
  );
}
