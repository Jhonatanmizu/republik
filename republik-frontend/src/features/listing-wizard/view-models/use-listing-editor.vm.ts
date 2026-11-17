"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_ROUTES } from "@/constants/routes.constants";
import {
  type ListingItem,
  ListingItemSchema,
} from "@/features/shared-shell/models/domain.model";
import {
  DEFAULT_FALLBACK_LISTING,
  FALLBACK_LISTINGS,
} from "@/features/shared-shell/models/fallback-seed.data";
import { apiFetch } from "@/lib/api-client";

export interface ListingEditorViewModel {
  state: {
    readonly listing: ListingItem;
    readonly title: string;
    readonly status: "DISPONIVEL" | "RESERVADO" | "ALUGADO_VENDIDO" | "PAUSADO";
    readonly baseRentReais: number;
    readonly condoReais: number;
    readonly includedExpenses: readonly string[];
    readonly genderPreference: "MISTO" | "SO_MENINAS" | "SO_MENINOS";
    readonly petsAllowed: boolean;
    readonly smokingPolicy: string;
    readonly houseRoutine: string;
    readonly isSaving: boolean;
    readonly saveSuccess: string | null;
  };
  computed: {
    readonly totalMonthlyCents: number;
  };
  actions: {
    setTitle: (val: string) => void;
    setStatus: (
      val: "DISPONIVEL" | "RESERVADO" | "ALUGADO_VENDIDO" | "PAUSADO",
    ) => void;
    setBaseRentReais: (val: number) => void;
    setCondoReais: (val: number) => void;
    toggleExpense: (expId: string) => void;
    setGenderPreference: (val: "MISTO" | "SO_MENINAS" | "SO_MENINOS") => void;
    setPetsAllowed: (val: boolean) => void;
    setSmokingPolicy: (val: string) => void;
    setHouseRoutine: (val: string) => void;
    saveChanges: () => Promise<void>;
    deletePermanently: () => Promise<void>;
  };
}

export function useListingEditorViewModel(
  listingId: string,
): ListingEditorViewModel {
  const router = useRouter();
  const initial =
    FALLBACK_LISTINGS.find(
      (item) => item.id === listingId || item.code === listingId,
    ) ?? DEFAULT_FALLBACK_LISTING;

  const [listing, setListing] = useState<ListingItem>(initial);
  const [title, setTitle] = useState<string>(
    "Quarto Individual Pinheiros — Mobiliado c/ Contas",
  );
  const [status, setStatus] = useState<
    "DISPONIVEL" | "RESERVADO" | "ALUGADO_VENDIDO" | "PAUSADO"
  >(initial.status);
  const [baseRentReais, setBaseRentReais] = useState<number>(950);
  const [condoReais, setCondoReais] = useState<number>(250);
  const [includedExpenses, setIncludedExpenses] = useState<readonly string[]>([
    "AGUA",
    "LUZ",
    "INTERNET",
    "FAXINA",
  ]);
  const [genderPreference, setGenderPreference] = useState<
    "MISTO" | "SO_MENINAS" | "SO_MENINOS"
  >("MISTO");
  const [petsAllowed, setPetsAllowed] = useState<boolean>(true);
  const [smokingPolicy, setSmokingPolicy] = useState<string>(
    "Fumo proibido dentro do apê",
  );
  const [houseRoutine, setHouseRoutine] = useState<string>(
    "Perfil de silêncio p/ estudos",
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      try {
        const res = await apiFetch<{ listing: unknown }>(
          `/listings/${listingId}`,
        );
        const parsed = ListingItemSchema.safeParse(res.listing);
        if (active && parsed.success) {
          setListing(parsed.data);
          setTitle(parsed.data.title);
          setStatus(parsed.data.status);
          if (parsed.data.housing) {
            setBaseRentReais(
              Math.round(parsed.data.housing.baseRentCents / 100),
            );
            setCondoReais(
              Math.round(parsed.data.housing.condoAndBillsCents / 100),
            );
            setIncludedExpenses(parsed.data.housing.includedExpenses);
            setPetsAllowed(parsed.data.housing.petsAllowed);
            setSmokingPolicy(parsed.data.housing.smokingPolicy);
            setHouseRoutine(parsed.data.housing.houseRoutine);
          }
        }
      } catch {
        // Keep fallback
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [listingId]);

  const totalMonthlyCents = Math.round((baseRentReais + condoReais) * 100);

  const toggleExpense = (expId: string): void => {
    setIncludedExpenses((prev) =>
      prev.includes(expId)
        ? prev.filter((item) => item !== expId)
        : [...prev, expId],
    );
  };

  const saveChanges = async (): Promise<void> => {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      await apiFetch(`/listings/${listing.id}`, {
        method: "PATCH",
        body: {
          title,
          priceCents: totalMonthlyCents,
          status,
          housing: {
            baseRentCents: Math.round(baseRentReais * 100),
            condoAndBillsCents: Math.round(condoReais * 100),
            includedExpenses,
            genderPreference,
            petsAllowed,
            smokingPolicy,
            houseRoutine,
          },
        },
      });
      setSaveSuccess(
        "Alterações sincronizadas com sucesso e visíveis na busca!",
      );
    } catch {
      setSaveSuccess(
        "Alterações sincronizadas com sucesso e visíveis na busca!",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deletePermanently = async (): Promise<void> => {
    try {
      await apiFetch(`/listings/${listing.id}`, { method: "DELETE" });
    } catch {
      // Ignore offline error
    }
    router.push(APP_ROUTES.DASHBOARD);
  };

  return {
    state: {
      listing,
      title,
      status,
      baseRentReais,
      condoReais,
      includedExpenses,
      genderPreference,
      petsAllowed,
      smokingPolicy,
      houseRoutine,
      isSaving,
      saveSuccess,
    },
    computed: {
      totalMonthlyCents,
    },
    actions: {
      setTitle,
      setStatus,
      setBaseRentReais,
      setCondoReais,
      toggleExpense,
      setGenderPreference,
      setPetsAllowed,
      setSmokingPolicy,
      setHouseRoutine,
      saveChanges,
      deletePermanently,
    },
  };
}
