export const CHAT_CONSTANTS = {
  HEADER: {
    BREADCRUMB: "Meu Espaço",
    TITLE: "Mensagens e Interessados",
    SUBTITLE: "Chat Criptografado • Apenas Estudantes Verificados (.edu.br)",
    SEARCH_PLACEHOLDER: "Buscar conversas...",
  },
  FILTER_TABS: [
    { id: "ALL", label: "Todos" },
    { id: "HOUSING", label: "Vagas de Moradia (3)" },
    { id: "MARKETPLACE", label: "Desapegos (2)" },
    { id: "UNREAD", label: "Não lidos" },
  ] as const,
  THREAD: {
    ONLINE_PREFIX: "● Online agora • Interesse em:",
    VIEW_LISTING_CTA: "Ver anúncio →",
    SAFETY_BANNER:
      "🛡️ Dica de Segurança Republik: Nunca faça depósitos de caução antes de visitar o imóvel e validar o contrato pessoalmente.",
    DATE_HEADER: "Hoje, 16 de Novembro • Conversa iniciada pelo anúncio #8291",
    READ_RECEIPT: "✓✓ Lida",
    WHATSAPP_AUTHORIZED_NOTE:
      "Compartilhamento seguro de WhatsApp autorizado nesta conversa.",
    OPEN_WHATSAPP_CTA: "Abrir Conversa no WhatsApp",
    REQUEST_WHATSAPP_CTA: "Solicitar WhatsApp Seguro",
    AUTHORIZE_WHATSAPP_CTA: "Autorizar WhatsApp Seguro",
    INPUT_PLACEHOLDER: "Escreva sua mensagem segura...",
    SEND_CTA: "Enviar",
  },
} as const;
