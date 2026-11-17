"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { ADMIN_CONSTANTS } from "../admin.constants";
import { useAdminModerationViewModel } from "../view-models/use-admin-moderation.vm";

export function AdminModerationView() {
  const { state, actions } = useAdminModerationViewModel();
  const { overview } = state;

  const inspectedItem =
    overview.verifications.find((v) => v.id === state.selectedVerificationId) ??
    overview.verifications[0];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Admin Top Bar (Screen 16 kZ0Wc — Node VgbFU) */}
      <section className="flex flex-col justify-between gap-4 rounded-3xl border border-border-subtle bg-text-primary p-6 text-white sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-0.5 text-[10px] font-extrabold tracking-wider text-white">
            {ADMIN_CONSTANTS.TOP_BAR.BADGE}
          </span>
          <h1 className="mt-1.5 font-sans text-2xl font-extrabold text-white">
            {ADMIN_CONSTANTS.TOP_BAR.TITLE}
          </h1>
        </div>

        <div className="flex flex-1 max-w-md items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5">
          <Search className="h-4 w-4 text-white/70" />
          <input
            type="text"
            value={state.searchQuery}
            onChange={(e) => actions.setSearchQuery(e.target.value)}
            placeholder={ADMIN_CONSTANTS.TOP_BAR.SEARCH_PLACEHOLDER}
            className="w-full bg-transparent text-xs font-medium text-white outline-none placeholder:text-white/60"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-trust-emerald text-xs font-extrabold text-white">
            SA
          </div>
          <span className="text-xs font-bold text-white">
            {ADMIN_CONSTANTS.TOP_BAR.ROLE_LABEL}
          </span>
        </div>
      </section>

      {state.actionFeedback ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-trust-emerald bg-trust-emerald-light px-4 py-3 text-xs font-extrabold text-trust-emerald-dark">
          <CheckCircle2 className="h-4 w-4" />
          <span>{state.actionFeedback}</span>
        </div>
      ) : null}

      {/* 4 KPI Cards */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border-subtle bg-bg-primary p-5 shadow-xs">
          <p className="text-xs font-bold text-text-secondary">
            {ADMIN_CONSTANTS.METRICS.PENDING_VERIFICATIONS}
          </p>
          <p className="mt-2 font-sans text-3xl font-extrabold text-text-primary">
            {overview.metrics.pendingVerificationsCount}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            {ADMIN_CONSTANTS.METRICS.PENDING_VERIFICATIONS_SUB}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-primary-border bg-brand-primary-light/50 p-5 shadow-xs">
          <p className="text-xs font-bold text-brand-primary">
            {ADMIN_CONSTANTS.METRICS.PENDING_REPORTS}
          </p>
          <p className="mt-2 font-sans text-3xl font-extrabold text-brand-primary">
            {overview.metrics.pendingReportsCount} pendentes
          </p>
          <p className="mt-1 text-[11px] text-text-secondary">
            {ADMIN_CONSTANTS.METRICS.PENDING_REPORTS_SUB}
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-primary p-5 shadow-xs">
          <p className="text-xs font-bold text-text-secondary">
            {ADMIN_CONSTANTS.METRICS.ACTIVE_LISTINGS}
          </p>
          <p className="mt-2 font-sans text-3xl font-extrabold text-text-primary">
            {overview.metrics.activeListingsCount}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-trust-emerald">
            {ADMIN_CONSTANTS.METRICS.ACTIVE_LISTINGS_SUB}
          </p>
        </div>

        <div className="rounded-2xl border border-trust-emerald/40 bg-trust-emerald-light/40 p-5 shadow-xs">
          <p className="text-xs font-bold text-trust-emerald-dark">
            {ADMIN_CONSTANTS.METRICS.TRUST_RATE}
          </p>
          <p className="mt-2 font-sans text-3xl font-extrabold text-trust-emerald">
            {overview.metrics.networkTrustRate}
          </p>
          <p className="mt-1 text-[11px] text-text-secondary">
            {ADMIN_CONSTANTS.METRICS.TRUST_RATE_SUB}
          </p>
        </div>
      </section>

      {/* Queue 1: Manual Academic Verification Queue */}
      <section className="mt-8 rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-sans text-lg font-extrabold text-text-primary">
            {ADMIN_CONSTANTS.VERIFICATION_QUEUE.TITLE}
          </h2>
          <span className="rounded-full bg-warning-amber-light px-3 py-1 text-xs font-extrabold text-warning-amber">
            {overview.verifications.length}{" "}
            {ADMIN_CONSTANTS.VERIFICATION_QUEUE.WAITING_BADGE}
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] font-extrabold uppercase text-text-muted">
                <th className="py-3 pr-4">
                  {ADMIN_CONSTANTS.VERIFICATION_QUEUE.COLUMNS.STUDENT}
                </th>
                <th className="py-3 pr-4">
                  {ADMIN_CONSTANTS.VERIFICATION_QUEUE.COLUMNS.UNI_RA}
                </th>
                <th className="py-3 pr-4">
                  {ADMIN_CONSTANTS.VERIFICATION_QUEUE.COLUMNS.DOCUMENT}
                </th>
                <th className="py-3">
                  {ADMIN_CONSTANTS.VERIFICATION_QUEUE.COLUMNS.STATUS}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {overview.verifications.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => actions.setSelectedVerificationId(v.id)}
                  className="cursor-pointer transition hover:bg-bg-secondary"
                >
                  <td className="py-3.5 pr-4 font-bold text-text-primary">
                    {v.studentName} •{" "}
                    <span className="text-text-secondary">
                      {v.studentEmail}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-text-secondary">
                    {v.universityName}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-bg-secondary px-2.5 py-1 font-mono text-xs font-bold text-text-primary">
                      <FileText className="h-3.5 w-3.5 text-brand-primary" />
                      {v.documentName}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                        v.status === "APPROVED"
                          ? "bg-trust-emerald-light text-trust-emerald"
                          : v.status === "REJECTED"
                            ? "bg-brand-primary-light text-brand-primary"
                            : "bg-warning-amber-light text-warning-amber"
                      }`}
                    >
                      ● {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Document Inspection Action Panel */}
        {inspectedItem ? (
          <div className="mt-5 rounded-2xl border border-border-subtle bg-bg-secondary p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-extrabold text-text-primary">
                  {ADMIN_CONSTANTS.VERIFICATION_QUEUE.INSPECTION_HEADER}
                </p>
                <p className="mt-1 text-xs font-semibold text-trust-emerald">
                  Estudante: {inspectedItem.studentName} • RA:{" "}
                  {inspectedItem.registrationNumber} • E-mail coincidente:{" "}
                  {inspectedItem.studentEmail} ✓
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void actions.decideVerification(
                      inspectedItem.id,
                      "APPROVED",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-trust-emerald px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-trust-emerald-dark"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{ADMIN_CONSTANTS.VERIFICATION_QUEUE.APPROVE_CTA}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void actions.decideVerification(
                      inspectedItem.id,
                      "NEEDS_RESUBMISSION",
                    )
                  }
                  className="rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-xs font-bold text-text-primary"
                >
                  {ADMIN_CONSTANTS.VERIFICATION_QUEUE.RESUBMIT_CTA}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void actions.decideVerification(
                      inspectedItem.id,
                      "REJECTED",
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-brand-primary-border bg-brand-primary-light px-4 py-2.5 text-xs font-extrabold text-brand-primary"
                >
                  <XCircle className="h-4 w-4" />
                  <span>{ADMIN_CONSTANTS.VERIFICATION_QUEUE.REJECT_CTA}</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Queue 2: Safety Reports Queue ("Fila de Denúncias de Segurança") */}
      <section className="mt-8 rounded-3xl border border-brand-primary-border bg-bg-primary p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-brand-primary" />
            <h2 className="font-sans text-lg font-extrabold text-text-primary">
              {ADMIN_CONSTANTS.REPORTS_QUEUE.TITLE}
            </h2>
          </div>
          <span className="rounded-full bg-brand-primary-light px-3 py-1 text-xs font-extrabold text-brand-primary">
            ⚠️ {overview.reports.length} pendentes
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {overview.reports.map((rep) => (
            <div
              key={rep.id}
              className="rounded-2xl border border-border-subtle bg-bg-secondary p-5"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-brand-primary">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {ADMIN_CONSTANTS.REPORTS_QUEUE.REASON_HEADER}
                </span>
                <span className="rounded-full bg-white px-3 py-0.5 text-xs font-bold text-text-primary">
                  Status: {rep.status}
                </span>
              </div>

              <h3 className="mt-2 font-sans text-base font-extrabold text-text-primary">
                &ldquo;{rep.reason}&rdquo;
              </h3>
              <p className="mt-1 text-xs text-text-secondary">{rep.details}</p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => void actions.decideReport(rep.id, "RESOLVED")}
                  className="rounded-xl border border-border-subtle bg-white px-4 py-2.5 text-xs font-bold text-text-primary"
                >
                  {ADMIN_CONSTANTS.REPORTS_QUEUE.CONTACT_CTA}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void actions.decideReport(rep.id, "PAUSED_LISTING")
                  }
                  className="rounded-xl bg-warning-amber px-4 py-2.5 text-xs font-extrabold text-white"
                >
                  {ADMIN_CONSTANTS.REPORTS_QUEUE.PAUSE_CTA}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void actions.decideReport(rep.id, "BANNED_USER")
                  }
                  className="rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-extrabold text-white"
                >
                  {ADMIN_CONSTANTS.REPORTS_QUEUE.BAN_CTA}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
