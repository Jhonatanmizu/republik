export const DASHBOARD_CONSTANTS = {
  HEADER: {
    INITIALS: "MS",
    TITLE: "Meu Espaço — Marina Silva / Jhonatan Mizu",
    ENROLLMENT_BADGE: "Matrícula Ativa USP / UEFS (.edu.br)",
    SUBTITLE:
      "Gerencie suas vagas em república, itens de desapego, favoritos e interessados em um só lugar.",
    CREATE_NEW_CTA: "Criar Novo Anúncio",
  },
  METRICS: {
    ACTIVE_LISTINGS: "Anúncios Ativos",
    CHAT_LEADS: "Interessados no Chat",
    SAVED_ITEMS: "Salvos / Favoritos",
  },
  TABS: [
    { id: "ACTIVE", label: "Meus Anúncios Ativos (3)" },
    { id: "SAVED", label: "Salvos / Favoritos (8)" },
    { id: "MESSAGES", label: "Mensagens / Interessados (5 novos)" },
    { id: "VERIFICATION", label: "Verificação Acadêmica (.edu.br)" },
  ] as const,
  ONE_CLICK_STATUS: {
    TITLE:
      "Gerenciar Status em 1 Clique (Disponível • Reservado • Vendido/Alugado)",
    SUBTITLE:
      "Alterar o status atualiza a visibilidade no feed instantaneamente",
    STATUSES: [
      { id: "DISPONIVEL", label: "Disponível" },
      { id: "RESERVADO", label: "Reservado" },
      { id: "ALUGADO_VENDIDO", label: "Vendido/Alugado" },
    ] as const,
    EDIT_CTA: "Editar",
    SHARE_CTA: "QR Code",
  },
} as const;
