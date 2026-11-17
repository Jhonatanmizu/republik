export const APP_ROUTES = {
  HOME: "/",
  HOUSING: "/",
  HOUSING_DETAIL: (slugOrId: string) => `/moradia/${slugOrId}`,
  MARKETPLACE: "/desapego",
  MARKETPLACE_DETAIL: (slugOrId: string) => `/desapego/${slugOrId}`,
  CREATE_LISTING: "/anunciar",
  DASHBOARD: "/meu-espaco",
  MESSAGES: "/mensagens",
  QUICK_EDIT: (id: string) => `/anuncios/${id}/editar`,
  SHARE_KIT: (id: string) => `/anuncios/${id}/compartilhar`,
  PROFILE: "/perfil",
  LGPD: "/lgpd",
  LOGIN: "/auth/login",
  REGISTER: "/auth/cadastro",
  VERIFY_OTP: "/auth/verificacao",
  ADMIN: "/admin",
  DESIGN_SYSTEM: "/design-system",
} as const;

export const GLOBAL_BRAND_TEXT = {
  NAME: "Republik",
  TAGLINE:
    "Criada por estudantes, para estudantes. Moradia universitária compartilhada e desapego seguro nas universidades brasileiras.",
  COPYRIGHT:
    "© 2026 Republik Tecnologia Universitária Ltda. Todos os direitos reservados • Feira de Santana, Salvador & São Paulo.",
  LGPD_BADGE: "100% Adequado à LGPD (Lei nº 13.709/2018)",
  VERIFIED_STUDENT_BADGE: "Estudante Verificado",
  NAV: {
    HOUSING: "Moradia & Vagas",
    MARKETPLACE: "Desapego Universitário",
    SEARCH_PLACEHOLDER: "USP, UFBA, UEFS, Unicamp...",
    ANNOUNCE_CTA: "Anunciar",
    DASHBOARD: "Meu Espaço",
    MESSAGES: "Mensagens",
    PROFILE: "Meu Perfil",
    ADMIN: "Admin Trust & Safety",
    VERIFY_NOW: "Verificar .edu.br",
    LOGIN: "Entrar",
    REGISTER: "Criar Conta",
  },
  MOBILE_TABS: {
    HOUSING: "Moradia",
    MARKETPLACE: "Desapego",
    ANNOUNCE: "Anunciar",
    DASHBOARD: "Meu Espaço",
  },
  FOOTER_LINKS: {
    ABOUT: "Sobre a Republik",
    TERMS: "Termos de Uso",
    LGPD: "Política de Privacidade & LGPD",
    SUPPORT: "Central de Suporte",
    ADMIN: "Moderação Acadêmica",
    DESIGN_SYSTEM: "Design System",
  },
} as const;

export const UNIVERSITIES_CATALOG = [
  {
    code: "ALL",
    label: "Todas as Universidades",
    campusLabel: "USP, UFBA, UEFS, Unicamp, UFMG",
    domain: ".edu.br",
  },
  {
    code: "USP",
    label: "USP Butantã • São Paulo, SP",
    campusLabel: "USP — Cidade Universitária",
    domain: ".usp.br",
  },
  {
    code: "UFBA",
    label: "UFBA Ondina • Salvador, BA",
    campusLabel: "UFBA — Ondina / Federação",
    domain: ".ufba.br",
  },
  {
    code: "UEFS",
    label: "UEFS — Feira de Santana, BA",
    campusLabel: "UEFS — Campus Universitário",
    domain: ".uefs.br",
  },
  {
    code: "UNICAMP",
    label: "Unicamp • Campinas, SP",
    campusLabel: "Unicamp — Barão Geraldo",
    domain: ".unicamp.br",
  },
  {
    code: "UFMG",
    label: "UFMG Pampulha • BH, MG",
    campusLabel: "UFMG — Campus Pampulha",
    domain: ".ufmg.br",
  },
] as const;
