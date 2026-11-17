"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ListingItem,
  ListingItemSchema,
} from "@/features/shared-shell/models/domain.model";
import { FALLBACK_LISTINGS } from "@/features/shared-shell/models/fallback-seed.data";
import { apiFetch } from "@/lib/api-client";

export interface HousingDiscoveryViewModel {
  state: {
    readonly listings: readonly ListingItem[];
    readonly isLoading: boolean;
    readonly error: string | null;
    readonly searchQuery: string;
    readonly selectedUniversity: string;
    readonly selectedModality: string;
    readonly maxBudgetCents: number;
    readonly activeChip: string;
    readonly isFilterSheetOpen: boolean;
  };
  computed: {
    readonly activeFiltersCount: number;
    readonly totalCount: number;
  };
  actions: {
    setSearchQuery: (q: string) => void;
    setSelectedUniversity: (uni: string) => void;
    setSelectedModality: (mod: string) => void;
    setMaxBudgetCents: (cents: number) => void;
    setActiveChip: (chipId: string) => void;
    setIsFilterSheetOpen: (open: boolean) => void;
    applySearch: () => Promise<void>;
    clearAllFilters: () => void;
    toggleFavorite: (listingId: string) => Promise<void>;
  };
}

export function useHousingDiscoveryViewModel(): HousingDiscoveryViewModel {
  const initialHousing = useMemo(
    () => FALLBACK_LISTINGS.filter((item) => item.type === "HOUSING"),
    [],
  );

  const [listings, setListings] =
    useState<readonly ListingItem[]>(initialHousing);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("ALL");
  const [selectedModality, setSelectedModality] = useState<string>("");
  const [maxBudgetCents, setMaxBudgetCents] = useState<number>(0);
  const [activeChip, setActiveChip] = useState<string>("ALL");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);

  const fetchHousingListings = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("type", "HOUSING");
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (selectedUniversity && selectedUniversity !== "ALL") {
      params.set("university", selectedUniversity);
    }
    if (selectedModality) {
      params.set("modality", selectedModality);
    }
    if (maxBudgetCents > 0) {
      params.set("maxPriceCents", String(maxBudgetCents));
    }
    if (activeChip === "BILLS_INCLUDED") {
      params.set("billsIncluded", "true");
    } else if (activeChip === "FURNISHED") {
      params.set("furnished", "true");
    } else if (activeChip === "PETS") {
      params.set("petsAllowed", "true");
    } else if (activeChip === "SUITE") {
      params.set("modality", "SUITE");
    } else if (
      activeChip === "SO_MENINAS" ||
      activeChip === "SO_MENINOS" ||
      activeChip === "MISTO"
    ) {
      params.set("genderPreference", activeChip);
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
      setListings(parsed);
    } catch {
      // Client-side full-text & filter fallback when running offline
      const qLower = searchQuery.trim().toLowerCase();
      const filtered = initialHousing.filter((item) => {
        if (
          selectedUniversity !== "ALL" &&
          item.university.code.toUpperCase() !==
            selectedUniversity.toUpperCase()
        ) {
          return false;
        }
        if (selectedModality && item.housing?.modality !== selectedModality) {
          return false;
        }
        if (maxBudgetCents > 0 && item.priceCents > maxBudgetCents) {
          return false;
        }
        if (activeChip === "BILLS_INCLUDED" && !item.housing?.billsIncluded) {
          return false;
        }
        if (activeChip === "FURNISHED" && !item.housing?.furnished) {
          return false;
        }
        if (activeChip === "PETS" && !item.housing?.petsAllowed) {
          return false;
        }
        if (activeChip === "SUITE" && item.housing?.modality !== "SUITE") {
          return false;
        }
        if (
          (activeChip === "SO_MENINAS" ||
            activeChip === "SO_MENINOS" ||
            activeChip === "MISTO") &&
          item.housing?.genderPreference !== activeChip
        ) {
          return false;
        }
        if (qLower) {
          const haystack =
            `${item.title} ${item.description} ${item.neighborhood} ${item.proximityLabel} ${item.university.code}`.toLowerCase();
          return haystack.includes(qLower);
        }
        return true;
      });
      setListings(filtered);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeChip,
    initialHousing,
    maxBudgetCents,
    searchQuery,
    selectedModality,
    selectedUniversity,
  ]);

  useEffect(() => {
    void fetchHousingListings();
  }, [fetchHousingListings]);

  const clearAllFilters = (): void => {
    setSearchQuery("");
    setSelectedUniversity("ALL");
    setSelectedModality("");
    setMaxBudgetCents(0);
    setActiveChip("ALL");
  };

  const toggleFavorite = async (listingId: string): Promise<void> => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId
          ? {
              ...item,
              isSaved: !item.isSaved,
              favoritesCount: item.isSaved
                ? Math.max(0, item.favoritesCount - 1)
                : item.favoritesCount + 1,
            }
          : item,
      ),
    );
    try {
      await apiFetch(`/listings/${listingId}/favorite`, { method: "POST" });
    } catch {
      // Optimistic state kept
    }
  };

  const activeFiltersCount =
    (selectedUniversity !== "ALL" ? 1 : 0) +
    (selectedModality ? 1 : 0) +
    (maxBudgetCents > 0 ? 1 : 0) +
    (activeChip !== "ALL" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return {
    state: {
      listings,
      isLoading,
      error,
      searchQuery,
      selectedUniversity,
      selectedModality,
      maxBudgetCents,
      activeChip,
      isFilterSheetOpen,
    },
    computed: {
      activeFiltersCount,
      totalCount: listings.length,
    },
    actions: {
      setSearchQuery,
      setSelectedUniversity,
      setSelectedModality,
      setMaxBudgetCents,
      setActiveChip,
      setIsFilterSheetOpen,
      applySearch: fetchHousingListings,
      clearAllFilters,
      toggleFavorite,
    },
  };
}
