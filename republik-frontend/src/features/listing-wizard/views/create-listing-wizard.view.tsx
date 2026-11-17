"use client";

import {
  Building2,
  Check,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  Upload,
} from "lucide-react";
import { UNIVERSITIES_CATALOG } from "@/constants/routes.constants";
import { formatCurrencyBRL } from "@/features/shared-shell/models/domain.model";
import { LISTING_WIZARD_CONSTANTS } from "../listing-wizard.constants";
import { useListingWizardViewModel } from "../view-models/use-listing-wizard.vm";

export function CreateListingWizardView() {
  const { state, computed, actions } = useListingWizardViewModel();

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Header & Progressive Step Bar (Screen 5 TNFPJ & Mobile 4 Y5M5y) */}
      <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-light px-3.5 py-1 text-xs font-extrabold text-brand-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{LISTING_WIZARD_CONSTANTS.HEADER.PILL}</span>
        </span>

        <h1 className="mt-3 font-sans text-2xl font-extrabold text-text-primary sm:text-3xl">
          Anunciar Vaga ou Item no Campus
        </h1>
        <p className="mt-1 text-xs font-medium text-text-secondary">
          {LISTING_WIZARD_CONSTANTS.HEADER.STEP_SUBTITLE}
        </p>

        {/* Step Indicator Pills */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {LISTING_WIZARD_CONSTANTS.HEADER.STEPS.map((s) => {
            const isActive = state.step >= s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => actions.setStep(s.id)}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                  isActive
                    ? "border-brand-primary bg-brand-primary-light text-brand-primary"
                    : "border-border-subtle bg-bg-secondary text-text-muted"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Step 1: Category Selection */}
        <div className="mt-7 border-t border-border-subtle pt-6">
          <h2 className="font-sans text-lg font-extrabold text-text-primary">
            {LISTING_WIZARD_CONSTANTS.STEP_1.TITLE}
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => actions.setType("HOUSING")}
              className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                state.type === "HOUSING"
                  ? "border-brand-primary bg-brand-primary-light/50"
                  : "border-border-subtle bg-bg-secondary hover:border-text-secondary"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                {state.type === "HOUSING" ? (
                  <span className="rounded-full bg-brand-primary px-3 py-1 text-[11px] font-bold text-white">
                    {LISTING_WIZARD_CONSTANTS.STEP_1.HOUSING_CARD.SELECTED}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 font-sans text-base font-extrabold text-text-primary">
                {LISTING_WIZARD_CONSTANTS.STEP_1.HOUSING_CARD.TITLE}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                {LISTING_WIZARD_CONSTANTS.STEP_1.HOUSING_CARD.DESC}
              </p>
            </button>

            <button
              type="button"
              onClick={() => actions.setType("MARKETPLACE")}
              className={`flex flex-col items-start rounded-2xl border-2 p-5 text-left transition ${
                state.type === "MARKETPLACE"
                  ? "border-brand-primary bg-brand-primary-light/50"
                  : "border-border-subtle bg-bg-secondary hover:border-text-secondary"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-text-primary text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                {state.type === "MARKETPLACE" ? (
                  <span className="rounded-full bg-brand-primary px-3 py-1 text-[11px] font-bold text-white">
                    {LISTING_WIZARD_CONSTANTS.STEP_1.HOUSING_CARD.SELECTED}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 font-sans text-base font-extrabold text-text-primary">
                {LISTING_WIZARD_CONSTANTS.STEP_1.MARKET_CARD.TITLE}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                {LISTING_WIZARD_CONSTANTS.STEP_1.MARKET_CARD.DESC}
              </p>
            </button>
          </div>

          {state.type === "HOUSING" ? (
            <div className="mt-4">
              <span className="text-xs font-bold text-text-primary">
                {LISTING_WIZARD_CONSTANTS.STEP_1.MODALITY_LABEL}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {LISTING_WIZARD_CONSTANTS.STEP_1.MODALITIES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => actions.setModality(m.id)}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                      state.modality === m.id
                        ? "border-text-primary bg-text-primary text-white"
                        : "border-border-subtle bg-bg-secondary text-text-secondary"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Step 2: Details, Monthly Costs & Photos */}
        <div className="mt-7 border-t border-border-subtle pt-6">
          <h2 className="font-sans text-lg font-extrabold text-text-primary">
            {LISTING_WIZARD_CONSTANTS.STEP_2.TITLE}
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="wizard-title"
                className="block text-xs font-bold text-text-primary"
              >
                {LISTING_WIZARD_CONSTANTS.STEP_2.TITLE_LABEL}
              </label>
              <input
                id="wizard-title"
                type="text"
                value={state.title}
                onChange={(e) => actions.setTitle(e.target.value)}
                placeholder={LISTING_WIZARD_CONSTANTS.STEP_2.TITLE_PLACEHOLDER}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-primary outline-none focus:border-brand-primary"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="wizard-rent"
                  className="block text-xs font-bold text-text-primary"
                >
                  {LISTING_WIZARD_CONSTANTS.STEP_2.RENT_LABEL}
                </label>
                <input
                  id="wizard-rent"
                  type="number"
                  value={state.baseRentReais}
                  onChange={(e) =>
                    actions.setBaseRentReais(Number(e.target.value))
                  }
                  className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-brand-primary"
                />
              </div>

              {state.type === "HOUSING" ? (
                <div>
                  <label
                    htmlFor="wizard-condo"
                    className="block text-xs font-bold text-text-primary"
                  >
                    {LISTING_WIZARD_CONSTANTS.STEP_2.CONDO_LABEL}
                  </label>
                  <input
                    id="wizard-condo"
                    type="number"
                    value={state.condoReais}
                    onChange={(e) =>
                      actions.setCondoReais(Number(e.target.value))
                    }
                    className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="wizard-uni"
                  className="block text-xs font-bold text-text-primary"
                >
                  {LISTING_WIZARD_CONSTANTS.STEP_2.UNI_LABEL}
                </label>
                <select
                  id="wizard-uni"
                  value={state.universityCode}
                  onChange={(e) => actions.setUniversityCode(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-brand-primary"
                >
                  {UNIVERSITIES_CATALOG.slice(1).map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.campusLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="wizard-proximity"
                  className="block text-xs font-bold text-text-primary"
                >
                  {LISTING_WIZARD_CONSTANTS.STEP_2.PROXIMITY_LABEL}
                </label>
                <input
                  id="wizard-proximity"
                  type="text"
                  value={state.proximityLabel}
                  onChange={(e) => actions.setProximityLabel(e.target.value)}
                  placeholder={
                    LISTING_WIZARD_CONSTANTS.STEP_2.PROXIMITY_PLACEHOLDER
                  }
                  className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="wizard-neighborhood"
                  className="block text-xs font-bold text-text-primary"
                >
                  Bairro e Cidade
                </label>
                <input
                  id="wizard-neighborhood"
                  type="text"
                  value={state.neighborhood}
                  onChange={(e) => actions.setNeighborhood(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm font-medium text-text-primary outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="wizard-desc"
                className="block text-xs font-bold text-text-primary"
              >
                Descrição detalhada
              </label>
              <textarea
                id="wizard-desc"
                rows={3}
                value={state.description}
                onChange={(e) => actions.setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border-subtle bg-bg-secondary p-4 text-sm text-text-primary outline-none focus:border-brand-primary"
              />
            </div>

            {/* Photo Upload Dropzone */}
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-subtle bg-bg-secondary p-6 text-center transition hover:border-brand-primary">
              <Upload className="h-7 w-7 text-brand-primary" />
              <span className="mt-2 text-xs font-extrabold text-text-primary">
                {LISTING_WIZARD_CONSTANTS.STEP_2.UPLOAD_TITLE}
              </span>
              <span className="mt-1 text-[11px] text-text-secondary">
                {LISTING_WIZARD_CONSTANTS.STEP_2.UPLOAD_SUBTITLE}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void actions.uploadFile(file);
                  }
                }}
              />
            </label>

            {/* Highlights & House Rules Pills */}
            <div>
              <span className="block text-xs font-bold text-text-primary">
                {LISTING_WIZARD_CONSTANTS.STEP_2.HIGHLIGHTS_LABEL}
              </span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[
                  {
                    key: "furnished" as const,
                    label: "Quarto Mobiliado",
                    active: state.furnished,
                  },
                  {
                    key: "billsIncluded" as const,
                    label: "Contas Inclusas",
                    active: state.billsIncluded,
                  },
                  {
                    key: "noGuarantor" as const,
                    label: "Sem Fiador",
                    active: state.noGuarantor,
                  },
                  {
                    key: "petsAllowed" as const,
                    label: "Aceita Pets",
                    active: state.petsAllowed,
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => actions.toggleHighlight(item.key)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition ${
                      item.active
                        ? "border-trust-emerald bg-trust-emerald-light text-trust-emerald"
                        : "border-border-subtle bg-bg-secondary text-text-secondary"
                    }`}
                  >
                    {item.active ? <Check className="h-3.5 w-3.5" /> : null}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-5 sm:flex-row">
          <div className="flex items-center gap-2 text-xs font-semibold text-trust-emerald">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {LISTING_WIZARD_CONSTANTS.STEP_2.AUTOSAVE_NOTE} • Total:{" "}
              {formatCurrencyBRL(computed.totalMonthlyCents)}
            </span>
          </div>

          <button
            type="button"
            disabled={state.isSubmitting}
            onClick={() => void actions.publishListing()}
            className="w-full rounded-xl bg-brand-primary px-8 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-95 sm:w-auto"
          >
            {LISTING_WIZARD_CONSTANTS.STEP_2.CONTINUE_CTA}
          </button>
        </div>

        {state.feedbackMessage ? (
          <p className="mt-3 text-right text-xs font-bold text-trust-emerald">
            {state.feedbackMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
