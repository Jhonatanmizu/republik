"use client";

import {
  CheckCheck,
  ExternalLink,
  Lock,
  PhoneCall,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { FRONTEND_ENV } from "@/config/env.config";
import { APP_ROUTES } from "@/constants/routes.constants";
import { formatCurrencyBRL } from "@/features/shared-shell/models/domain.model";
import { CHAT_CONSTANTS } from "../chat.constants";
import { useChatWorkspaceViewModel } from "../view-models/use-chat.vm";

export function ChatWorkspaceView() {
  const { state, actions } = useChatWorkspaceViewModel();
  const { activeConversation } = state;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Top Header (Screen 13 UNjUZ & Mobile 6 vhz0v) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-brand-primary">
            {CHAT_CONSTANTS.HEADER.BREADCRUMB}
          </p>
          <h1 className="font-sans text-2xl font-extrabold text-text-primary">
            {CHAT_CONSTANTS.HEADER.TITLE}
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-emerald-light px-3.5 py-1.5 text-xs font-extrabold text-trust-emerald">
          <Lock className="h-3.5 w-3.5" />
          <span>{CHAT_CONSTANTS.HEADER.SUBTITLE}</span>
        </span>
      </div>

      {/* Main Two-Column Chat Layout */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Sidebar: Thread List & Filters */}
        <aside className="rounded-3xl border border-border-subtle bg-bg-primary p-4 shadow-xs lg:col-span-4">
          <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2.5">
            <Search className="h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={state.searchQuery}
              onChange={(e) => actions.setSearchQuery(e.target.value)}
              placeholder={CHAT_CONSTANTS.HEADER.SEARCH_PLACEHOLDER}
              className="w-full bg-transparent text-xs font-medium text-text-primary outline-none"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {CHAT_CONSTANTS.FILTER_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => actions.setFilterTab(t.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                  state.filterTab === t.id
                    ? "bg-text-primary text-white"
                    : "bg-bg-secondary text-text-secondary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {state.conversations.map((conv) => {
              const isSelected = conv.id === activeConversation.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => actions.setSelectedConversationId(conv.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                    isSelected
                      ? "border-brand-primary bg-brand-primary-light/50"
                      : "border-border-subtle bg-bg-secondary hover:border-text-secondary"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-extrabold text-white">
                    {conv.peer.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-sans text-sm font-extrabold text-text-primary">
                        {conv.peer.fullName}
                      </span>
                      {conv.unreadCount > 0 ? (
                        <span className="rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-extrabold text-white">
                          {conv.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-[11px] font-bold text-brand-primary">
                      {conv.listing.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-secondary">
                      {conv.lastMessagePreview}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Active Conversation Thread */}
        <section className="flex flex-col justify-between rounded-3xl border border-border-subtle bg-bg-primary shadow-xs lg:col-span-8">
          {/* Peer & Listing Context Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-trust-emerald text-sm font-extrabold text-white">
                {activeConversation.peer.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-sans text-base font-extrabold text-text-primary">
                    {activeConversation.peer.fullName}
                  </h2>
                  <ShieldCheck className="h-4 w-4 text-trust-emerald" />
                </div>
                <p className="text-xs font-semibold text-text-secondary">
                  {activeConversation.peer.courseName}
                </p>
                <p className="text-[11px] font-bold text-trust-emerald">
                  {CHAT_CONSTANTS.THREAD.ONLINE_PREFIX}{" "}
                  {activeConversation.listing.title} (
                  {formatCurrencyBRL(activeConversation.listing.priceCents)})
                </p>
              </div>
            </div>

            <Link
              href={
                activeConversation.listing.type === "HOUSING"
                  ? APP_ROUTES.HOUSING_DETAIL(activeConversation.listing.slug)
                  : APP_ROUTES.MARKETPLACE_DETAIL(
                      activeConversation.listing.slug,
                    )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-bg-secondary px-3.5 py-2 text-xs font-bold text-text-primary transition hover:border-brand-primary"
            >
              <span>{CHAT_CONSTANTS.THREAD.VIEW_LISTING_CTA}</span>
              <ExternalLink className="h-3.5 w-3.5 text-brand-primary" />
            </Link>
          </div>

          {/* Safety Notice Banner */}
          <div className="bg-warning-amber-light/60 px-5 py-2.5 text-xs font-semibold text-text-primary">
            {CHAT_CONSTANTS.THREAD.SAFETY_BANNER}
          </div>

          {/* Messages Stream */}
          <div className="max-h-96 flex-1 space-y-4 overflow-y-auto p-5">
            <p className="text-center text-[11px] font-bold text-text-muted">
              {CHAT_CONSTANTS.THREAD.DATE_HEADER}
            </p>

            {state.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.isMine ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-lg rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.isSystemMessage
                      ? "border border-trust-emerald bg-trust-emerald-light font-bold text-trust-emerald-dark"
                      : msg.isMine
                        ? "bg-brand-primary font-medium text-white"
                        : "border border-border-subtle bg-bg-secondary font-medium text-text-primary"
                  }`}
                >
                  {msg.body}
                </div>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-text-muted">
                  {msg.isMine ? "Você" : activeConversation.peer.fullName} •{" "}
                  {msg.isMine ? (
                    <>
                      <CheckCheck className="h-3 w-3 text-trust-emerald" />
                      {CHAT_CONSTANTS.THREAD.READ_RECEIPT}
                    </>
                  ) : (
                    "14:20"
                  )}
                </span>
              </div>
            ))}

            {/* Safe WhatsApp Reveal Box (Mobile 6 vhz0v & Screen 13 UNjUZ) */}
            {activeConversation.whatsappRevealedByHost ? (
              <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-trust-emerald bg-trust-emerald-light p-4 sm:flex-row">
                <div>
                  <p className="text-xs font-extrabold text-trust-emerald-dark">
                    {CHAT_CONSTANTS.THREAD.WHATSAPP_AUTHORIZED_NOTE}
                  </p>
                  <p className="text-xs font-bold text-text-primary">
                    WhatsApp verificado:{" "}
                    {activeConversation.peer.whatsapp ?? "+55 (11) 97233-1902"}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${FRONTEND_ENV.SUPPORT_WHATSAPP}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-trust-emerald px-4 py-2.5 text-xs font-extrabold text-white"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{CHAT_CONSTANTS.THREAD.OPEN_WHATSAPP_CTA}</span>
                </a>
              </div>
            ) : null}
          </div>

          {/* Sticky Bottom Input & WhatsApp Safe Trigger */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void actions.sendMessage();
            }}
            className="flex flex-col gap-3 border-t border-border-subtle bg-bg-secondary p-4 sm:flex-row sm:items-center"
          >
            <input
              type="text"
              value={state.draftMessage}
              onChange={(e) => actions.setDraftMessage(e.target.value)}
              placeholder={CHAT_CONSTANTS.THREAD.INPUT_PLACEHOLDER}
              className="flex-1 rounded-xl border border-border-subtle bg-white px-4 py-3 text-xs font-medium text-text-primary outline-none focus:border-brand-primary"
            />

            <div className="flex items-center gap-2">
              {!activeConversation.whatsappRevealedByHost ? (
                <button
                  type="button"
                  onClick={() =>
                    void actions.triggerWhatsappAction("AUTHORIZE")
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-trust-emerald bg-trust-emerald-light px-3.5 py-3 text-xs font-extrabold text-trust-emerald transition hover:bg-trust-emerald hover:text-white"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{CHAT_CONSTANTS.THREAD.REQUEST_WHATSAPP_CTA}</span>
                </button>
              ) : null}

              <button
                type="submit"
                disabled={state.isSending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-3 text-xs font-extrabold text-white shadow-xs transition hover:opacity-95"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{CHAT_CONSTANTS.THREAD.SEND_CTA}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
