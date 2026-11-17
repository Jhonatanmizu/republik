"use client";

import {
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_ROUTES, UNIVERSITIES_CATALOG } from "@/constants/routes.constants";
import { formatCurrencyBRL } from "@/features/shared-shell/models/domain.model";
import { MARKETPLACE_CONSTANTS } from "../marketplace.constants";
import { useMarketplaceViewModel } from "../view-models/use-marketplace.vm";

export function MarketplaceFeedView() {
  const { state, actions } = useMarketplaceViewModel();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Header & Search Section (Screen 3 Ki8q1 & Mobile 3 W94sj) */}
      <section className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-light px-3.5 py-1 text-xs font-extrabold text-brand-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{MARKETPLACE_CONSTANTS.HEADER.PILL}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-emerald-light px-3 py-1 text-xs font-bold text-trust-emerald">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{MARKETPLACE_CONSTANTS.HEADER.CAMPUS_BADGE}</span>
          </span>
        </div>

        <h1 className="mt-4 font-sans text-2xl font-extrabold text-text-primary sm:text-3xl lg:text-4xl">
          {MARKETPLACE_CONSTANTS.HEADER.TITLE}
        </h1>
        <p className="mt-1 text-xs font-medium text-text-secondary sm:text-sm">
          {MARKETPLACE_CONSTANTS.HEADER.SUBTITLE}
        </p>

        {/* Full-Text Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void actions.applySearch();
          }}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-2.5 rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-3">
            <Search className="h-4 w-4 text-brand-primary" />
            <input
              type="text"
              value={state.searchQuery}
              onChange={(e) => actions.setSearchQuery(e.target.value)}
              placeholder={MARKETPLACE_CONSTANTS.HEADER.SEARCH_PLACEHOLDER}
              className="w-full bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>

          <select
            value={state.selectedUniversity}
            onChange={(e) => actions.setSelectedUniversity(e.target.value)}
            className="rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-3 text-xs font-bold text-text-primary outline-none"
          >
            {UNIVERSITIES_CATALOG.map((u) => (
              <option key={u.code} value={u.code}>
                {u.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-2xl bg-brand-primary px-6 py-3 text-sm font-extrabold text-white shadow-xs transition hover:opacity-95"
          >
            {MARKETPLACE_CONSTANTS.HEADER.SEARCH_CTA}
          </button>
        </form>

        {/* Category Chips */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
          {MARKETPLACE_CONSTANTS.CATEGORIES.map((cat) => {
            const isActive = state.selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => actions.setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
                  isActive
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-border-subtle bg-bg-secondary text-text-secondary hover:border-text-primary hover:text-text-primary"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Grid Section (Node xuli9) */}
      <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {state.items.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-primary shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative h-56 w-full overflow-hidden bg-bg-tertiary">
              <Link href={APP_ROUTES.MARKETPLACE_DETAIL(item.slug)}>
                <Image
                  unoptimized
                  width={800}
                  height={500}
                  src={item.coverPhotoUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </Link>

              <span className="absolute top-3 left-3 rounded-full bg-bg-primary/95 px-3 py-1 text-[11px] font-extrabold text-brand-primary shadow-xs">
                {item.badgeText}
              </span>

              <button
                type="button"
                onClick={() => void actions.toggleFavorite(item.id)}
                aria-label="Salvar item nos favoritos"
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
            </div>

            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-trust-emerald">
                    <Tag className="h-3.5 w-3.5" />
                    {item.marketplace?.acceptsOffer
                      ? MARKETPLACE_CONSTANTS.CARD.ACCEPTS_OFFER
                      : MARKETPLACE_CONSTANTS.CARD.FIXED_PRICE}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary">
                    {item.marketplace?.conditionLabel ?? "Seminovo"}
                  </span>
                </div>

                <Link
                  href={APP_ROUTES.MARKETPLACE_DETAIL(item.slug)}
                  className="mt-2 block font-sans text-base font-extrabold text-text-primary transition group-hover:text-brand-primary"
                >
                  {item.title}
                </Link>

                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-text-secondary">
                  <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                  {item.proximityLabel}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
                <div>
                  <span className="font-sans text-2xl font-extrabold text-text-primary">
                    {formatCurrencyBRL(item.priceCents)}
                  </span>
                  {item.marketplace?.retailPriceCents ? (
                    <p className="text-[11px] text-text-muted line-through">
                      Loja:{" "}
                      {formatCurrencyBRL(item.marketplace.retailPriceCents)}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-trust-emerald-light text-xs font-extrabold text-trust-emerald">
                    {item.owner.initials}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-text-primary">
                      {item.owner.fullName}
                    </p>
                    <p className="text-[10px] font-bold text-trust-emerald">
                      {item.owner.courseName} ✓
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
