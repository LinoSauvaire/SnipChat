import { create } from "zustand";
import type { AccountProfile, AppPage, BootstrapPayload, Conversation, Friend, Message, Story } from "../types";

interface SnipState {
  currentPage: AppPage;
  activeChatId: string | null;
  visible: boolean;
  account: AccountProfile | null;
  isReady: boolean;
  friends: Friend[];
  stories: Story[];
  conversations: Conversation[];
  messages: Message[];
  setPage: (page: AppPage) => void;
  setVisible: (visible: boolean) => void;
  setActiveChat: (chatId: string) => void;
  setBootstrap: (payload: BootstrapPayload) => void;
  setAccount: (account: AccountProfile | null) => void;
  setFriends: (friends: Friend[]) => void;
  setStories: (stories: Story[]) => void;
  sendMessage: (chatId: string, content: string) => void;
}

export const useSnipStore = create<SnipState>((set) => ({
  currentPage: "camera",
  activeChatId: null,
  visible: true,
  account: null,
  isReady: false,
  friends: [],
  stories: [],
  conversations: [],
  messages: [],

  setPage: (page) => set({ currentPage: page }),
  setVisible: (visible) => set({ visible }),
  setActiveChat: (chatId) => set({ activeChatId: chatId }),
  setBootstrap: (payload) =>
    set({
      account: payload.account,
      friends: payload.friends,
      stories: payload.stories,
      conversations: payload.conversations,
      messages: payload.messages,
      activeChatId: payload.conversations[0]?.id ?? null,
      isReady: true
    }),
  setAccount: (account) => set({ account }),
  setFriends: (friends) => set({ friends }),
  setStories: (stories) => set({ stories }),

  sendMessage: (chatId, content) =>
    set((state) => {
      const text = content.trim();
      if (!text) return state;

      const next: Message = {
        id: `m${state.messages.length + 1}`,
        chatId,
        authorId: "me",
        content: text,
        createdAt: "Now",
        type: "text",
        mine: true
      };

      return {
        messages: [...state.messages, next],
        conversations: state.conversations.map((conversation) =>
          conversation.id === chatId
            ? { ...conversation, lastMessage: text, updatedAt: "Now", unread: 0 }
            : conversation
        )
      };
    })
}));
