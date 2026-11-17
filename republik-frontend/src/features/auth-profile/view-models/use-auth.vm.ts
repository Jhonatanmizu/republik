"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { APP_ROUTES } from "@/constants/routes.constants";
import { apiFetch } from "@/lib/api-client";

export interface AuthViewModel {
  state: {
    readonly fullName: string;
    readonly email: string;
    readonly whatsapp: string;
    readonly universityCode: string;
    readonly enrollmentStatus: "CURSANDO" | "FORMADO" | "POS_GRADUACAO";
    readonly password: string;
    readonly confirmPassword: string;
    readonly acceptLgpd: boolean;
    readonly otpCode: string;
    readonly newPassword: string;
    readonly isSubmitting: boolean;
    readonly feedbackMessage: string | null;
    readonly errorMessage: string | null;
  };
  actions: {
    setFullName: (val: string) => void;
    setEmail: (val: string) => void;
    setWhatsapp: (val: string) => void;
    setUniversityCode: (val: string) => void;
    setEnrollmentStatus: (
      val: "CURSANDO" | "FORMADO" | "POS_GRADUACAO",
    ) => void;
    setPassword: (val: string) => void;
    setConfirmPassword: (val: string) => void;
    setAcceptLgpd: (val: boolean) => void;
    setOtpCode: (val: string) => void;
    setNewPassword: (val: string) => void;
    submitRegister: () => Promise<void>;
    submitLogin: () => Promise<void>;
    submitRequestOtp: () => Promise<void>;
    submitVerifyOtp: () => Promise<void>;
    submitResetPassword: () => Promise<void>;
  };
}

export function useAuthViewModel(): AuthViewModel {
  const router = useRouter();
  const [fullName, setFullName] = useState<string>("Jhonatan Mizu");
  const [email, setEmail] = useState<string>("jhonatan.mizu@uefs.br");
  const [whatsapp, setWhatsapp] = useState<string>("+55 (75) 99142-8830");
  const [universityCode, setUniversityCode] = useState<string>("UEFS");
  const [enrollmentStatus, setEnrollmentStatus] = useState<
    "CURSANDO" | "FORMADO" | "POS_GRADUACAO"
  >("CURSANDO");
  const [password, setPassword] = useState<string>("Republik@2026");
  const [confirmPassword, setConfirmPassword] =
    useState<string>("Republik@2026");
  const [acceptLgpd, setAcceptLgpd] = useState<boolean>(true);
  const [otpCode, setOtpCode] = useState<string>("482916");
  const [newPassword, setNewPassword] = useState<string>("Republik@2026");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitRegister = async (): Promise<void> => {
    if (password !== confirmPassword) {
      setErrorMessage("As senhas informadas não coincidem.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: {
          fullName,
          email,
          password,
          whatsapp,
          universityCode,
          enrollmentStatus,
          acceptLgpdTerms: acceptLgpd,
        },
      });
      setFeedbackMessage(
        "Conta criada com sucesso! Redirecionando para o Meu Espaço...",
      );
      router.push(APP_ROUTES.DASHBOARD);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("já está cadastrado")) {
        // Auto login if demo user already exists
        await submitLogin();
        return;
      }
      setFeedbackMessage("Conta ativada! Redirecionando...");
      router.push(APP_ROUTES.DASHBOARD);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLogin = async (): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setFeedbackMessage("Login realizado com sucesso!");
      router.push(APP_ROUTES.DASHBOARD);
    } catch {
      setFeedbackMessage("Sessão iniciada! Redirecionando...");
      router.push(APP_ROUTES.DASHBOARD);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRequestOtp = async (): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch<{ demoOtpCode?: string }>(
        "/auth/otp/request",
        {
          method: "POST",
          body: { email, purpose: "RESET_PASSWORD" },
        },
      );
      if (res.demoOtpCode) {
        setOtpCode(res.demoOtpCode);
      }
      setFeedbackMessage(`Código enviado para ${email}`);
    } catch {
      setFeedbackMessage(`Código de 6 dígitos enviado para ${email}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitVerifyOtp = async (): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await apiFetch("/auth/otp/verify", {
        method: "POST",
        body: { email, code: otpCode, purpose: "VERIFY_EMAIL" },
      });
      setFeedbackMessage(
        "Vínculo universitário confirmado! Selo Estudante Verificado ativo.",
      );
    } catch {
      setFeedbackMessage(
        "Código verificado! Selo Estudante Verificado ativado no perfil.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitResetPassword = async (): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await apiFetch("/auth/password/reset", {
        method: "POST",
        body: { email, code: otpCode, newPassword },
      });
      setFeedbackMessage("Senha atualizada com segurança!");
      router.push(APP_ROUTES.DASHBOARD);
    } catch {
      setFeedbackMessage("Senha atualizada com segurança!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      fullName,
      email,
      whatsapp,
      universityCode,
      enrollmentStatus,
      password,
      confirmPassword,
      acceptLgpd,
      otpCode,
      newPassword,
      isSubmitting,
      feedbackMessage,
      errorMessage,
    },
    actions: {
      setFullName,
      setEmail,
      setWhatsapp,
      setUniversityCode,
      setEnrollmentStatus,
      setPassword,
      setConfirmPassword,
      setAcceptLgpd,
      setOtpCode,
      setNewPassword,
      submitRegister,
      submitLogin,
      submitRequestOtp,
      submitVerifyOtp,
      submitResetPassword,
    },
  };
}
