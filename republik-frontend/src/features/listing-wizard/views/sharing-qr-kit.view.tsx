"use client";

import {
  Copy,
  GraduationCap,
  Printer,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FRONTEND_ENV } from "@/config/env.config";
import { APP_ROUTES } from "@/constants/routes.constants";
import {
  DEFAULT_FALLBACK_LISTING,
  FALLBACK_LISTINGS,
} from "@/features/shared-shell/models/fallback-seed.data";
import { LISTING_WIZARD_CONSTANTS } from "../listing-wizard.constants";

export interface SharingQrKitViewProps {
  readonly listingId: string;
}

export function SharingQrKitView({ listingId }: SharingQrKitViewProps) {
  const [copied, setCopied] = useState(false);
  const listing =
    FALLBACK_LISTINGS.find(
      (item) => item.id === listingId || item.code === listingId,
    ) ?? DEFAULT_FALLBACK_LISTING;

  const shareUrl = `${FRONTEND_ENV.SITE_URL}/vaga/usp-pinheiros-${listing.code}`;

  const handleCopy = (): void => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(shareUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrintPoster = (): void => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Header (Screen 15 H1fBVf) */}
      <div className="no-print mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary-light px-3.5 py-1 text-xs font-extrabold text-brand-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{LISTING_WIZARD_CONSTANTS.SHARE_KIT.PILL}</span>
        </span>
        <h1 className="mt-3 font-sans text-2xl font-extrabold text-text-primary sm:text-3xl">
          {LISTING_WIZARD_CONSTANTS.SHARE_KIT.TITLE}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Digital Share Controls & Why Campus QR Works */}
        <div className="no-print space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs">
            <h2 className="font-sans text-lg font-extrabold text-text-primary">
              {LISTING_WIZARD_CONSTANTS.SHARE_KIT.SHARE_CARD_TITLE}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {LISTING_WIZARD_CONSTANTS.SHARE_KIT.SHARE_CARD_SUB}
            </p>

            <div className="mt-4">
              <span className="text-xs font-bold text-text-secondary">
                {LISTING_WIZARD_CONSTANTS.SHARE_KIT.DIRECT_LINK_LABEL}
              </span>
              <div className="mt-1.5 flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5">
                <span className="truncate font-mono text-xs font-semibold text-text-primary">
                  {shareUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-bold text-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>
                    {copied
                      ? LISTING_WIZARD_CONSTANTS.SHARE_KIT.COPIED_BADGE
                      : LISTING_WIZARD_CONSTANTS.SHARE_KIT.COPY_CTA}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Vaga verificada na Republik: ${listing.title} - ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-trust-emerald py-3 text-xs font-extrabold text-white transition hover:bg-trust-emerald-dark"
              >
                <Share2 className="h-4 w-4" />
                <span>{LISTING_WIZARD_CONSTANTS.SHARE_KIT.WHATSAPP_CTA}</span>
              </a>

              <button
                type="button"
                onClick={handlePrintPoster}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-text-primary py-3.5 text-xs font-extrabold text-white transition hover:opacity-90"
              >
                <Printer className="h-4 w-4" />
                <span>{LISTING_WIZARD_CONSTANTS.SHARE_KIT.PRINT_PDF_CTA}</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-bg-primary p-5">
            <h3 className="font-sans text-sm font-extrabold text-text-primary">
              {LISTING_WIZARD_CONSTANTS.SHARE_KIT.POSTER.WHY_TITLE}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {LISTING_WIZARD_CONSTANTS.SHARE_KIT.POSTER.WHY_DESC}
            </p>
          </div>
        </div>

        {/* Right: Printable A4 Campus Poster ("Cartaz QR Code Imprimível") */}
        <div className="lg:col-span-7">
          <div className="mx-auto max-w-xl rounded-3xl border-2 border-text-primary bg-white p-8 text-center shadow-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-trust-emerald px-4 py-1 text-xs font-extrabold text-white">
              <ShieldCheck className="h-4 w-4" />
              <span>VAGA VERIFICADA • USP</span>
            </div>

            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-primary">
              5 min a pé do metrô/campus
            </p>

            <h2 className="mt-2 font-sans text-2xl font-extrabold text-text-primary sm:text-3xl">
              Quarto Individual Mobiliado — Pinheiros / Butantã
            </h2>

            <p className="mt-2 font-sans text-2xl font-extrabold text-brand-primary">
              R$ 1.200/mês com contas inclusas
            </p>

            {/* Vector SVG QR Code */}
            <div className="my-6 inline-flex flex-col items-center rounded-3xl border-2 border-dashed border-text-primary bg-bg-secondary p-6">
              <svg
                viewBox="0 0 120 120"
                className="h-44 w-44 text-text-primary"
                role="img"
                aria-label="QR Code Republik Verificado"
              >
                <rect width="120" height="120" fill="#FFFFFF" rx="8" />
                <rect x="10" y="10" width="30" height="30" fill="#1B2925" />
                <rect x="15" y="15" width="20" height="20" fill="#FFFFFF" />
                <rect x="20" y="20" width="10" height="10" fill="#F64A33" />
                <rect x="80" y="10" width="30" height="30" fill="#1B2925" />
                <rect x="85" y="15" width="20" height="20" fill="#FFFFFF" />
                <rect x="90" y="20" width="10" height="10" fill="#1B2925" />
                <rect x="10" y="80" width="30" height="30" fill="#1B2925" />
                <rect x="15" y="85" width="20" height="20" fill="#FFFFFF" />
                <rect x="20" y="90" width="10" height="10" fill="#1B2925" />
                <rect x="50" y="15" width="8" height="8" fill="#1B2925" />
                <rect x="62" y="15" width="8" height="8" fill="#1B2925" />
                <rect x="50" y="30" width="16" height="8" fill="#1B2925" />
                <rect x="15" y="50" width="12" height="8" fill="#1B2925" />
                <rect x="35" y="50" width="20" height="12" fill="#F64A33" />
                <rect x="65" y="50" width="12" height="12" fill="#1B2925" />
                <rect x="85" y="50" width="20" height="8" fill="#1B2925" />
                <rect x="50" y="70" width="12" height="12" fill="#1B2925" />
                <rect x="70" y="75" width="16" height="8" fill="#1B2925" />
                <rect x="92" y="70" width="14" height="14" fill="#1B2925" />
                <rect x="50" y="92" width="24" height="12" fill="#1B2925" />
                <rect x="82" y="92" width="24" height="12" fill="#389E0D" />
              </svg>
              <span className="mt-3 font-sans text-sm font-extrabold tracking-wider text-text-primary">
                {LISTING_WIZARD_CONSTANTS.SHARE_KIT.POSTER.SCAN_HEADER}
              </span>
              <span className="mt-1 max-w-xs text-xs text-text-secondary">
                {LISTING_WIZARD_CONSTANTS.SHARE_KIT.POSTER.SCAN_SUB}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-secondary">
              <QrCode className="h-4 w-4 text-brand-primary" />
              <span>{shareUrl}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Experience Banner (Node H1fBVf Bottom Section) */}
      <div className="no-print mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-trust-emerald/40 bg-trust-emerald-light p-6 sm:flex-row">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-trust-emerald-dark">
            <GraduationCap className="h-4 w-4" />
            {LISTING_WIZARD_CONSTANTS.SHARE_KIT.VISITOR_BANNER.HEADER}
          </span>
          <p className="text-sm font-bold text-text-primary">
            {LISTING_WIZARD_CONSTANTS.SHARE_KIT.VISITOR_BANNER.TEXT}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={APP_ROUTES.REGISTER}
            className="rounded-xl bg-trust-emerald px-5 py-2.5 text-xs font-extrabold text-white"
          >
            {LISTING_WIZARD_CONSTANTS.SHARE_KIT.VISITOR_BANNER.REGISTER_CTA}
          </Link>
          <Link
            href={APP_ROUTES.LOGIN}
            className="rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-xs font-bold text-text-primary"
          >
            {LISTING_WIZARD_CONSTANTS.SHARE_KIT.VISITOR_BANNER.LOGIN_CTA}
          </Link>
        </div>
      </div>
    </div>
  );
}
