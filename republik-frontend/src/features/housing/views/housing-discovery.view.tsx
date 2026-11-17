"use client";

import {
  Check,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_ROUTES, UNIVERSITIES_CATALOG } from "@/constants/routes.constants";
import { formatCurrencyBRL } from "@/features/shared-shell/models/domain.model";
import { HOUSING_CONSTANTS } from "../housing.constants";
import { useHousingDiscoveryViewModel } from "../view-models/use-housing-discovery.vm";

export function HousingDiscoveryView() {
  const { state, computed, actions } = useHousingDiscoveryViewModel();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Hero Search Section (Node jT9c8 / Mobile 1 TFfUc) */}
      <section className="rounded-3xl border border-brand-primary-border bg-gradient-to-br from-brand-primary-light via-bg-primary to-bg-secondary p-6 shadow-xs sm:p-8 lg:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-trust-emerald/30 bg-trust-emerald-light px-3.5 py-1 text-[11px] font-extrabold tracking-wider text-trust-emerald">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{HOUSING_CONSTANTS.HERO.PILL}</span>
          </div>

          <h1 className="mt-4 font-sans text-2xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            {HOUSING_CONSTANTS.HERO.TITLE}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
            {HOUSING_CONSTANTS.HERO.SUBTITLE}
          </p>
        </div>

        {/* Full-Text Search & Structured Filter Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void actions.applySearch();
          }}
          className="mt-7 grid grid-cols-1 gap-3 rounded-2xl border border-border-subtle bg-bg-primary p-3 shadow-md md:grid-cols-12 md:items-center"
        >
          {/* Full-Text Search Input */}
          <div className="flex flex-col px-3 py-1.5 md:col-span-4 md:border-r md:border-border-subtle">
            <label
              htmlFor="housing-fts-input"
              className="text-[11px] font-bold uppercase tracking-wider text-text-muted"
            >
              {HOUSING_CONSTANTS.HERO.SEARCH_UNI_LABEL}
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-brand-primary" />
              <input
                id="housing-fts-input"
                type="text"
                value={state.searchQuery}
                onChange={(e) => actions.setSearchQuery(e.target.value)}
                placeholder={HOUSING_CONSTANTS.HERO.SEARCH_UNI_PLACEHOLDER}
                className="w-full bg-transparent text-sm font-semibold text-text-primary outline-none placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* University Selector */}
          <div className="flex flex-col px-3 py-1.5 md:col-span-3 md:border-r md:border-border-subtle">
            <label
              htmlFor="housing-uni-select"
              className="text-[11px] font-bold uppercase tracking-wider text-text-muted"
            >
              Campus Universitário
            </label>
            <select
              id="housing-uni-select"
              value={state.selectedUniversity}
              onChange={(e) => actions.setSelectedUniversity(e.target.value)}
              className="mt-1 bg-transparent text-sm font-semibold text-text-primary outline-none"
            >
              {UNIVERSITIES_CATALOG.map((u) => (
                <option key={u.code} value={u.code}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Selector */}
          <div className="flex flex-col px-3 py-1.5 md:col-span-3">
            <label
              htmlFor="housing-budget-select"
              className="text-[11px] font-bold uppercase tracking-wider text-text-muted"
            >
              {HOUSING_CONSTANTS.HERO.SEARCH_BUDGET_LABEL}
            </label>
            <select
              id="housing-budget-select"
              value={state.maxBudgetCents}
              onChange={(e) =>
                actions.setMaxBudgetCents(Number(e.target.value))
              }
              className="mt-1 bg-transparent text-sm font-semibold text-text-primary outline-none"
            >
              {HOUSING_CONSTANTS.BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit CTA */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-bold text-white shadow-xs transition hover:opacity-95"
            >
              <Search className="h-4 w-4" />
              <span>{HOUSING_CONSTANTS.HERO.SEARCH_CTA}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Horizontal Category Filter Bar (Node qWLIm) */}
      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {HOUSING_CONSTANTS.FILTER_CHIPS.map((chip) => {
            const isActive = state.activeChip === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => actions.setActiveChip(chip.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? "border-text-primary bg-text-primary text-white"
                    : "border-border-subtle bg-bg-primary text-text-secondary hover:border-text-primary hover:text-text-primary"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => actions.setIsFilterSheetOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-primary px-4 py-2 text-xs font-bold text-text-primary transition hover:border-brand-primary"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-brand-primary" />
          <span>
            {HOUSING_CONSTANTS.RESULTS.OPEN_FILTERS_CTA}
            {computed.activeFiltersCount > 0
              ? ` (${computed.activeFiltersCount})`
              : ""}
          </span>
        </button>
      </section>

      {/* Results Header */}
      <div className="mt-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h2 className="font-sans text-lg font-extrabold text-text-primary sm:text-xl">
          {computed.totalCount} {HOUSING_CONSTANTS.RESULTS.COUNT_SUFFIX}
        </h2>
        <span className="text-xs font-semibold text-text-secondary">
          {HOUSING_CONSTANTS.RESULTS.SORT_LABEL}
        </span>
      </div>

      {/* Main Housing Listing Grid (Node r25FJ / Mobile 1 JP2de) */}
      {state.listings.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-border-subtle bg-bg-primary p-10 text-center">
          <p className="text-sm font-medium text-text-secondary">
            {HOUSING_CONSTANTS.RESULTS.EMPTY_STATE}
          </p>
          <button
            type="button"
            onClick={actions.clearAllFilters}
            className="mt-4 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white"
          >
            {HOUSING_CONSTANTS.RESULTS.CLEAR_FILTERS}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {state.listings.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-primary shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Photo Header */}
              <div className="relative h-56 w-full overflow-hidden bg-bg-tertiary">
                <Link href={APP_ROUTES.HOUSING_DETAIL(item.slug)}>
                  <Image
                    unoptimized
                    width={800}
                    height={500}
                    src={item.coverPhotoUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </Link>

                <span className="absolute top-3 left-3 rounded-full bg-bg-primary/95 px-3 py-1 text-[11px] font-extrabold text-text-primary shadow-xs">
                  {item.badgeText}
                </span>

                <button
                  type="button"
                  onClick={() => void actions.toggleFavorite(item.id)}
                  aria-label="Salvar vaga nos favoritos"
                  className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-xs transition ${
                    item.isSaved
                      ? "bg-brand-primary text-white"
                      : "bg-bg-primary/90 text-text-primary hover:bg-white"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${item.isSaved ? "fill-current" : ""}`}
                  />
                </button>

                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-trust-emerald px-2.5 py-0.5 text-[10px] font-bold text-white">
                  <Sparkles className="h-3 w-3" />
                  {item.university.code} Verificado
                </span>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                      {item.proximityLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-text-primary">
                      <Star className="h-3.5 w-3.5 fill-warning-amber text-warning-amber" />
                      {item.rating}
                    </span>
                  </div>

                  <Link
                    href={APP_ROUTES.HOUSING_DETAIL(item.slug)}
                    className="mt-2 block font-sans text-base font-extrabold text-text-primary transition group-hover:text-brand-primary"
                  >
                    {item.title}
                  </Link>

                  <p className="mt-1 text-xs text-text-secondary">
                    {item.housing?.residentsSummary ?? item.neighborhood}
                  </p>
                </div>

                <div className="mt-4 border-t border-border-subtle pt-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-sans text-xl font-extrabold text-text-primary">
                        {formatCurrencyBRL(item.priceCents)}
                      </span>
                      <span className="ml-1 text-xs font-semibold text-text-secondary">
                        {HOUSING_CONSTANTS.RESULTS.PER_MONTH}
                      </span>
                      <p className="text-[11px] font-semibold text-trust-emerald">
                        {item.housing?.billsSummary ?? "(contas inclusas)"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-light text-xs font-extrabold text-brand-primary">
                        {item.owner.initials}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-text-primary">
                          {item.owner.fullName.split(" ")[0]}
                        </p>
                        <p className="text-[10px] font-bold text-trust-emerald">
                          {item.university.code} ✓
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Mobile 8A — Overlay Bottom Sheet (Filtros de Moradia - Node z0d6m) */}
      {state.isFilterSheetOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={HOUSING_CONSTANTS.BOTTOM_SHEET_FILTERS.TITLE}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs sm:items-center sm:p-4"
        >
          <div className="w-full max-w-lg rounded-t-3xl border border-border-subtle bg-bg-primary p-6 shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div>
                <p className="text-xs font-bold text-brand-primary">
                  USP Butantã • {computed.totalCount} vagas encontradas
                </p>
                <h3 className="font-sans text-xl font-extrabold text-text-primary">
                  {HOUSING_CONSTANTS.BOTTOM_SHEET_FILTERS.TITLE}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={actions.clearAllFilters}
                  className="text-xs font-bold text-text-secondary underline hover:text-brand-primary"
                >
                  {HOUSING_CONSTANTS.RESULTS.CLEAR_FILTERS}
                </button>
                <button
                  type="button"
                  onClick={() => actions.setIsFilterSheetOpen(false)}
                  className="rounded-full bg-bg-tertiary p-2 text-text-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {/* Price Range */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">
                    {HOUSING_CONSTANTS.BOTTOM_SHEET_FILTERS.PRICE_RANGE_LABEL}
                  </span>
                  <span className="text-xs font-extrabold text-brand-primary">
                    {HOUSING_CONSTANTS.BOTTOM_SHEET_FILTERS.PRICE_RANGE_DISPLAY}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {HOUSING_CONSTANTS.BUDGET_OPTIONS.slice(1).map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => actions.setMaxBudgetCents(b.value)}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        state.maxBudgetCents === b.value
                          ? "border-brand-primary bg-brand-primary-light text-brand-primary"
                          : "border-border-subtle bg-bg-secondary text-text-secondary"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modality */}
              <div>
                <span className="block text-xs font-bold text-text-primary">
                  {HOUSING_CONSTANTS.BOTTOM_SHEET_FILTERS.MODALITY_SECTION}
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {HOUSING_CONSTANTS.MODALITIES.slice(1).map((mod) => (
                    <button
                      key={mod.value}
                      type="button"
                      onClick={() =>
                        actions.setSelectedModality(
                          state.selectedModality === mod.value ? "" : mod.value,
                        )
                      }
                      className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                        state.selectedModality === mod.value
                          ? "border-text-primary bg-text-primary text-white"
                          : "border-border-subtle bg-bg-secondary text-text-secondary"
                      }`}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Included Checkboxes */}
              <div>
                <span className="block text-xs font-bold text-text-primary">
                  {HOUSING_CONSTANTS.BOTTOM_SHEET_FILTERS.INCLUDED_SECTION}
                </span>
                <div className="mt-2 space-y-2">
                  {HOUSING_CONSTANTS.BOTTOM_SHEET_FILTERS.INCLUDED_ITEMS.map(
                    (inc) => (
                      <div
                        key={inc.key}
                        className="flex items-center justify-between rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-xs font-semibold text-text-primary"
                      >
                        <span>{inc.label}</span>
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-trust-emerald text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => actions.setIsFilterSheetOpen(false)}
                className="w-full rounded-xl bg-brand-primary py-3.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
              >
                {HOUSING_CONSTANTS.BOTTOM_SHEET_FILTERS.APPLY_CTA_PREFIX}{" "}
                {computed.totalCount}{" "}
                {HOUSING_CONSTANTS.BOTTOM_SHEET_FILTERS.APPLY_CTA_SUFFIX}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
