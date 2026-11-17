"use client";

import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  MessageSquare,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes.constants";
import { useHousingDetailViewModel } from "@/features/housing/view-models/use-housing-detail.vm";
import { formatCurrencyBRL } from "@/features/shared-shell/models/domain.model";
import { MARKETPLACE_CONSTANTS } from "../marketplace.constants";

export interface MarketplaceDetailViewProps {
  readonly idOrSlug: string;
}

export function MarketplaceDetailView({
  idOrSlug,
}: MarketplaceDetailViewProps) {
  const { state, actions } = useHousingDetailViewModel(idOrSlug);
  const { listing } = state;
  const market = listing.marketplace;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Top Breadcrumb (Screen 4 SHFbU) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={APP_ROUTES.MARKETPLACE}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary transition hover:text-brand-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>
            {MARKETPLACE_CONSTANTS.DETAIL.BREADCRUMB} /{" "}
            {listing.university.code}
          </span>
        </Link>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-light px-3.5 py-1 text-xs font-extrabold text-brand-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{MARKETPLACE_CONSTANTS.DETAIL.URGENT_BANNER}</span>
        </span>
      </div>

      {/* Main Split Container (Node P4TmYD) */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Product Photos & Safety Notice */}
        <div className="space-y-4 lg:col-span-7">
          <div className="h-80 overflow-hidden rounded-3xl border border-border-subtle bg-bg-primary sm:h-96">
            <Image
              unoptimized
              width={900}
              height={600}
              src={listing.coverPhotoUrl}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Safety Tip Box */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-warning-amber/40 bg-warning-amber-light/60 p-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning-amber" />
            <div>
              <h2 className="text-xs font-extrabold text-text-primary">
                {MARKETPLACE_CONSTANTS.DETAIL.SAFETY_TITLE}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                {MARKETPLACE_CONSTANTS.DETAIL.SAFETY_BODY}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Item Info, Seller Verification, Pickup Logistics & Safe Contact */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-md">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-trust-emerald-light px-3 py-1 text-xs font-bold text-trust-emerald">
                {market?.conditionLabel ?? "Seminovo (Nota 9/10)"}
              </span>
              <span className="rounded-full bg-bg-secondary px-3 py-1 text-xs font-bold text-text-primary">
                {MARKETPLACE_CONSTANTS.DETAIL.TAGS.ACCEPTS_PIX}
              </span>
              {market?.disassemblesForTransport ? (
                <span className="rounded-full bg-bg-secondary px-3 py-1 text-xs font-bold text-text-secondary">
                  {MARKETPLACE_CONSTANTS.DETAIL.TAGS.DISASSEMBLES}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 font-sans text-2xl font-extrabold text-text-primary">
              {listing.title}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-sans text-3xl font-extrabold text-brand-primary">
                {formatCurrencyBRL(listing.priceCents)}
              </span>
              {market?.retailPriceCents ? (
                <span className="text-xs font-semibold text-text-muted line-through">
                  {MARKETPLACE_CONSTANTS.DETAIL.RETAIL_PREFIX}{" "}
                  {formatCurrencyBRL(market.retailPriceCents)}
                </span>
              ) : null}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              {listing.description}
            </p>

            {/* Verified Student Seller Box */}
            <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-border-subtle bg-bg-secondary p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-trust-emerald text-base font-extrabold text-white">
                {listing.owner.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-sm font-extrabold text-text-primary">
                    {listing.owner.fullName}
                  </span>
                  <ShieldCheck className="h-4 w-4 text-trust-emerald" />
                </div>
                <p className="text-xs font-bold text-trust-emerald">
                  {MARKETPLACE_CONSTANTS.DETAIL.SELLER_BADGE}
                </p>
                <p className="text-[11px] text-text-secondary">
                  {listing.owner.courseName} •{" "}
                  {MARKETPLACE_CONSTANTS.DETAIL.SELLER_STATS}
                </p>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="mt-4 space-y-2 rounded-2xl border border-border-subtle bg-bg-secondary p-4 text-xs">
              <div className="flex items-center gap-2 font-bold text-text-primary">
                <MapPin className="h-4 w-4 text-brand-primary" />
                <span>
                  {market?.pickupLocationLabel ?? listing.proximityLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 font-medium text-text-secondary">
                <Truck className="h-4 w-4 text-trust-emerald" />
                <span>
                  {market?.pickupNotes ??
                    MARKETPLACE_CONSTANTS.DETAIL.ELEVATOR_BADGE}
                </span>
              </div>
            </div>

            {/* Offer & Message Box */}
            <div className="mt-4">
              <textarea
                rows={2}
                value={state.inquiryMessage}
                onChange={(e) => actions.setInquiryMessage(e.target.value)}
                placeholder={MARKETPLACE_CONSTANTS.DETAIL.OFFER_PLACEHOLDER}
                className="w-full rounded-xl border border-border-subtle bg-bg-secondary p-3 text-xs font-medium text-text-primary outline-none focus:border-brand-primary"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void actions.sendInquiryAndOpenChat()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3.5 text-xs font-extrabold text-white shadow-sm transition hover:opacity-95"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{MARKETPLACE_CONSTANTS.DETAIL.CHAT_CTA}</span>
              </button>

              <Link
                href={APP_ROUTES.SHARE_KIT(listing.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3.5 text-xs font-extrabold text-text-primary transition hover:border-brand-primary"
              >
                <QrCode className="h-4 w-4 text-brand-primary" />
                <span>Cartaz QR Code</span>
              </Link>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-trust-emerald">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>WhatsApp protegido até confirmação no Chat Republik</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
