"use client";

import {
  Building2,
  Home,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense, useState } from "react";
import { APP_ROUTES, GLOBAL_BRAND_TEXT } from "@/constants/routes.constants";
import { StudentVerificationModal } from "./student-verification-modal.view";

export interface AppShellProps {
  readonly children: ReactNode;
  readonly activeSection?:
    | "HOUSING"
    | "MARKETPLACE"
    | "WIZARD"
    | "DASHBOARD"
    | "MESSAGES"
    | "PROFILE"
    | "LGPD"
    | "ADMIN"
    | "AUTH";
}

function AppShellContent({ children, activeSection }: AppShellProps) {
  const pathname = usePathname();
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const isHousingActive =
    activeSection === "HOUSING" ||
    pathname === "/" ||
    pathname.startsWith("/moradia");
  const isMarketplaceActive =
    activeSection === "MARKETPLACE" || pathname.startsWith("/desapego");
  const isDashboardActive =
    activeSection === "DASHBOARD" || pathname.startsWith("/meu-espaco");
  const isMessagesActive =
    activeSection === "MESSAGES" || pathname.startsWith("/mensagens");

  return (
    <div className="min-h-screen flex flex-col bg-bg-secondary text-text-primary">
      {/* Desktop Global Navbar (Nodes Fj27d & bkdik) */}
      <header className="no-print sticky top-0 z-40 border-b border-border-subtle bg-bg-primary/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-10">
          {/* Brand Logo (Node GDsPL) */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href={APP_ROUTES.HOME}
              className="flex items-center gap-2.5 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs transition group-hover:scale-105">
                <Home className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xl font-extrabold tracking-tight text-text-primary">
                  {GLOBAL_BRAND_TEXT.NAME}
                </span>
                <span className="hidden text-[10px] font-bold tracking-wider text-trust-emerald sm:inline">
                  ✓ CAMPUS VERIFICADO (.EDU.BR)
                </span>
              </div>
            </Link>

            {/* Primary Navigation Links */}
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href={APP_ROUTES.HOUSING}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                  isHousingActive
                    ? "bg-brand-primary-light text-brand-primary"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>{GLOBAL_BRAND_TEXT.NAV.HOUSING}</span>
              </Link>

              <Link
                href={APP_ROUTES.MARKETPLACE}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                  isMarketplaceActive
                    ? "bg-brand-primary-light text-brand-primary"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{GLOBAL_BRAND_TEXT.NAV.MARKETPLACE}</span>
              </Link>

              <Link
                href={APP_ROUTES.DASHBOARD}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  isDashboardActive
                    ? "bg-brand-primary-light text-brand-primary"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{GLOBAL_BRAND_TEXT.NAV.DASHBOARD}</span>
              </Link>

              <Link
                href={APP_ROUTES.MESSAGES}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  isMessagesActive
                    ? "bg-brand-primary-light text-brand-primary"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{GLOBAL_BRAND_TEXT.NAV.MESSAGES}</span>
                <span className="rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  2
                </span>
              </Link>
            </nav>
          </div>

          {/* Right Actions: Verify Modal Trigger, Create Listing CTA, Profile Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-trust-emerald/30 bg-trust-emerald-light px-3 py-1.5 text-xs font-bold text-trust-emerald transition hover:bg-trust-emerald hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {GLOBAL_BRAND_TEXT.VERIFIED_STUDENT_BADGE}
              </span>
              <span className="sm:hidden">USP ✓</span>
            </button>

            <Link
              href={APP_ROUTES.CREATE_LISTING}
              className="hidden items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:opacity-95 sm:inline-flex"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{GLOBAL_BRAND_TEXT.NAV.ANNOUNCE_CTA}</span>
            </Link>

            <Link
              href={APP_ROUTES.PROFILE}
              className="flex items-center gap-2.5 rounded-full border border-border-subtle bg-bg-secondary py-1.5 pr-3 pl-1.5 transition hover:border-brand-primary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-text-primary text-xs font-bold text-white">
                JM
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-xs font-bold leading-none text-text-primary">
                  Jhonatan Mizu
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-trust-emerald">
                  .uefs.br ✓
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-12">{children}</main>

      {/* Global Footer (Node LRtmD) */}
      <footer className="no-print border-t border-border-subtle bg-bg-primary px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-md space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <Home className="h-4 w-4" />
                </div>
                <span className="font-sans text-lg font-extrabold text-text-primary">
                  {GLOBAL_BRAND_TEXT.NAME}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-text-secondary">
                {GLOBAL_BRAND_TEXT.TAGLINE}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary sm:gap-6">
              <Link
                href={APP_ROUTES.LGPD}
                className="transition hover:text-brand-primary"
              >
                {GLOBAL_BRAND_TEXT.FOOTER_LINKS.LGPD}
              </Link>
              <Link
                href={APP_ROUTES.ADMIN}
                className="transition hover:text-brand-primary"
              >
                {GLOBAL_BRAND_TEXT.FOOTER_LINKS.ADMIN}
              </Link>
              <Link
                href={APP_ROUTES.LOGIN}
                className="transition hover:text-brand-primary"
              >
                {GLOBAL_BRAND_TEXT.NAV.LOGIN}
              </Link>
              <Link
                href={APP_ROUTES.REGISTER}
                className="transition hover:text-brand-primary"
              >
                {GLOBAL_BRAND_TEXT.NAV.REGISTER}
              </Link>
              <Link
                href={APP_ROUTES.VERIFY_OTP}
                className="transition hover:text-brand-primary"
              >
                OTP & Recuperação
              </Link>
            </div>
          </div>

          <div className="h-px w-full bg-border-subtle" />

          <div className="flex flex-col justify-between gap-3 text-xs text-text-muted sm:flex-row sm:items-center">
            <p>{GLOBAL_BRAND_TEXT.COPYRIGHT}</p>
            <div className="inline-flex items-center gap-1.5 font-semibold text-trust-emerald">
              <UserCheck className="h-4 w-4" />
              <span>{GLOBAL_BRAND_TEXT.LGPD_BADGE}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Capsule Tab Bar (Node NXLaZ - 390px Responsive Shell) */}
      <nav
        aria-label="Navegação Mobile Republik"
        className="no-print fixed right-4 bottom-3 left-4 z-40 mx-auto max-w-md rounded-full border border-border-subtle bg-bg-primary/95 px-3 py-2 shadow-xl backdrop-blur-md md:hidden"
      >
        <div className="grid grid-cols-4 gap-1">
          <Link
            href={APP_ROUTES.HOUSING}
            className={`flex flex-col items-center justify-center rounded-full py-1.5 text-[11px] font-bold transition ${
              isHousingActive
                ? "bg-brand-primary-light text-brand-primary"
                : "text-text-secondary"
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="mt-0.5">
              {GLOBAL_BRAND_TEXT.MOBILE_TABS.HOUSING}
            </span>
          </Link>

          <Link
            href={APP_ROUTES.MARKETPLACE}
            className={`flex flex-col items-center justify-center rounded-full py-1.5 text-[11px] font-bold transition ${
              isMarketplaceActive
                ? "bg-brand-primary-light text-brand-primary"
                : "text-text-secondary"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="mt-0.5">
              {GLOBAL_BRAND_TEXT.MOBILE_TABS.MARKETPLACE}
            </span>
          </Link>

          <Link
            href={APP_ROUTES.CREATE_LISTING}
            className={`flex flex-col items-center justify-center rounded-full py-1.5 text-[11px] font-bold transition ${
              activeSection === "WIZARD"
                ? "bg-brand-primary text-white"
                : "text-brand-primary"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="mt-0.5">
              {GLOBAL_BRAND_TEXT.MOBILE_TABS.ANNOUNCE}
            </span>
          </Link>

          <Link
            href={APP_ROUTES.DASHBOARD}
            className={`flex flex-col items-center justify-center rounded-full py-1.5 text-[11px] font-bold transition ${
              isDashboardActive
                ? "bg-brand-primary-light text-brand-primary"
                : "text-text-secondary"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="mt-0.5">
              {GLOBAL_BRAND_TEXT.MOBILE_TABS.DASHBOARD}
            </span>
          </Link>
        </div>
      </nav>

      {/* Student Verification Modal (Node qSgox — Screen 7) */}
      <StudentVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
      />
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-secondary" />}>
      <AppShellContent {...props} />
    </Suspense>
  );
}
