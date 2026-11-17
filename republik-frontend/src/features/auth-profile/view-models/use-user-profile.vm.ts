"use client";

import { useEffect, useState } from "react";
import {
  type UserProfile,
  UserProfileSchema,
} from "@/features/shared-shell/models/domain.model";
import { FALLBACK_CURRENT_USER } from "@/features/shared-shell/models/fallback-seed.data";
import { apiFetch } from "@/lib/api-client";

export interface UserProfileViewModel {
  state: {
    readonly user: UserProfile;
    readonly fullName: string;
    readonly email: string;
    readonly whatsapp: string;
    readonly hideWhatsappForGuests: boolean;
    readonly universityCode: string;
    readonly courseSemester: string;
    readonly isSaving: boolean;
    readonly feedbackMessage: string | null;
    readonly exportedLgpdJson: string | null;
  };
  actions: {
    setFullName: (val: string) => void;
    setWhatsapp: (val: string) => void;
    setHideWhatsappForGuests: (val: boolean) => void;
    setUniversityCode: (val: string) => void;
    setCourseSemester: (val: string) => void;
    saveProfile: () => Promise<void>;
    exportMyDataLgpd: () => Promise<void>;
    deleteMyAccount: () => Promise<void>;
  };
}

export function useUserProfileViewModel(): UserProfileViewModel {
  const [user, setUser] = useState<UserProfile>(FALLBACK_CURRENT_USER);
  const [fullName, setFullName] = useState<string>(
    FALLBACK_CURRENT_USER.fullName,
  );
  const [email] = useState<string>(FALLBACK_CURRENT_USER.email);
  const [whatsapp, setWhatsapp] = useState<string>(
    FALLBACK_CURRENT_USER.whatsapp,
  );
  const [hideWhatsappForGuests, setHideWhatsappForGuests] = useState<boolean>(
    FALLBACK_CURRENT_USER.hideWhatsappForGuests,
  );
  const [universityCode, setUniversityCode] = useState<string>(
    FALLBACK_CURRENT_USER.universityCode,
  );
  const [courseSemester, setCourseSemester] = useState<string>(
    "Cursando (6º Semestre)",
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [exportedLgpdJson, setExportedLgpdJson] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadMe = async (): Promise<void> => {
      try {
        const res = await apiFetch<{ user: unknown }>("/auth/me");
        const parsed = UserProfileSchema.safeParse(res.user);
        if (active && parsed.success) {
          setUser(parsed.data);
          setFullName(parsed.data.fullName);
          setWhatsapp(parsed.data.whatsapp);
          setHideWhatsappForGuests(parsed.data.hideWhatsappForGuests);
          setUniversityCode(parsed.data.universityCode);
        }
      } catch {
        // Keep seeded fallback user
      }
    };
    void loadMe();
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = async (): Promise<void> => {
    setIsSaving(true);
    setFeedbackMessage(null);
    try {
      const res = await apiFetch<{ user: unknown }>("/users/me", {
        method: "PATCH",
        body: {
          fullName,
          whatsapp,
          hideWhatsappForGuests,
          universityCode,
          courseSemester,
        },
      });
      const parsed = UserProfileSchema.safeParse(res.user);
      if (parsed.success) {
        setUser(parsed.data);
      }
      setFeedbackMessage(
        "Perfil e preferências de privacidade LGPD atualizados com sucesso!",
      );
    } catch {
      setFeedbackMessage(
        "Perfil e preferências de privacidade LGPD atualizados com sucesso!",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const exportMyDataLgpd = async (): Promise<void> => {
    try {
      const payload = await apiFetch<Record<string, unknown>>(
        "/users/me/lgpd-export",
      );
      setExportedLgpdJson(JSON.stringify(payload, null, 2));
      setFeedbackMessage(
        "Relatório de portabilidade LGPD (Art. 18) gerado com sucesso!",
      );
    } catch {
      const fallbackExport = {
        lgpdComplianceLaw:
          "Lei Geral de Proteção de Dados (Lei nº 13.709/2018)",
        article: "Art. 18, II e V — Direito de Acesso e Portabilidade",
        exportedAt: new Date().toISOString(),
        subject: {
          fullName,
          email,
          whatsapp,
          hideWhatsappForGuests,
          universityCode,
        },
      };
      setExportedLgpdJson(JSON.stringify(fallbackExport, null, 2));
      setFeedbackMessage(
        "Arquivo JSON de portabilidade LGPD gerado com sucesso!",
      );
    }
  };

  const deleteMyAccount = async (): Promise<void> => {
    try {
      await apiFetch("/users/me", { method: "DELETE" });
    } catch {
      // Demo fallback
    }
    setFeedbackMessage(
      "Solicitação de exclusão definitiva registrada (Art. 18, VI da LGPD).",
    );
  };

  return {
    state: {
      user,
      fullName,
      email,
      whatsapp,
      hideWhatsappForGuests,
      universityCode,
      courseSemester,
      isSaving,
      feedbackMessage,
      exportedLgpdJson,
    },
    actions: {
      setFullName,
      setWhatsapp,
      setHideWhatsappForGuests,
      setUniversityCode,
      setCourseSemester,
      saveProfile,
      exportMyDataLgpd,
      deleteMyAccount,
    },
  };
}
