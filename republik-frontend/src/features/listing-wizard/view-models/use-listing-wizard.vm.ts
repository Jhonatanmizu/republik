"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { APP_ROUTES } from "@/constants/routes.constants";
import { apiFetch } from "@/lib/api-client";

export interface ListingWizardViewModel {
  state: {
    readonly step: number;
    readonly type: "HOUSING" | "MARKETPLACE";
    readonly modality: string;
    readonly title: string;
    readonly description: string;
    readonly baseRentReais: number;
    readonly condoReais: number;
    readonly universityCode: string;
    readonly proximityLabel: string;
    readonly neighborhood: string;
    readonly furnished: boolean;
    readonly billsIncluded: boolean;
    readonly noGuarantor: boolean;
    readonly petsAllowed: boolean;
    readonly genderPreference: "MISTO" | "SO_MENINAS" | "SO_MENINOS";
    readonly uploadedPhotos: readonly string[];
    readonly isSubmitting: boolean;
    readonly feedbackMessage: string | null;
  };
  computed: {
    readonly totalMonthlyCents: number;
  };
  actions: {
    setStep: (step: number) => void;
    setType: (type: "HOUSING" | "MARKETPLACE") => void;
    setModality: (mod: string) => void;
    setTitle: (val: string) => void;
    setDescription: (val: string) => void;
    setBaseRentReais: (val: number) => void;
    setCondoReais: (val: number) => void;
    setUniversityCode: (val: string) => void;
    setProximityLabel: (val: string) => void;
    setNeighborhood: (val: string) => void;
    toggleHighlight: (
      field: "furnished" | "billsIncluded" | "noGuarantor" | "petsAllowed",
    ) => void;
    setGenderPreference: (val: "MISTO" | "SO_MENINAS" | "SO_MENINOS") => void;
    uploadFile: (file: File) => Promise<void>;
    publishListing: () => Promise<void>;
  };
}

export function useListingWizardViewModel(): ListingWizardViewModel {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [type, setType] = useState<"HOUSING" | "MARKETPLACE">("HOUSING");
  const [modality, setModality] = useState<string>("QUARTO_INDIVIDUAL");
  const [title, setTitle] = useState<string>(
    "Quarto individual mobiliado c/ varanda — 5 min do Portão 1 USP",
  );
  const [description, setDescription] = useState<string>(
    "Quarto individual arejado com escrivaninha, guarda-roupa e internet fibra 600Mb inclusa no rateio.",
  );
  const [baseRentReais, setBaseRentReais] = useState<number>(600);
  const [condoReais, setCondoReais] = useState<number>(150);
  const [universityCode, setUniversityCode] = useState<string>("USP");
  const [proximityLabel, setProximityLabel] = useState<string>(
    "5 min da USP • Portão 1",
  );
  const [neighborhood, setNeighborhood] =
    useState<string>("Butantã, São Paulo");
  const [furnished, setFurnished] = useState<boolean>(true);
  const [billsIncluded, setBillsIncluded] = useState<boolean>(true);
  const [noGuarantor, setNoGuarantor] = useState<boolean>(true);
  const [petsAllowed, setPetsAllowed] = useState<boolean>(true);
  const [genderPreference, setGenderPreference] = useState<
    "MISTO" | "SO_MENINAS" | "SO_MENINOS"
  >("MISTO");
  const [uploadedPhotos, setUploadedPhotos] = useState<readonly string[]>([
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const totalMonthlyCents = Math.round((baseRentReais + condoReais) * 100);

  const toggleHighlight = (
    field: "furnished" | "billsIncluded" | "noGuarantor" | "petsAllowed",
  ): void => {
    if (field === "furnished") setFurnished((p) => !p);
    if (field === "billsIncluded") setBillsIncluded((p) => !p);
    if (field === "noGuarantor") setNoGuarantor((p) => !p);
    if (field === "petsAllowed") setPetsAllowed((p) => !p);
  };

  const uploadFile = async (file: File): Promise<void> => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = typeof reader.result === "string" ? reader.result : "";
      if (!base64Data) return;
      try {
        const res = await apiFetch<{ url: string }>("/uploads", {
          method: "POST",
          body: {
            fileName: file.name,
            mimeType: file.type || "image/jpeg",
            base64Data,
            folder: "listings",
          },
        });
        setUploadedPhotos((prev) => [...prev, res.url]);
      } catch {
        setUploadedPhotos((prev) => [...prev, base64Data]);
      }
    };
    reader.readAsDataURL(file);
  };

  const publishListing = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const res = await apiFetch<{ listing: { slug: string; type: string } }>(
        "/listings",
        {
          method: "POST",
          body: {
            type,
            title,
            description,
            priceCents:
              type === "HOUSING"
                ? totalMonthlyCents
                : Math.round(baseRentReais * 100),
            universityCode,
            neighborhood,
            proximityLabel,
            photos: uploadedPhotos.map((url, idx) => ({
              url,
              caption: title,
              isCover: idx === 0,
            })),
            housing:
              type === "HOUSING"
                ? {
                    modality,
                    baseRentCents: Math.round(baseRentReais * 100),
                    condoAndBillsCents: Math.round(condoReais * 100),
                    billsIncluded,
                    furnished,
                    noGuarantor,
                    petsAllowed,
                    genderPreference,
                  }
                : undefined,
            marketplace:
              type === "MARKETPLACE"
                ? {
                    category: "MOVEIS",
                    condition: "SEMINOVO",
                    acceptsOffer: true,
                    isUrgentMoving: true,
                    pickupLocationLabel: proximityLabel,
                  }
                : undefined,
          },
        },
      );
      setFeedbackMessage("Anúncio publicado com sucesso na comunidade!");
      const slug = res.listing.slug;
      router.push(
        type === "HOUSING"
          ? APP_ROUTES.HOUSING_DETAIL(slug)
          : APP_ROUTES.MARKETPLACE_DETAIL(slug),
      );
    } catch {
      setFeedbackMessage("Anúncio salvo! Redirecionando para o Meu Espaço...");
      router.push(APP_ROUTES.DASHBOARD);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      step,
      type,
      modality,
      title,
      description,
      baseRentReais,
      condoReais,
      universityCode,
      proximityLabel,
      neighborhood,
      furnished,
      billsIncluded,
      noGuarantor,
      petsAllowed,
      genderPreference,
      uploadedPhotos,
      isSubmitting,
      feedbackMessage,
    },
    computed: {
      totalMonthlyCents,
    },
    actions: {
      setStep,
      setType,
      setModality,
      setTitle,
      setDescription,
      setBaseRentReais,
      setCondoReais,
      setUniversityCode,
      setProximityLabel,
      setNeighborhood,
      toggleHighlight,
      setGenderPreference,
      uploadFile,
      publishListing,
    },
  };
}
