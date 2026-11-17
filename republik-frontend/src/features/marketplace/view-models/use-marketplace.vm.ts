"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ListingItem,
  ListingItemSchema,
} from "@/features/shared-shell/models/domain.model";
import { FALLBACK_LISTINGS } from "@/features/shared-shell/models/fallback-seed.data";
import { apiFetch } from "@/lib/api-client";

export interface MarketplaceFeedViewModel {
  state: {
    readonly items: readonly ListingItem[];
    readonly isLoading: boolean;
    readonly searchQuery: string;
    readonly selectedCategory: string;
    readonly selectedUniversity: string;
  };
  actions: {
    setSearchQuery: (q: string) => void;
    setSelectedCategory: (cat: string) => void;
    setSelectedUniversity: (uni: string) => void;
    applySearch: () => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
  };
}

export function useMarketplaceViewModel(): MarketplaceFeedViewModel {
  const initialMarket = useMemo(
    () => FALLBACK_LISTINGS.filter((item) => item.type === "MARKETPLACE"),
    [],
  );

  const [items, setItems] = useState<readonly ListingItem[]>(initialMarket);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("ALL");

  const fetchMarketplace = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("type", "MARKETPLACE");
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (selectedUniversity && selectedUniversity !== "ALL") {
      params.set("university", selectedUniversity);
    }
    if (selectedCategory === "URGENT") {
      params.set("urgentMoving", "true");
    } else if (selectedCategory && selectedCategory !== "ALL") {
      params.set("category", selectedCategory);
    }

    try {
      const response = await apiFetch<{ listings: unknown[] }>(
        `/listings?${params.toString()}`,
      );
      const parsed: ListingItem[] = [];
      for (const item of response.listings) {
        const res = ListingItemSchema.safeParse(item);
        if (res.success) {
          parsed.push(res.data);
        }
      }
      setItems(parsed);
    } catch {
      const qLower = searchQuery.trim().toLowerCase();
      const filtered = initialMarket.filter((item) => {
        if (
          selectedUniversity !== "ALL" &&
          item.university.code.toUpperCase() !==
            selectedUniversity.toUpperCase()
        ) {
          return false;
        }
        if (
          selectedCategory === "URGENT" &&
          !item.marketplace?.isUrgentMoving
        ) {
          return false;
        }
        if (
          selectedCategory !== "ALL" &&
          selectedCategory !== "URGENT" &&
          item.marketplace?.category !== selectedCategory
        ) {
          return false;
        }
        if (qLower) {
          const text =
            `${item.title} ${item.description} ${item.neighborhood} ${item.proximityLabel}`.toLowerCase();
          return text.includes(qLower);
        }
        return true;
      });
      setItems(filtered);
    } finally {
      setIsLoading(false);
    }
  }, [initialMarket, searchQuery, selectedCategory, selectedUniversity]);

  useEffect(() => {
    void fetchMarketplace();
  }, [fetchMarketplace]);

  const toggleFavorite = async (id: string): Promise<void> => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSaved: !item.isSaved } : item,
      ),
    );
    try {
      await apiFetch(`/listings/${id}/favorite`, { method: "POST" });
    } catch {
      // Keep optimistic toggle
    }
  };

  return {
    state: {
      items,
      isLoading,
      searchQuery,
      selectedCategory,
      selectedUniversity,
    },
    actions: {
      setSearchQuery,
      setSelectedCategory,
      setSelectedUniversity,
      applySearch: fetchMarketplace,
      toggleFavorite,
    },
  };
}
