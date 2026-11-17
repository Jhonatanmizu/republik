"use client";

import { useEffect, useState } from "react";
import {
  type ListingItem,
  ListingItemSchema,
} from "@/features/shared-shell/models/domain.model";
import { FALLBACK_LISTINGS } from "@/features/shared-shell/models/fallback-seed.data";
import { apiFetch } from "@/lib/api-client";

export type DashboardTab = "ACTIVE" | "SAVED" | "MESSAGES" | "VERIFICATION";

export interface DashboardViewModel {
  state: {
    readonly activeTab: DashboardTab;
    readonly myListings: readonly ListingItem[];
    readonly savedListings: readonly ListingItem[];
    readonly isLoading: boolean;
    readonly statusFeedback: string | null;
  };
  actions: {
    setActiveTab: (tab: DashboardTab) => void;
    changeListingStatus: (
      listingId: string,
      status: "DISPONIVEL" | "RESERVADO" | "ALUGADO_VENDIDO",
    ) => Promise<void>;
  };
}

export function useDashboardViewModel(): DashboardViewModel {
  const [activeTab, setActiveTab] = useState<DashboardTab>("ACTIVE");
  const [myListings, setMyListings] = useState<readonly ListingItem[]>(
    FALLBACK_LISTINGS.slice(0, 3),
  );
  const [savedListings, setSavedListings] = useState<readonly ListingItem[]>(
    FALLBACK_LISTINGS.filter((item) => item.isSaved),
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const res = await apiFetch<{ listings: unknown[] }>(
          "/listings?includeAllStatuses=true",
        );
        const parsed: ListingItem[] = [];
        for (const item of res.listings) {
          const check = ListingItemSchema.safeParse(item);
          if (check.success) {
            parsed.push(check.data);
          }
        }
        if (active && parsed.length > 0) {
          setMyListings(parsed.slice(0, 4));
          setSavedListings(parsed.filter((item) => item.isSaved));
        }
      } catch {
        // Keep seeded fallback
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const changeListingStatus = async (
    listingId: string,
    status: "DISPONIVEL" | "RESERVADO" | "ALUGADO_VENDIDO",
  ): Promise<void> => {
    setMyListings((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, status } : item)),
    );
    setStatusFeedback(`Status atualizado para ${status} instantaneamente!`);
    try {
      await apiFetch(`/listings/${listingId}/status`, {
        method: "PATCH",
        body: { status },
      });
    } catch {
      // Optimistic update preserved
    }
  };

  return {
    state: {
      activeTab,
      myListings,
      savedListings,
      isLoading,
      statusFeedback,
    },
    actions: {
      setActiveTab,
      changeListingStatus,
    },
  };
}
