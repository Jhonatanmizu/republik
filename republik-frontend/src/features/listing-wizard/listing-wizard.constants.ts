export const LISTING_WIZARD_CONSTANTS = {
  HEADER: {
    PILL: "Anunciar no Republik — Rápido, gratuito e exclusivo para estudantes verificados",
    STEP_SUBTITLE: "Etapas 1 a 4 • Categoria, Detalhes, Regras e Publicação",
    STEPS: [
      { id: 1, label: "1. Tipo de Anúncio" },
      { id: 2, label: "2. Detalhes, Custos & Fotos" },
      { id: 3, label: "3. Regras / Logística Campus" },
      { id: 4, label: "4. Revisão & Publicação" },
    ] as const,
  },
  STEP_1: {
    TITLE: "Passo 1: O que você quer anunciar hoje?",
    HOUSING_CARD: {
      TITLE: "Anunciar Vaga em Apê / República",
      DESC: "Quarto individual, vaga compartilhada, suíte ou apê completo próximo ao campus.",
      SELECTED: "Selecionado ✓",
    },
    MARKET_CARD: {
      TITLE: "Vender Móvel ou Item (Desapego)",
      DESC: "Geladeira, escrivaninha, colchão, livros, eletrônicos ou utensílios para outros alunos.",
    },
    MODALITY_LABEL: "Modalidade da Vaga",
    MODALITIES: [
      { id: "QUARTO_INDIVIDUAL", label: "Quarto Individual" },
      { id: "VAGA_COMPARTILHADA", label: "Vaga Compartilhada" },
      { id: "REPUBLICA", label: "República Completa" },
      { id: "STUDIO_KITNET", label: "Kitnet / Studio" },
    ] as const,
  },
  STEP_2: {
    TITLE: "Passo 2: Detalhes da Vaga, Custos Mensais & Fotos",
    TITLE_LABEL: "Título do Anúncio",
    TITLE_PLACEHOLDER:
      "Quarto individual mobiliado c/ varanda — 5 min do Portão 1 USP",
    RENT_LABEL: "Aluguel Mensal / Valor (R$)",
    CONDO_LABEL: "Condomínio + Contas (R$)",
    UNI_LABEL: "Universidade de Referência",
    PROXIMITY_LABEL: "Distância do Campus Principal",
    PROXIMITY_PLACEHOLDER: "Ex: 5 min a pé do Butantã / USP",
    UPLOAD_TITLE:
      "Arraste fotos do quarto/móvel ou clique para enviar (4 fotos adicionadas)",
    UPLOAD_SUBTITLE:
      "Formatos JPG, PNG ou HEIC • Anúncios com 5+ fotos recebem 3x mais mensagens",
    HIGHLIGHTS_LABEL: "Destaques da Vaga / Regras da Casa (Clique para ativar)",
    AUTOSAVE_NOTE: "Rascunho salvo automaticamente há 10 segundos",
    CONTINUE_CTA: "Continuar para Revisão e Publicar",
  },
  QUICK_EDIT: {
    BREADCRUMB_PREFIX: "Meu Espaço  /  Meus Anúncios  /  Editar Anúncio",
    SYNC_BADGE: "✓ Todas as alterações sincronizadas automaticamente",
    STATUS_TABS: [
      { id: "DISPONIVEL", label: "Ativo / Disponível" },
      { id: "RESERVADO", label: "Pausado / Em Negociação" },
      { id: "ALUGADO_VENDIDO", label: "Finalizado / Ocupado" },
    ] as const,
    SAVE_CTA: "Salvar Alterações",
    SECTION_1: "1. Fotos do Imóvel & Quarto",
    PHOTOS_BADGE: "✓ Mínimo 3 fotos de qualidade (4 enviadas)",
    COVER_BADGE: "★ Foto de Capa",
    SET_COVER: "Definir Capa",
    ADD_PHOTOS: "Adicionar Fotos",
    SECTION_2: "2. Valores Mensais & Despesas Inclusas",
    RENT_INPUT: "Aluguel do Quarto (R$)",
    CONDO_INPUT: "Condomínio + Rateio Fixo (R$)",
    TOTAL_DISPLAY: "Total Exibido no Card",
    EXPENSES_TITLE: "Despesas já incluídas no valor mensal:",
    EXPENSE_OPTIONS: [
      { id: "AGUA", label: "Água / Sabesp" },
      { id: "LUZ", label: "Luz / Energia" },
      { id: "INTERNET", label: "Internet Fibra 600Mb" },
      { id: "FAXINA", label: "Faxina Quinzenal" },
      { id: "GAS", label: "Gás Encanado" },
    ] as const,
    SECTION_3: "3. Regras da Casa & Perfil de Convivência",
    LIVE_PREVIEW_HEADER: "PRÉVIA EM TEMPO REAL NO FEED",
    ACTIVE_IN_SEARCH: "● Ativo na busca",
    WEEKLY_STATS_HEADER: "DESEMPENHO DESTA SEMANA",
    VIEWS_LABEL: "visualizações esta semana",
    FAVORITES_LABEL: "estudantes salvaram nos favoritos",
    LEADS_LABEL: "mensagens recebidas no chat",
    DELETE_CTA: "Excluir Anúncio Permanentemente",
  },
  SHARE_KIT: {
    PILL: "DISTRIBUIÇÃO VIRAL NO CAMPUS — ONLINE & MURAL FÍSICO (CA / DCE / BANDEJÃO)",
    TITLE:
      "Kit de Compartilhamento, Cartaz QR Code Imprimível & Banner de Visitante",
    SHARE_CARD_TITLE: "Compartilhe este anúncio",
    SHARE_CARD_SUB:
      "Ajude mais estudantes da sua universidade a encontrar essa vaga.",
    DIRECT_LINK_LABEL: "Link direto da vaga verificada",
    COPIED_BADGE: "Link copiado! ✓",
    COPY_CTA: "Copiar Link",
    WHATSAPP_CTA: "WhatsApp — Compartilhar em grupos da faculdade",
    TELEGRAM_CTA: "Telegram (Canais USP / UFBA / UEFS)",
    TWITTER_CTA: "Postar no X / Twitter",
    PRINT_PDF_CTA: "Baixar / Imprimir QR Code para mural do CA/DCE (PDF A4)",
    POSTER: {
      HEADER_BADGE: "VAGA VERIFICADA • REPUBLIK",
      SCAN_HEADER: "ESCANEIE COM O CELULAR",
      SCAN_SUB:
        "Aponte a câmera para ver fotos e falar com os moradores no Republik",
      WHY_TITLE: "Por que o Cartaz QR Code funciona no campus?",
      WHY_DESC:
        "Nos murais físicos dos Centros Acadêmicos (CAs), bibliotecas e pontos de ônibus da universidade, o estudante escaneia o QR Code sem expor o telefone pessoal do anunciante em papel público.",
    },
    VISITOR_BANNER: {
      HEADER: "MODO VISITANTE (LINK COMPARTILHADO OU QR CODE ESCANEADO)",
      TEXT: "🎓 Você está visualizando um anúncio verificado. Cadastre-se com seu e-mail universitário para agendar visitas sem intermediários.",
      REGISTER_CTA: "Criar Conta Universitária",
      LOGIN_CTA: "Já tenho conta",
    },
  },
} as const;
