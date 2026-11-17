export const ADMIN_CONSTANTS = {
  TOP_BAR: {
    TITLE: "Republik Admin",
    BADGE: "TRUST & SAFETY • BACK-OFFICE",
    SEARCH_PLACEHOLDER: "Buscar estudante por RA / Nome / Email (.edu.br)...",
    ROLE_LABEL: "Super Admin / Moderação",
  },
  METRICS: {
    PENDING_VERIFICATIONS: "Verificações Pendentes",
    PENDING_VERIFICATIONS_SUB: "comprovantes de matrícula p/ análise manual",
    PENDING_REPORTS: "Denúncias / Anúncios Suspeitos",
    PENDING_REPORTS_SUB: "prioridade alta de verificação antifraude",
    ACTIVE_LISTINGS: "Anúncios Ativos no Campus",
    ACTIVE_LISTINGS_SUB: "+124 novas vagas e móveis esta semana",
    TRUST_RATE: "Taxa de Confiança da Rede",
    TRUST_RATE_SUB: "0 incidentes em contas verificadas .edu.br",
  },
  VERIFICATION_QUEUE: {
    TITLE:
      "Fila de Verificação Manual de Matrícula (Calouros / PDF / SIGAA / JupiterWeb)",
    WAITING_BADGE: "aguardando revisão",
    COLUMNS: {
      STUDENT: "ESTUDANTE & E-MAIL",
      UNI_RA: "UNIVERSIDADE / RA",
      DOCUMENT: "DOCUMENTO ENVIADO",
      STATUS: "STATUS & AÇÃO",
    },
    INSPECTION_HEADER:
      "Documento em inspeção: Atestado de Matrícula USP 2026 (JupiterWeb Autenticado)",
    APPROVE_CTA: "Aprovar Selo Estudante Verificado",
    RESUBMIT_CTA: "Solicitar Novo Documento",
    REJECT_CTA: "Rejeitar por Inconsistência",
  },
  REPORTS_QUEUE: {
    TITLE: "Fila de Denúncias de Segurança",
    PENDING_BADGE: "⚠️ pendentes",
    REASON_HEADER: "MOTIVO DA DENÚNCIA (4 ESTUDANTES REPORTARAM)",
    CONTACT_CTA: "Contatar Anunciante (Solicitar Comprovante de Endereço)",
    PAUSE_CTA: "Pausar Anúncio Temporariamente (Ocultar da Busca)",
    BAN_CTA: "Banir Usuário & Notificar Comunidade",
  },
} as const;
