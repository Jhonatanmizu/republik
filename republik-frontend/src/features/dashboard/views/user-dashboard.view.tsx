"use client";

import {
  CheckCircle2,
  Edit3,
  Eye,
  MessageSquare,
  PlusCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes.constants";
import { formatCurrencyBRL } from "@/features/shared-shell/models/domain.model";
import { DASHBOARD_CONSTANTS } from "../dashboard.constants";
import { useDashboardViewModel } from "../view-models/use-dashboard.vm";

export function UserDashboardView() {
  const { state, actions } = useDashboardViewModel();

  const displayedList =
    state.activeTab === "SAVED" ? state.savedListings : state.myListings;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Header & KPI Cards (Screen 6 TLozQ & Mobile 5 v0YGC) */}
      <section className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary font-sans text-xl font-extrabold text-white">
              {DASHBOARD_CONSTANTS.HEADER.INITIALS}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-sans text-2xl font-extrabold text-text-primary">
                  {DASHBOARD_CONSTANTS.HEADER.TITLE}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-trust-emerald-light px-3 py-1 text-xs font-extrabold text-trust-emerald">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {DASHBOARD_CONSTANTS.HEADER.ENROLLMENT_BADGE}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                {DASHBOARD_CONSTANTS.HEADER.SUBTITLE}
              </p>
            </div>
          </div>

          {/* 3 Summary KPI Counters */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-3 text-center">
              <p className="font-sans text-2xl font-extrabold text-text-primary">
                {state.myListings.length}
              </p>
              <p className="text-[11px] font-bold text-text-secondary">
                {DASHBOARD_CONSTANTS.METRICS.ACTIVE_LISTINGS}
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-3 text-center">
              <p className="font-sans text-2xl font-extrabold text-brand-primary">
                14
              </p>
              <p className="text-[11px] font-bold text-text-secondary">
                {DASHBOARD_CONSTANTS.METRICS.CHAT_LEADS}
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-bg-secondary px-4 py-3 text-center">
              <p className="font-sans text-2xl font-extrabold text-trust-emerald">
                8
              </p>
              <p className="text-[11px] font-bold text-text-secondary">
                {DASHBOARD_CONSTANTS.METRICS.SAVED_ITEMS}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Create Button */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-5">
          <div className="flex flex-wrap gap-2">
            {DASHBOARD_CONSTANTS.TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => actions.setActiveTab(t.id)}
                className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                  state.activeTab === t.id
                    ? "bg-text-primary text-white"
                    : "bg-bg-secondary text-text-secondary hover:text-text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Link
            href={APP_ROUTES.CREATE_LISTING}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:opacity-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{DASHBOARD_CONSTANTS.HEADER.CREATE_NEW_CTA}</span>
          </Link>
        </div>
      </section>

      {state.statusFeedback ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-trust-emerald bg-trust-emerald-light px-4 py-3 text-xs font-bold text-trust-emerald-dark">
          <CheckCircle2 className="h-4 w-4" />
          <span>{state.statusFeedback}</span>
        </div>
      ) : null}

      {/* 1-Click Status Management Section */}
      <section className="mt-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-sans text-lg font-extrabold text-text-primary">
              {DASHBOARD_CONSTANTS.ONE_CLICK_STATUS.TITLE}
            </h2>
            <p className="text-xs text-text-secondary">
              {DASHBOARD_CONSTANTS.ONE_CLICK_STATUS.SUBTITLE}
            </p>
          </div>

          <Link
            href={APP_ROUTES.MESSAGES}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-primary underline"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Abrir central de mensagens e interessados →</span>
          </Link>
        </div>

        <div className="mt-4 space-y-4">
          {displayedList.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-primary p-5 shadow-xs lg:flex-row lg:items-center"
            >
              <div className="flex items-start gap-4">
                <Image
                  unoptimized
                  width={224}
                  height={192}
                  src={item.coverPhotoUrl}
                  alt={item.title}
                  className="h-24 w-28 shrink-0 rounded-xl object-cover"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-brand-primary-light px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-brand-primary">
                      {item.type === "HOUSING"
                        ? "MORADIA • VAGA"
                        : "DESAPEGO • MÓVEL"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary">
                      <Eye className="h-3.5 w-3.5" />
                      {item.viewsCount} visualizações • {item.leadsCount}{" "}
                      estudantes interessados
                    </span>
                  </div>

                  <Link
                    href={
                      item.type === "HOUSING"
                        ? APP_ROUTES.HOUSING_DETAIL(item.slug)
                        : APP_ROUTES.MARKETPLACE_DETAIL(item.slug)
                    }
                    className="mt-1.5 block font-sans text-base font-extrabold text-text-primary hover:text-brand-primary"
                  >
                    {item.title}
                  </Link>

                  <p className="mt-1 font-sans text-base font-extrabold text-brand-primary">
                    {formatCurrencyBRL(item.priceCents)}
                    {item.type === "HOUSING"
                      ? " /mês (c/ contas)"
                      : " (Aceita proposta)"}
                  </p>
                </div>
              </div>

              {/* 1-Click Status Buttons + Edit & QR Links */}
              <div className="flex flex-wrap items-center gap-2">
                {DASHBOARD_CONSTANTS.ONE_CLICK_STATUS.STATUSES.map((st) => {
                  const isCurrent = item.status === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        void actions.changeListingStatus(item.id, st.id)
                      }
                      className={`rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
                        isCurrent
                          ? st.id === "DISPONIVEL"
                            ? "border-trust-emerald bg-trust-emerald text-white"
                            : st.id === "RESERVADO"
                              ? "border-warning-amber bg-warning-amber text-white"
                              : "border-text-primary bg-text-primary text-white"
                          : "border-border-subtle bg-bg-secondary text-text-secondary hover:border-text-primary"
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}

                <Link
                  href={APP_ROUTES.QUICK_EDIT(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2 text-xs font-bold text-text-primary transition hover:border-brand-primary"
                >
                  <Edit3 className="h-3.5 w-3.5 text-brand-primary" />
                  <span>{DASHBOARD_CONSTANTS.ONE_CLICK_STATUS.EDIT_CTA}</span>
                </Link>

                <Link
                  href={APP_ROUTES.SHARE_KIT(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2 text-xs font-bold text-text-primary transition hover:border-brand-primary"
                >
                  <QrCode className="h-3.5 w-3.5 text-trust-emerald" />
                  <span>{DASHBOARD_CONSTANTS.ONE_CLICK_STATUS.SHARE_CTA}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Verification Summary Banner */}
      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-trust-emerald/30 bg-trust-emerald-light/60 p-5 sm:flex-row">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-trust-emerald" />
          <div>
            <h3 className="text-sm font-extrabold text-text-primary">
              Aluno Verificado (.edu.br) • Confiança Máxima no Campus
            </h3>
            <p className="text-xs text-text-secondary">
              Seus anúncios recebem destaque automático para estudantes da USP,
              UFBA, UEFS e Unicamp.
            </p>
          </div>
        </div>
        <Link
          href={APP_ROUTES.PROFILE}
          className="rounded-xl bg-trust-emerald px-4 py-2 text-xs font-extrabold text-white"
        >
          Ver Perfil & Privacidade LGPD
        </Link>
      </div>
    </div>
  );
}
