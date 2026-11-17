"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type ChatMessage,
  ChatMessageSchema,
  type ConversationItem,
  ConversationItemSchema,
} from "@/features/shared-shell/models/domain.model";
import {
  DEFAULT_FALLBACK_CONVERSATION,
  FALLBACK_CONVERSATIONS,
  FALLBACK_MESSAGES,
} from "@/features/shared-shell/models/fallback-seed.data";
import { API_BASE_URL, apiFetch } from "@/lib/api-client";

export type ChatFilterTab = "ALL" | "HOUSING" | "MARKETPLACE" | "UNREAD";

export interface ChatWorkspaceViewModel {
  state: {
    readonly conversations: readonly ConversationItem[];
    readonly selectedConversationId: string;
    readonly activeConversation: ConversationItem;
    readonly messages: readonly ChatMessage[];
    readonly filterTab: ChatFilterTab;
    readonly searchQuery: string;
    readonly draftMessage: string;
    readonly isSending: boolean;
  };
  actions: {
    setSelectedConversationId: (id: string) => void;
    setFilterTab: (tab: ChatFilterTab) => void;
    setSearchQuery: (q: string) => void;
    setDraftMessage: (val: string) => void;
    sendMessage: () => Promise<void>;
    triggerWhatsappAction: (action: "REQUEST" | "AUTHORIZE") => Promise<void>;
  };
}

export function useChatWorkspaceViewModel(): ChatWorkspaceViewModel {
  const [conversations, setConversations] = useState<
    readonly ConversationItem[]
  >(FALLBACK_CONVERSATIONS);
  const [selectedConversationId, setSelectedConversationId] = useState<string>(
    DEFAULT_FALLBACK_CONVERSATION.id,
  );
  const [messagesMap, setMessagesMap] =
    useState<Record<string, ChatMessage[]>>(FALLBACK_MESSAGES);
  const [filterTab, setFilterTab] = useState<ChatFilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [draftMessage, setDraftMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const loadConversations = async (): Promise<void> => {
      try {
        const res = await apiFetch<{ conversations: unknown[] }>(
          "/chat/conversations",
        );
        const parsed: ConversationItem[] = [];
        for (const c of res.conversations) {
          const check = ConversationItemSchema.safeParse(c);
          if (check.success) {
            parsed.push(check.data);
          }
        }
        if (active && parsed[0]) {
          setConversations(parsed);
          setSelectedConversationId(parsed[0].id);
        }
      } catch {
        // Keep seeded fallback
      }
    };
    void loadConversations();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadMessages = async (): Promise<void> => {
      try {
        const res = await apiFetch<{ messages: unknown[] }>(
          `/chat/conversations/${selectedConversationId}/messages`,
        );
        const parsed: ChatMessage[] = [];
        for (const m of res.messages) {
          const check = ChatMessageSchema.safeParse(m);
          if (check.success) {
            parsed.push(check.data);
          }
        }
        if (active && parsed.length > 0) {
          setMessagesMap((prev) => ({
            ...prev,
            [selectedConversationId]: parsed,
          }));
        }
      } catch {
        // Keep fallback messages
      }
    };
    void loadMessages();
    return () => {
      active = false;
    };
  }, [selectedConversationId]);

  // Real-time SSE listener with graceful fallback
  useEffect(() => {
    if (typeof EventSource === "undefined") {
      return;
    }
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_BASE_URL}/chat/stream`, {
        withCredentials: true,
      });
      es.onmessage = (event) => {
        try {
          const payload: unknown = JSON.parse(event.data);
          if (
            typeof payload === "object" &&
            payload !== null &&
            "conversationId" in payload &&
            "message" in payload &&
            typeof payload.conversationId === "string"
          ) {
            const msgCheck = ChatMessageSchema.safeParse(payload.message);
            if (msgCheck.success) {
              const cid = payload.conversationId;
              setMessagesMap((prev) => {
                const list = prev[cid] ?? [];
                if (list.some((item) => item.id === msgCheck.data.id)) {
                  return prev;
                }
                return { ...prev, [cid]: [...list, msgCheck.data] };
              });
            }
          }
        } catch {
          // Ignore malformed event
        }
      };
    } catch {
      // SSE optional when offline
    }
    return () => {
      es?.close();
    };
  }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (filterTab === "HOUSING" && c.listing.type !== "HOUSING") {
        return false;
      }
      if (filterTab === "MARKETPLACE" && c.listing.type !== "MARKETPLACE") {
        return false;
      }
      if (filterTab === "UNREAD" && c.unreadCount === 0) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.peer.fullName.toLowerCase().includes(q) ||
          c.listing.title.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [conversations, filterTab, searchQuery]);

  const activeConversation =
    conversations.find((c) => c.id === selectedConversationId) ??
    conversations[0] ??
    DEFAULT_FALLBACK_CONVERSATION;

  const messages = messagesMap[activeConversation.id] ?? [];

  const sendMessage = async (): Promise<void> => {
    const trimmed = draftMessage.trim();
    if (!trimmed) return;

    setIsSending(true);
    const optimisticMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: "me",
      isMine: true,
      body: trimmed,
      isSystemMessage: false,
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: [
        ...(prev[activeConversation.id] ?? []),
        optimisticMsg,
      ],
    }));
    setDraftMessage("");

    try {
      await apiFetch(`/chat/conversations/${activeConversation.id}/messages`, {
        method: "POST",
        body: { body: trimmed },
      });
    } catch {
      // Keep optimistic message
    } finally {
      setIsSending(false);
    }
  };

  const triggerWhatsappAction = async (
    action: "REQUEST" | "AUTHORIZE",
  ): Promise<void> => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              whatsappRequestedByBuyer: true,
              whatsappRevealedByHost:
                action === "AUTHORIZE" ? true : c.whatsappRevealedByHost,
              peer: {
                ...c.peer,
                whatsapp:
                  action === "AUTHORIZE"
                    ? (c.peer.whatsapp ?? "+55 (11) 97233-1902")
                    : c.peer.whatsapp,
              },
            }
          : c,
      ),
    );

    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      conversationId: activeConversation.id,
      senderId: "me",
      isMine: true,
      body:
        action === "AUTHORIZE"
          ? "Autorizou o compartilhamento seguro de WhatsApp."
          : "Solicitou o compartilhamento seguro de WhatsApp.",
      isSystemMessage: true,
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] ?? []), sysMsg],
    }));

    try {
      await apiFetch(`/chat/conversations/${activeConversation.id}/whatsapp`, {
        method: "PATCH",
        body: { action },
      });
    } catch {
      // Keep optimistic state
    }
  };

  return {
    state: {
      conversations: filteredConversations,
      selectedConversationId,
      activeConversation,
      messages,
      filterTab,
      searchQuery,
      draftMessage,
      isSending,
    },
    actions: {
      setSelectedConversationId,
      setFilterTab,
      setSearchQuery,
      setDraftMessage,
      sendMessage,
      triggerWhatsappAction,
    },
  };
}
