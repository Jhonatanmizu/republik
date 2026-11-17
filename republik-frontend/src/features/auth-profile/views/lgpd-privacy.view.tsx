"use client";

import { Lock, Mail, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/routes.constants";
import { AUTH_PROFILE_CONSTANTS } from "../auth-profile.constants";

export function LgpdPrivacyView() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
      {/* Hero Header Section (Screen 11 bSj0v — Node v8WCju) */}
      <section className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-emerald-light px-3.5 py-1 text-xs font-extrabold text-trust-emerald">
            <ShieldCheck className="h-4 w-4" />
            <span>{AUTH_PROFILE_CONSTANTS.LGPD_PAGE.PILL}</span>
          </span>
          <span className="text-xs font-semibold text-text-muted">
            {AUTH_PROFILE_CONSTANTS.LGPD_PAGE.UPDATED}
          </span>
        </div>

        <h1 className="mt-4 font-sans text-2xl font-extrabold text-text-primary sm:text-4xl">
          {AUTH_PROFILE_CONSTANTS.LGPD_PAGE.TITLE}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">
          {AUTH_PROFILE_CONSTANTS.LGPD_PAGE.SUBTITLE}
        </p>
      </section>

      {/* Two-Column Workspace (Node i4nU0U) */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Sticky Summary */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-3xl border border-border-subtle bg-bg-primary p-6 shadow-xs">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
              {AUTH_PROFILE_CONSTANTS.LGPD_PAGE.SUMMARY_TITLE}
            </h2>
            <ul className="mt-3 space-y-2.5 text-xs font-bold text-text-primary">
              {AUTH_PROFILE_CONSTANTS.LGPD_PAGE.SUMMARY_ITEMS.map((item) => (
                <li
                  key={item}
                  className="rounded-xl bg-bg-secondary px-3.5 py-2.5"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-2xl border border-brand-primary-border bg-brand-primary-light p-4">
              <p className="text-xs font-extrabold text-brand-primary">
                Precisa exportar ou apagar tudo?
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Acesse seu Perfil &gt; Privacidade para baixar um arquivo JSON
                ou excluir sua conta em 1 clique.
              </p>
              <Link
                href={APP_ROUTES.PROFILE}
                className="mt-3 inline-block rounded-xl bg-brand-primary px-4 py-2 text-xs font-extrabold text-white"
              >
                Ir para Meu Perfil →
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Detailed Sections 01 - 05 */}
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-3xl border border-border-subtle bg-bg-primary p-6">
            <span className="font-mono text-xs font-extrabold text-brand-primary">
              01
            </span>
            <h2 className="mt-1 font-sans text-lg font-extrabold text-text-primary">
              Quais dados coletamos (Princípio da Minimização)
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              Coletamos estritamente o mínimo necessário para identificar você
              como membro real da comunidade estudantil e viabilizar o contato
              entre anunciantes e interessados:
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-bg-secondary p-4">
                <h3 className="text-xs font-extrabold text-text-primary">
                  Nome & Foto (Opcional)
                </h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Identificação visual nos anúncios de vagas e móveis.
                </p>
              </div>
              <div className="rounded-2xl bg-bg-secondary p-4">
                <h3 className="text-xs font-extrabold text-text-primary">
                  WhatsApp & E-mail
                </h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Login, recuperação de senha e contato direto nos anúncios.
                </p>
              </div>
              <div className="rounded-2xl bg-bg-secondary p-4">
                <h3 className="text-xs font-extrabold text-text-primary">
                  Vínculo Universitário
                </h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Universidade (ex: UEFS, UFBA, USP) e status do curso.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border-subtle bg-bg-primary p-6">
            <span className="font-mono text-xs font-extrabold text-brand-primary">
              02
            </span>
            <h2 className="mt-1 font-sans text-lg font-extrabold text-text-primary">
              Para que usamos seus dados (Finalidade e Base Legal)
            </h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-text-secondary">
              <li>
                • <strong>Segurança na comunidade estudantil:</strong> Verificar
                vínculo com instituições de ensino para impedir perfis falsos em
                repúblicas.
              </li>
              <li>
                • <strong>Conexão direta via WhatsApp:</strong> Permitir que
                estudantes logados combinem visitas a apartamentos ou retirada
                de móveis sem taxas.
              </li>
              <li>
                • <strong>Prevenção a fraudes:</strong> Monitoramento
                automatizado contra spam e anúncios abusivos (Legítimo Interesse
                — Art. 7º, IX da LGPD).
              </li>
            </ul>
          </section>

          <section className="rounded-3xl border border-border-subtle bg-bg-primary p-6">
            <span className="font-mono text-xs font-extrabold text-brand-primary">
              03
            </span>
            <h2 className="mt-1 font-sans text-lg font-extrabold text-text-primary">
              Compartilhamento e Segurança Técnica
            </h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-trust-emerald-light px-3 py-1 text-xs font-extrabold text-trust-emerald">
              <Lock className="h-3.5 w-3.5" />
              <span>Garantia: Nunca vendemos seus dados a terceiros</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-text-secondary">
              A Republik jamais comercializa ou aluga dados pessoais para
              corretores, imobiliárias ou anunciantes externos. Senhas são
              armazenadas com hash criptográfico Scrypt/Argon2id, tráfego
              protegido via TLS 1.3 e seu WhatsApp pode ser configurado para
              exibição restrita apenas a estudantes autenticados.
            </p>
          </section>

          <section className="rounded-3xl border border-border-subtle bg-bg-primary p-6">
            <span className="font-mono text-xs font-extrabold text-brand-primary">
              04 & 05
            </span>
            <h2 className="mt-1 font-sans text-lg font-extrabold text-text-primary">
              Seus Direitos (Art. 18 da LGPD) & Canal Direto do DPO
            </h2>
            <div className="mt-4 flex flex-col justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-secondary p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-trust-emerald" />
                <div>
                  <p className="text-xs font-extrabold text-text-primary">
                    Fale com nosso Encarregado de Dados (DPO)
                  </p>
                  <p className="text-xs text-text-secondary">
                    Dúvidas sobre privacidade ou requisições sob a LGPD são
                    respondidas em até 48 horas úteis.
                  </p>
                </div>
              </div>
              <a
                href={`mailto:${AUTH_PROFILE_CONSTANTS.LGPD_PAGE.DPO_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-xl bg-text-primary px-4 py-2.5 text-xs font-extrabold text-white"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>{AUTH_PROFILE_CONSTANTS.LGPD_PAGE.DPO_EMAIL}</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
