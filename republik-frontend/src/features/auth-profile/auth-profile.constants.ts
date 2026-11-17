import { FRONTEND_ENV } from "@/config/env.config";

export const AUTH_PROFILE_CONSTANTS = {
  SIGNUP: {
    HEADER_PROMPT: "Já tem conta na comunidade?",
    HEADER_CTA: "Já tem conta? Entrar",
    LEFT_PILL: "+18.400 estudantes na Bahia e em todo o Brasil",
    QUOTE:
      '"Achei minha vaga perto da UEFS em 2 dias e comprei escrivaninha e frigobar de um veterano que estava formando."',
    QUOTE_AUTHOR: "— Camila Rocha • Engenharia Civil (UEFS)",
    WHY_TITLE: "Por que pedimos seu vínculo acadêmico?",
    BENEFITS: [
      {
        title: "Comunidade 100% Estudantil",
        desc: "Perfis com universidade e status do curso claros para evitar golpes em aluguéis e desapegos.",
      },
      {
        title: "Conexão Direta no WhatsApp",
        desc: "Sem taxas de intermediação. Converse direto com quem anuncia a vaga ou o móvel.",
      },
      {
        title: "Proteção Total sob a LGPD",
        desc: "Você controla quem vê seu WhatsApp e pode exportar ou excluir seus dados a qualquer momento.",
      },
    ] as const,
    FORM_PILL: "JUNTE-SE À MAIOR COMUNIDADE DE ESTUDANTES",
    FORM_TITLE: "Crie sua conta na Republik.",
    FORM_SUBTITLE:
      "Preencha seus dados de contato e vínculo acadêmico para anunciar ou buscar vagas e móveis.",
    SECTION_1: "1. DADOS PESSOAIS & CONTATO DIRETO",
    NAME_LABEL: "Nome completo *",
    EMAIL_LABEL: "E-mail universitário ou pessoal *",
    ACADEMIC_EMAIL_BADGE: "✓ E-mail Acadêmico",
    WHATSAPP_LABEL: "Número do WhatsApp (com DDD) *",
    WHATSAPP_HINT:
      "Usado para interessados nas suas vagas ou móveis entrarem em contato",
    SECTION_2: "2. VÍNCULO UNIVERSITÁRIO & FORMAÇÃO",
    UNI_LABEL: "Universidade em que estuda ou estudou *",
    UNI_CHIPS: ["UEFS", "UFBA", "USP", "UNICAMP", "UFMG"] as const,
    STATUS_LABEL: "Status do curso *",
    STATUS_OPTIONS: [
      { id: "CURSANDO", label: "Cursando (Graduação)" },
      { id: "FORMADO", label: "Formado / Egresso" },
      { id: "POS_GRADUACAO", label: "Pós-graduação / Mestrado" },
    ] as const,
    PASSWORD_LABEL: "Senha *",
    CONFIRM_PASSWORD_LABEL: "Confirmar senha *",
    LGPD_CONSENT:
      "Li e concordo com os Termos de Uso e a Política de Privacidade (LGPD), autorizando o uso dos meus dados para conexão universitária na Republik.",
    SUBMIT_CTA: "Criar minha conta",
  },
  LOGIN: {
    HEADER_PROMPT: "Novo na comunidade universitária?",
    HEADER_CTA: "Criar conta gratuita",
    TITLE: "Boas-vindas de volta",
    SUBTITLE:
      "Entre para acessar suas vagas salvas, anúncios de desapego e conversas com outros estudantes.",
    EMAIL_LABEL: "E-mail universitário ou pessoal",
    PASSWORD_LABEL: "Senha",
    FORGOT_LINK: "Esqueci minha senha?",
    SUBMIT_CTA: "Entrar",
    RECOVERY_HEADER: "FLUXO DE RECUPERAÇÃO DE SENHA",
    RECOVERY_TITLE: "Recuperar acesso à sua conta",
    RECOVERY_DESC:
      'Ao clicar em "Esqueci minha senha?", enviamos um código de 6 dígitos para o seu e-mail cadastrado para redefinição segura.',
    RECOVERY_CTA: "Verificar código e definir nova senha",
  },
  OTP_SUITE: {
    LEFT_BADGE: "Ambiente 100% verificado por estudantes",
    LEFT_TITLE:
      "Sua segurança no campus começa na confirmação do vínculo acadêmico.",
    LEFT_DESC:
      "Ao validar seu e-mail universitário (.usp.br, .edu.br, .ufba.br, .uefs.br), você recebe o selo Estudante Verificado e negocia moradia e desapegos com total confiança.",
    STEP_1_HEADER: "ETAPA 1 • CONFIRMAÇÃO OTP",
    OTP_TITLE: "Digite o código enviado para seu e-mail",
    VERIFY_CTA: "Verificar e Ativar Conta",
    RESEND_CTA: "Reenviar código por e-mail",
    RECOVERY_HEADER: "RECUPERAÇÃO DE SENHA",
    RECOVERY_TITLE: "Crie sua nova senha",
    RECOVERY_DESC:
      "Escolha uma senha forte com no mínimo 8 caracteres, letras e números.",
    UPDATE_PASSWORD_CTA: "Atualizar Senha e Entrar",
    LGPD_FOOTER:
      "🔒 Seus dados estão protegidos de acordo com a LGPD e as diretrizes acadêmicas.",
  },
  PROFILE: {
    VERIFIED_BADGE: "Estudante Verificado (.uefs.br)",
    SUBTITLE:
      "Membro desde Março 2025 • Feira de Santana, BA • 100% de respostas no WhatsApp",
    FORM_TITLE: "Dados Pessoais, Contato & Vínculo Acadêmico",
    FORM_SUB:
      "Mantenha seus dados atualizados para facilitar negociações no campus.",
    SAVE_CTA: "Salvar Alterações",
    WHATSAPP_PRIVACY_TITLE:
      "Exibir WhatsApp apenas para usuários logados e verificados",
    WHATSAPP_PRIVACY_DESC:
      "Oculta seu número de visitantes anônimos e robôs na internet (Recomendado pela LGPD).",
    ACTIVE_LISTINGS_TITLE: "Meus Anúncios Ativos (2)",
    MANAGE_ALL: "Gerenciar todos →",
    LGPD_SECTION_TITLE: "Privacidade e Dados (LGPD)",
    LGPD_PAGE_LINK: "Ver página LGPD completa →",
    LGPD_SECTION_DESC:
      "Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem controle total sobre a portabilidade e exclusão definitiva da sua conta.",
    EXPORT_DATA_CTA: "Exportar meus dados (JSON/PDF)",
    DELETE_ACCOUNT_CTA: "Excluir conta definitivamente",
  },
  LGPD_PAGE: {
    PILL: "CENTRAL DE PRIVACIDADE & TRANSPARÊNCIA • LEI Nº 13.709/2018 (LGPD)",
    UPDATED: "Última atualização: 16 de Novembro de 2026 • Versão 2.4",
    TITLE: "Como a Republik protege e utiliza seus dados",
    SUBTITLE:
      "Explicamos em linguagem simples, direta e sem juridiquês exatamente quais dados coletamos para manter nossa comunidade universitária segura, como protegemos seu WhatsApp e como você exerce seus direitos.",
    SUMMARY_TITLE: "SUMÁRIO RÁPIDO",
    SUMMARY_ITEMS: [
      "01. Quais dados coletamos (Princípio da Minimização)",
      "02. Para que usamos seus dados (Finalidade e Base Legal)",
      "03. Compartilhamento e Segurança Técnica",
      "04. Seus Direitos como Titular dos Dados (Art. 18 da LGPD)",
      "05. Canal do Encarregado de Proteção de Dados (DPO)",
    ] as const,
    DPO_EMAIL: FRONTEND_ENV.DPO_EMAIL,
  },
} as const;
