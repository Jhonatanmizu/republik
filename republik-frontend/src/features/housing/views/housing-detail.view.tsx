"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Heart,
  MapPin,
  MessageSquare,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  Wifi,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes.constants";
import {
  formatCurrencyBRL,
  formatExactBRL,
} from "@/features/shared-shell/models/domain.model";
import { HOUSING_CONSTANTS } from "../housing.constants";
import { useHousingDetailViewModel } from "../view-models/use-housing-detail.vm";

export interface HousingDetailViewProps {
  readonly idOrSlug: string;
}

export function HousingDetailView({ idOrSlug }: HousingDetailViewProps) {
  const { state, actions } = useHousingDetailViewModel(idOrSlug);
  const { listing } = state;
  const housing = listing.housing;

  const baseRentCents = housing?.baseRentCents ?? 60_000;
  const condoCents = housing?.condoAndBillsCents ?? 15_000;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Top Breadcrumb & Actions (Screen 2 tKyaQ & Mobile 2 mfSxI) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={APP_ROUTES.HOUSING}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary transition hover:text-brand-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{HOUSING_CONSTANTS.DETAIL.BACK_LINK}</span>
          </Link>
          <span className="text-text-muted">•</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
            <MapPin className="h-3.5 w-3.5 text-brand-primary" />
            {listing.proximityLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-trust-emerald-light px-3 py-1 text-xs font-bold text-trust-emerald">
            <ShieldCheck className="h-3.5 w-3.5" />
            {HOUSING_CONSTANTS.DETAIL.VERIFIED_TAG} {listing.university.code} (
            {listing.owner.verifiedDomain ?? ".edu.br"})
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => actions.setIsShareSheetOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-primary px-4 py-2 text-xs font-bold text-text-primary transition hover:border-brand-primary"
          >
            <Share2 className="h-4 w-4 text-brand-primary" />
            <span>{HOUSING_CONSTANTS.DETAIL.SHARE_BUTTON}</span>
          </button>

          <button
            type="button"
            onClick={() => void actions.toggleSave()}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
              state.isSaved
                ? "border-brand-primary bg-brand-primary-light text-brand-primary"
                : "border-border-subtle bg-bg-primary text-text-primary hover:border-brand-primary"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${state.isSaved ? "fill-current" : ""}`}
            />
            <span>
              {state.isSaved
                ? HOUSING_CONSTANTS.DETAIL.SAVED_BUTTON
                : HOUSING_CONSTANTS.DETAIL.SAVE_BUTTON}
            </span>
          </button>
        </div>
      </div>

      <h1 className="mt-4 font-sans text-2xl font-extrabold text-text-primary sm:text-3xl lg:text-4xl">
        {listing.title}
      </h1>

      {/* Photo Gallery Bento Grid */}
      <div className="relative mt-5 grid grid-cols-1 gap-3 overflow-hidden rounded-3xl md:grid-cols-12">
        <div className="h-72 md:col-span-8 md:h-96">
          <Image
            unoptimized
            width={1000}
            height={700}
            src={listing.coverPhotoUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="hidden flex-col gap-3 md:col-span-4 md:flex md:h-96">
          <Image
            unoptimized
            width={600}
            height={400}
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
            alt="Sala e convivência"
            className="h-1/2 w-full object-cover"
          />
          <Image
            unoptimized
            width={600}
            height={400}
            src="https://images.unsplash.com/photo-1540518614846-7ede433c4efb?auto=format&fit=crop&w=800&q=80"
            alt="Área de estudos"
            className="h-1/2 w-full object-cover"
          />
        </div>

        <div className="absolute bottom-4 left-4 rounded-full bg-bg-primary/95 px-3.5 py-1.5 text-xs font-bold text-text-primary shadow-sm">
          {HOUSING_CONSTANTS.DETAIL.PHOTOS_BADGE}
        </div>
      </div>

      {/* Two-Column Split Detail Content (Node O5s8Ye) */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Host Info, Roommates, Description, House Rules, Amenities */}
        <div className="space-y-8 lg:col-span-7">
          {/* Host Card */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-primary p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-base font-extrabold text-white">
                {listing.owner.initials}
              </div>
              <div>
                <h2 className="font-sans text-base font-extrabold text-text-primary">
                  Anunciado por {listing.owner.fullName} (
                  {listing.owner.courseSemester} • {listing.owner.courseName})
                </h2>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {HOUSING_CONSTANTS.DETAIL.HOST_SUBTITLE}
                </p>
              </div>
            </div>
          </div>

          {/* Current Roommates */}
          {housing && housing.roommates.length > 0 ? (
            <div className="rounded-2xl border border-border-subtle bg-bg-primary p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                {HOUSING_CONSTANTS.DETAIL.ROOMMATES_TITLE}
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {housing.roommates.map((rm) => (
                  <div
                    key={`${rm.initials}-${rm.name}`}
                    className="inline-flex items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-trust-emerald text-xs font-bold text-white">
                      {rm.initials}
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      {rm.name} • {rm.course}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* 3 Feature Highlights */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {HOUSING_CONSTANTS.DETAIL.HIGHLIGHTS.map((hl) => (
              <div
                key={hl.title}
                className="rounded-2xl border border-border-subtle bg-bg-primary p-4"
              >
                <Wifi className="h-5 w-5 text-brand-primary" />
                <h3 className="mt-2 font-sans text-sm font-bold text-text-primary">
                  {hl.title}
                </h3>
                <p className="mt-1 text-xs text-text-secondary">{hl.desc}</p>
              </div>
            ))}
          </div>

          {/* About Description */}
          <div className="rounded-2xl border border-border-subtle bg-bg-primary p-6">
            <h3 className="font-sans text-lg font-extrabold text-text-primary">
              {HOUSING_CONSTANTS.DETAIL.ABOUT_TITLE}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {listing.description}
            </p>

            {/* House Rules Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border-subtle pt-5 sm:grid-cols-4">
              <div>
                <p className="text-[11px] font-bold uppercase text-text-muted">
                  {HOUSING_CONSTANTS.DETAIL.RULES_LABELS.SMOKING}
                </p>
                <p className="mt-1 text-xs font-bold text-text-primary">
                  {housing?.smokingPolicy ?? "Apenas na varanda"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-text-muted">
                  {HOUSING_CONSTANTS.DETAIL.RULES_LABELS.PETS}
                </p>
                <p className="mt-1 text-xs font-bold text-text-primary">
                  {housing?.petsAllowed
                    ? "Gatos/Cães bem-vindos"
                    : "Não permite pets"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-text-muted">
                  {HOUSING_CONSTANTS.DETAIL.RULES_LABELS.VISITS}
                </p>
                <p className="mt-1 text-xs font-bold text-text-primary">
                  {HOUSING_CONSTANTS.DETAIL.RULES_LABELS.VISITS_VAL}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase text-text-muted">
                  {HOUSING_CONSTANTS.DETAIL.RULES_LABELS.CLEANING}
                </p>
                <p className="mt-1 text-xs font-bold text-text-primary">
                  {housing?.houseRoutine ?? "Faxina quinzenal + escala leve"}
                </p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="rounded-2xl border border-border-subtle bg-bg-primary p-6">
            <h3 className="font-sans text-lg font-extrabold text-text-primary">
              {HOUSING_CONSTANTS.DETAIL.AMENITIES_TITLE}
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                housing?.amenities ?? [
                  "Máquina Lava e Seca 11kg",
                  "Geladeira Duplex Frost Free",
                  "Escrivaninha 1,40m + Cadeira",
                  "Portaria 24h + Biometria",
                ]
              ).map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2.5 rounded-xl bg-bg-secondary px-4 py-3 text-xs font-bold text-text-primary"
                >
                  <CheckCircle2 className="h-4 w-4 text-trust-emerald" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Transparent Monthly Cost Card & Inquiry CTA */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-sans text-3xl font-extrabold text-text-primary">
                  {formatCurrencyBRL(listing.priceCents)}
                </span>
                <span className="ml-1 text-xs font-semibold text-text-secondary">
                  {HOUSING_CONSTANTS.DETAIL.COST_CARD.PER_MONTH_TOTAL}
                </span>
              </div>
              <span className="rounded-full bg-trust-emerald-light px-3 py-1 text-xs font-extrabold text-trust-emerald">
                {HOUSING_CONSTANTS.DETAIL.COST_CARD.BADGE}
              </span>
            </div>

            {/* Monthly Cost Breakdown */}
            <div className="mt-5 rounded-2xl border border-border-subtle bg-bg-secondary p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
                {HOUSING_CONSTANTS.DETAIL.COST_CARD.TRANSPARENCY_HEADER}
              </p>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>{HOUSING_CONSTANTS.DETAIL.COST_CARD.BASE_RENT}</span>
                  <span className="font-bold text-text-primary">
                    {formatExactBRL(baseRentCents)}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>{HOUSING_CONSTANTS.DETAIL.COST_CARD.CONDO_BILLS}</span>
                  <span className="font-bold text-text-primary">
                    {formatExactBRL(Math.round(condoCents * 0.6))}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>
                    {HOUSING_CONSTANTS.DETAIL.COST_CARD.INTERNET_CLEANING}
                  </span>
                  <span className="font-bold text-text-primary">
                    {formatExactBRL(Math.round(condoCents * 0.4))}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-2.5 text-sm font-extrabold text-text-primary">
                  <span>
                    {HOUSING_CONSTANTS.DETAIL.COST_CARD.TOTAL_ESTIMATED}
                  </span>
                  <span className="text-brand-primary">
                    {formatCurrencyBRL(listing.priceCents)} /mês
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                {HOUSING_CONSTANTS.DETAIL.COST_CARD.MOVE_IN_HEADER}
              </p>
              <p className="mt-0.5 text-xs font-bold text-text-primary">
                {housing?.moveInDateLabel ??
                  "Entrada: 01 Agosto 2025 (2º Semestre)"}
              </p>
            </div>

            {/* Quick Inquiry Message */}
            <div className="mt-4">
              <textarea
                rows={2}
                value={state.inquiryMessage}
                onChange={(e) => actions.setInquiryMessage(e.target.value)}
                className="w-full rounded-xl border border-border-subtle bg-bg-secondary p-3 text-xs font-medium text-text-primary outline-none focus:border-brand-primary"
              />
            </div>

            {state.inquiryFeedback ? (
              <p className="mt-2 text-xs font-bold text-trust-emerald">
                {state.inquiryFeedback}
              </p>
            ) : null}

            <button
              type="button"
              disabled={state.isSendingInquiry}
              onClick={() => void actions.sendInquiryAndOpenChat()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{HOUSING_CONSTANTS.DETAIL.COST_CARD.PRIMARY_CTA}</span>
            </button>

            <div className="mt-3 flex flex-col gap-2">
              <Link
                href={APP_ROUTES.SHARE_KIT(listing.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-secondary py-2.5 text-xs font-bold text-text-primary transition hover:border-brand-primary"
              >
                <QrCode className="h-4 w-4 text-brand-primary" />
                <span>{HOUSING_CONSTANTS.DETAIL.COST_CARD.OPEN_QR_POSTER}</span>
              </Link>
              <Link
                href={APP_ROUTES.QUICK_EDIT(listing.id)}
                className="text-center text-xs font-bold text-text-secondary underline hover:text-brand-primary"
              >
                Gerenciar / Editar este anúncio (#{listing.code})
              </Link>
            </div>

            <p className="mt-4 text-center text-[11px] text-text-muted">
              {HOUSING_CONSTANTS.DETAIL.COST_CARD.NO_CHARGE_NOTE}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile 8B — Overlay Bottom Sheet (Compartilhar & QR Code - Node Gbkvo) */}
      {state.isShareSheetOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={HOUSING_CONSTANTS.DETAIL.SHARE_SHEET.TITLE}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs sm:items-center sm:p-4"
        >
          <div className="w-full max-w-md rounded-t-3xl border border-border-subtle bg-bg-primary p-6 shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div>
                <p className="text-xs font-bold text-brand-primary">
                  {listing.title.slice(0, 36)} —{" "}
                  {formatCurrencyBRL(listing.priceCents)}/mês
                </p>
                <h3 className="font-sans text-xl font-extrabold text-text-primary">
                  {HOUSING_CONSTANTS.DETAIL.SHARE_SHEET.TITLE}
                </h3>
                <p className="text-xs text-text-secondary">
                  {HOUSING_CONSTANTS.DETAIL.SHARE_SHEET.SUBTITLE}
                </p>
              </div>
              <button
                type="button"
                onClick={() => actions.setIsShareSheetOpen(false)}
                className="rounded-full bg-bg-tertiary p-2 text-text-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <span className="text-xs font-bold text-text-secondary">
                  {HOUSING_CONSTANTS.DETAIL.SHARE_SHEET.DIRECT_LINK_LABEL}
                </span>
                <div className="mt-1.5 flex items-center justify-between rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5">
                  <span className="truncate font-mono text-xs font-semibold text-text-primary">
                    republik.com.br/vaga/usp-{listing.code}
                  </span>
                  <button
                    type="button"
                    onClick={actions.copyShareLink}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-bold text-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>
                      {state.linkCopied
                        ? HOUSING_CONSTANTS.DETAIL.SHARE_SHEET.COPIED
                        : HOUSING_CONSTANTS.DETAIL.SHARE_SHEET.COPY}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-border-subtle bg-bg-secondary p-4 text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-border-subtle bg-white p-2">
                  <QrCode className="h-20 w-20 text-text-primary" />
                </div>
                <p className="mt-2 text-xs font-semibold text-text-secondary">
                  {HOUSING_CONSTANTS.DETAIL.SHARE_SHEET.QR_CAPTION}
                </p>
                <Link
                  href={APP_ROUTES.SHARE_KIT(listing.id)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-brand-primary underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {HOUSING_CONSTANTS.DETAIL.SHARE_SHEET.FULL_KIT_LINK}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
