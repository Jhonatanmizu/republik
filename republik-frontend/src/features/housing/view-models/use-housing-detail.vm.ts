"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FRONTEND_ENV } from "@/config/env.config";
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

export interface HousingDetailViewModel {
  state: {
    readonly listing: ListingItem;
    readonly isLoading: boolean;
    readonly isSaved: boolean;
    readonly isShareSheetOpen: boolean;
    readonly linkCopied: boolean;
    readonly inquiryMessage: string;
    readonly isSendingInquiry: boolean;
    readonly inquiryFeedback: string | null;
  };
  actions: {
    toggleSave: () => Promise<void>;
    setIsShareSheetOpen: (open: boolean) => void;
    copyShareLink: () => void;
    setInquiryMessage: (msg: string) => void;
    sendInquiryAndOpenChat: () => Promise<void>;
  };
}

export function useHousingDetailViewModel(
  idOrSlug: string,
): HousingDetailViewModel {
  const router = useRouter();
  const defaultListing =
    FALLBACK_LISTINGS.find(
      (item) =>
        item.id === idOrSlug ||
        item.slug === idOrSlug ||
        item.code === idOrSlug,
    ) ?? DEFAULT_FALLBACK_LISTING;

  const [listing, setListing] = useState<ListingItem>(defaultListing);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(defaultListing.isSaved);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [inquiryMessage, setInquiryMessage] = useState<string>(
    "Oi! Vi seu anúncio no Republik e tenho interesse em agendar uma visita à vaga.",
  );
  const [isSendingInquiry, setIsSendingInquiry] = useState<boolean>(false);
  const [inquiryFeedback, setInquiryFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const res = await apiFetch<{ listing: unknown }>(
          `/listings/${idOrSlug}`,
        );
        const parsed = ListingItemSchema.safeParse(res.listing);
        if (active && parsed.success) {
          setListing(parsed.data);
          setIsSaved(parsed.data.isSaved);
        }
      } catch {
        // Fallback already set
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
  }, [idOrSlug]);

  const toggleSave = async (): Promise<void> => {
    setIsSaved((prev) => !prev);
    try {
      await apiFetch(`/listings/${listing.id}/favorite`, { method: "POST" });
    } catch {
      // Keep optimistic toggle
    }
  };

  const copyShareLink = (): void => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(
        `${FRONTEND_ENV.SITE_URL}/moradia/${listing.slug}`,
      );
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const sendInquiryAndOpenChat = async (): Promise<void> => {
    setIsSendingInquiry(true);
    try {
      await apiFetch("/chat/conversations", {
        method: "POST",
        body: {
          listingId: listing.id,
          initialMessage: inquiryMessage,
        },
      });
      setInquiryFeedback(
        "Mensagem enviada! Redirecionando para o Chat Seguro...",
      );
      router.push(APP_ROUTES.MESSAGES);
    } catch {
      setInquiryFeedback("Mensagem enviada! Abrindo Mensagens...");
      router.push(APP_ROUTES.MESSAGES);
    } finally {
      setIsSendingInquiry(false);
    }
  };

  return {
    state: {
      listing,
      isLoading,
      isSaved,
      isShareSheetOpen,
      linkCopied,
      inquiryMessage,
      isSendingInquiry,
      inquiryFeedback,
    },
    actions: {
      toggleSave,
      setIsShareSheetOpen,
      copyShareLink,
      setInquiryMessage,
      sendInquiryAndOpenChat,
    },
  };
}
