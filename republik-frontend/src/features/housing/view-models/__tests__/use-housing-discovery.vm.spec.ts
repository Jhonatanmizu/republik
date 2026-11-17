import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  formatCurrencyBRL,
  formatExactBRL,
} from "@/features/shared-shell/models/domain.model";
import { useHousingDiscoveryViewModel } from "../use-housing-discovery.vm";

describe("useHousingDiscoveryViewModel", () => {
  it("initializes with housing listings and updates filters cleanly", async () => {
    const { result } = renderHook(() => useHousingDiscoveryViewModel());

    await waitFor(() => {
      expect(result.current.state.listings.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.actions.setSelectedUniversity("UEFS");
    });

    await waitFor(() => {
      expect(result.current.state.selectedUniversity).toBe("UEFS");
      expect(result.current.computed.activeFiltersCount).toBeGreaterThanOrEqual(
        1,
      );
    });

    act(() => {
      result.current.actions.clearAllFilters();
    });

    expect(result.current.state.selectedUniversity).toBe("ALL");
  });

  it("formats currency values in BRL accurately", () => {
    expect(formatCurrencyBRL(75_000)).toBe("R$ 750");
    expect(formatExactBRL(60_000)).toContain("600,00");
  });
});
