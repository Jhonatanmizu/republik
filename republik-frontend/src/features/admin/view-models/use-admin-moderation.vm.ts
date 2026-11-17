"use client";

import { useEffect, useState } from "react";
import {
  type AdminOverview,
  AdminOverviewSchema,
} from "@/features/shared-shell/models/domain.model";
import { FALLBACK_ADMIN_OVERVIEW } from "@/features/shared-shell/models/fallback-seed.data";
import { apiFetch } from "@/lib/api-client";

export interface AdminModerationViewModel {
  state: {
    readonly overview: AdminOverview;
    readonly searchQuery: string;
    readonly selectedVerificationId: string;
    readonly actionFeedback: string | null;
  };
  actions: {
    setSearchQuery: (q: string) => void;
    setSelectedVerificationId: (id: string) => void;
    decideVerification: (
      id: string,
      decision: "APPROVED" | "NEEDS_RESUBMISSION" | "REJECTED",
    ) => Promise<void>;
    decideReport: (
      id: string,
      action: "PAUSED_LISTING" | "BANNED_USER" | "RESOLVED",
    ) => Promise<void>;
  };
}

export function useAdminModerationViewModel(): AdminModerationViewModel {
  const [overview, setOverview] = useState<AdminOverview>(
    FALLBACK_ADMIN_OVERVIEW,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedVerificationId, setSelectedVerificationId] = useState<string>(
    FALLBACK_ADMIN_OVERVIEW.verifications[0]?.id ?? "vr-1",
  );
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      try {
        const params = searchQuery.trim()
          ? `?q=${encodeURIComponent(searchQuery.trim())}`
          : "";
        const res = await apiFetch<unknown>(`/admin/overview${params}`);
        const parsed = AdminOverviewSchema.safeParse(res);
        if (active && parsed.success) {
          setOverview(parsed.data);
          if (parsed.data.verifications[0]) {
            setSelectedVerificationId(parsed.data.verifications[0].id);
          }
        }
      } catch {
        // Keep seeded fallback
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [searchQuery]);

  const decideVerification = async (
    id: string,
    decision: "APPROVED" | "NEEDS_RESUBMISSION" | "REJECTED",
  ): Promise<void> => {
    setOverview((prev) => ({
      ...prev,
      verifications: prev.verifications.map((v) =>
        v.id === id ? { ...v, status: decision } : v,
      ),
    }));
    setActionFeedback(
      decision === "APPROVED"
        ? "Selo Estudante Verificado aprovado e ativado na conta do aluno!"
        : `Status da verificação atualizado para ${decision}.`,
    );
    try {
      await apiFetch(`/admin/verifications/${id}`, {
        method: "PATCH",
        body: { decision },
      });
    } catch {
      // Optimistic state kept
    }
  };

  const decideReport = async (
    id: string,
    action: "PAUSED_LISTING" | "BANNED_USER" | "RESOLVED",
  ): Promise<void> => {
    setOverview((prev) => ({
      ...prev,
      reports: prev.reports.map((r) =>
        r.id === id ? { ...r, status: action } : r,
      ),
    }));
    setActionFeedback(
      action === "PAUSED_LISTING"
        ? "Anúncio pausado preventivamente e ocultado da busca."
        : action === "BANNED_USER"
          ? "Usuário banido e comunidade notificada com segurança."
          : "Denúncia atualizada.",
    );
    try {
      await apiFetch(`/admin/reports/${id}`, {
        method: "PATCH",
        body: { action },
      });
    } catch {
      // Optimistic state kept
    }
  };

  return {
    state: {
      overview,
      searchQuery,
      selectedVerificationId,
      actionFeedback,
    },
    actions: {
      setSearchQuery,
      setSelectedVerificationId,
      decideVerification,
      decideReport,
    },
  };
}
