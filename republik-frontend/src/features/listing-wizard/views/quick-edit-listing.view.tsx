"use client";

import {
  Check,
  CheckCircle2,
  Eye,
  Heart,
  MessageSquare,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes.constants";
import { formatCurrencyBRL } from "@/features/shared-shell/models/domain.model";
import { LISTING_WIZARD_CONSTANTS } from "../listing-wizard.constants";
import { useListingEditorViewModel } from "../view-models/use-listing-editor.vm";

export interface QuickEditListingViewProps {
  readonly listingId: string;
}

export function QuickEditListingView({ listingId }: QuickEditListingViewProps) {
  const { state, computed, actions } = useListingEditorViewModel(listingId);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Top Bar & Status Switcher (Screen 14 zwaYK) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-primary p-5 shadow-xs">
        <div>
          <p className="text-xs font-bold text-text-secondary">
            {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.BREADCRUMB_PREFIX} #
            {state.listing.code} ({state.title})
          </p>
          <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-extrabold text-trust-emerald">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.SYNC_BADGE}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.STATUS_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => actions.setStatus(t.id)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                state.status === t.id
                  ? "border-trust-emerald bg-trust-emerald text-white"
                  : "border-border-subtle bg-bg-secondary text-text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}

          <button
            type="button"
            disabled={state.isSaving}
            onClick={() => void actions.saveChanges()}
            className="rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:opacity-95"
          >
            {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.SAVE_CTA}
          </button>
        </div>
      </div>

      {state.saveSuccess ? (
        <div className="mt-4 rounded-xl border border-trust-emerald bg-trust-emerald-light p-3.5 text-xs font-bold text-trust-emerald-dark">
          {state.saveSuccess}
        </div>
      ) : null}

      {/* Main Two-Column Editor & Live Preview (Node zoy6R) */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Form Sections 1, 2, 3 */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Photos */}
          <section className="rounded-2xl border border-border-subtle bg-bg-primary p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-sans text-base font-extrabold text-text-primary">
                {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.SECTION_1}
              </h2>
              <span className="text-xs font-bold text-trust-emerald">
                {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.PHOTOS_BADGE}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="relative h-28 overflow-hidden rounded-xl border-2 border-brand-primary">
                <Image
                  unoptimized
                  width={300}
                  height={200}
                  src={state.listing.coverPhotoUrl}
                  alt="Foto de capa"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.COVER_BADGE}
                </span>
              </div>
              <div className="relative h-28 overflow-hidden rounded-xl border border-border-subtle">
                <Image
                  unoptimized
                  width={300}
                  height={200}
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80"
                  alt="Foto secundária"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative h-28 overflow-hidden rounded-xl border border-border-subtle">
                <Image
                  unoptimized
                  width={300}
                  height={200}
                  src="https://images.unsplash.com/photo-1540518614846-7ede433c4efb?auto=format&fit=crop&w=400&q=80"
                  alt="Foto 3"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-bg-secondary text-center">
                <span className="text-xs font-bold text-brand-primary">
                  {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.ADD_PHOTOS}
                </span>
                <span className="text-[10px] text-text-muted">
                  Arraste ou clique
                </span>
              </div>
            </div>
          </section>

          {/* 2. Monthly Values & Included Expenses */}
          <section className="rounded-2xl border border-border-subtle bg-bg-primary p-6">
            <h2 className="font-sans text-base font-extrabold text-text-primary">
              {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.SECTION_2}
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="edit-rent"
                  className="block text-xs font-bold text-text-secondary"
                >
                  {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.RENT_INPUT}
                </label>
                <input
                  id="edit-rent"
                  type="number"
                  value={state.baseRentReais}
                  onChange={(e) =>
                    actions.setBaseRentReais(Number(e.target.value))
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm font-bold text-text-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-condo"
                  className="block text-xs font-bold text-text-secondary"
                >
                  {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.CONDO_INPUT}
                </label>
                <input
                  id="edit-condo"
                  type="number"
                  value={state.condoReais}
                  onChange={(e) =>
                    actions.setCondoReais(Number(e.target.value))
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm font-bold text-text-primary"
                />
              </div>
              <div className="rounded-xl border border-trust-emerald/40 bg-trust-emerald-light p-3">
                <span className="block text-[11px] font-bold text-trust-emerald-dark">
                  {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.TOTAL_DISPLAY}
                </span>
                <span className="font-sans text-lg font-extrabold text-trust-emerald">
                  {formatCurrencyBRL(computed.totalMonthlyCents)} /mês
                </span>
              </div>
            </div>

            <div className="mt-4">
              <span className="block text-xs font-bold text-text-secondary">
                {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.EXPENSES_TITLE}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.EXPENSE_OPTIONS.map(
                  (exp) => {
                    const active = state.includedExpenses.includes(exp.id);
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => actions.toggleExpense(exp.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                          active
                            ? "border-trust-emerald bg-trust-emerald-light text-trust-emerald"
                            : "border-border-subtle bg-bg-secondary text-text-secondary"
                        }`}
                      >
                        {active ? <Check className="h-3.5 w-3.5" /> : null}
                        <span>{exp.label}</span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </section>

          {/* 3. House Rules & Coexistence Profile */}
          <section className="rounded-2xl border border-border-subtle bg-bg-primary p-6">
            <h2 className="font-sans text-base font-extrabold text-text-primary">
              {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.SECTION_3}
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-gender"
                  className="block text-xs font-bold text-text-secondary"
                >
                  Preferência de Gênero
                </label>
                <select
                  id="edit-gender"
                  value={state.genderPreference}
                  onChange={(e) =>
                    actions.setGenderPreference(
                      e.target.value as "MISTO" | "SO_MENINAS" | "SO_MENINOS",
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-xs font-bold text-text-primary"
                >
                  <option value="MISTO">Misto (Meninos e Meninas)</option>
                  <option value="SO_MENINAS">Só Meninas</option>
                  <option value="SO_MENINOS">Só Meninos</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-pets"
                  className="block text-xs font-bold text-text-secondary"
                >
                  Animais de Estimação
                </label>
                <select
                  id="edit-pets"
                  value={state.petsAllowed ? "true" : "false"}
                  onChange={(e) =>
                    actions.setPetsAllowed(e.target.value === "true")
                  }
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-xs font-bold text-text-primary"
                >
                  <option value="true">Pets permitidos (Gatos/Cães)</option>
                  <option value="false">Não permite animais</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-smoking"
                  className="block text-xs font-bold text-text-secondary"
                >
                  Política de Fumo
                </label>
                <input
                  id="edit-smoking"
                  type="text"
                  value={state.smokingPolicy}
                  onChange={(e) => actions.setSmokingPolicy(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-xs font-bold text-text-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-routine"
                  className="block text-xs font-bold text-text-secondary"
                >
                  Rotina da República
                </label>
                <input
                  id="edit-routine"
                  type="text"
                  value={state.houseRoutine}
                  onChange={(e) => actions.setHouseRoutine(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-xs font-bold text-text-primary"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: Real-Time Feed Preview & Weekly Performance Stats */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.LIVE_PREVIEW_HEADER}
              </span>
              <span className="text-xs font-extrabold text-trust-emerald">
                {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.ACTIVE_IN_SEARCH}
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary">
              <div className="relative h-44">
                <Image
                  unoptimized
                  width={600}
                  height={350}
                  src={state.listing.coverPhotoUrl}
                  alt={state.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-3 left-3 rounded-full bg-bg-primary/95 px-3 py-1 text-[11px] font-bold text-text-primary">
                  5 min do Metrô Pinheiros
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-sans text-base font-extrabold text-text-primary">
                  {state.title}
                </h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Pinheiros / USP • {state.houseRoutine} •{" "}
                  {state.petsAllowed ? "Aceita Pets" : "Sem Pets"}
                </p>
                <p className="mt-3 font-sans text-xl font-extrabold text-brand-primary">
                  {formatCurrencyBRL(computed.totalMonthlyCents)} /mês{" "}
                  <span className="text-xs font-semibold text-trust-emerald">
                    (água, luz, fibra e faxina)
                  </span>
                </p>
              </div>
            </div>

            {/* Weekly Performance Metrics */}
            <div className="mt-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.WEEKLY_STATS_HEADER}
              </span>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-3">
                  <Eye className="mx-auto h-4 w-4 text-brand-primary" />
                  <p className="mt-1 font-sans text-xl font-extrabold text-text-primary">
                    342
                  </p>
                  <p className="text-[10px] text-text-secondary">
                    {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.VIEWS_LABEL}
                  </p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-3">
                  <Heart className="mx-auto h-4 w-4 text-brand-primary" />
                  <p className="mt-1 font-sans text-xl font-extrabold text-text-primary">
                    14
                  </p>
                  <p className="text-[10px] text-text-secondary">
                    {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.FAVORITES_LABEL}
                  </p>
                </div>
                <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-3">
                  <MessageSquare className="mx-auto h-4 w-4 text-trust-emerald" />
                  <p className="mt-1 font-sans text-xl font-extrabold text-text-primary">
                    5
                  </p>
                  <p className="text-[10px] text-text-secondary">
                    {LISTING_WIZARD_CONSTANTS.QUICK_EDIT.LEADS_LABEL}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href={APP_ROUTES.SHARE_KIT(state.listing.id)}
                className="flex items-center justify-center gap-2 rounded-xl bg-trust-emerald py-3 text-xs font-extrabold text-white"
              >
                <Sparkles className="h-4 w-4" />
                <span>Gerar Cartaz QR Code p/ Mural do Campus</span>
              </Link>
              <button
                type="button"
                onClick={() => void actions.deletePermanently()}
                className="flex items-center justify-center gap-2 rounded-xl border border-brand-primary-border bg-brand-primary-light py-2.5 text-xs font-bold text-brand-primary"
              >
                <Trash2 className="h-4 w-4" />
                <span>{LISTING_WIZARD_CONSTANTS.QUICK_EDIT.DELETE_CTA}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
