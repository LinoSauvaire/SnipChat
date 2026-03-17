import { create } from "zustand";
import { conversationsSeed, friendsSeed, messagesSeed, storiesSeed } from "../data/mockData";
import type { AppPage, Conversation, Friend, Message, Story } from "../types";

interface SnipState {
  currentPage: AppPage;
  activeChatId: string | null;
  visible: boolean;
  friends: Friend[];
  stories: Story[];
  conversations: Conversation[];
  messages: Message[];
  setPage: (page: AppPage) => void;
  setVisible: (visible: boolean) => void;
  setActiveChat: (chatId: string) => void;
  addFriend: (name: string, username: string) => void;
  sendMessage: (chatId: string, content: string) => void;
  captureStory: (caption: string) => void;
  sendSnapToChat: (chatId: string) => void;
}

export const useSnipStore = create<SnipState>((set) => ({
  currentPage: "camera",
  activeChatId: "c1",
  visible: true,
  friends: friendsSeed,
  stories: storiesSeed,
  conversations: conversationsSeed,
  messages: messagesSeed,

  setPage: (page) => set({ currentPage: page }),
  setVisible: (visible) => set({ visible }),
  setActiveChat: (chatId) => set({ activeChatId: chatId }),

  addFriend: (name, username) =>
    set((state) => {
      const id = `u${state.friends.length + 1}`;
      return {
        friends: [
          {
            id,
            name,
            username,
            avatar: name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            isOnline: true,
            streak: 0
          },
          ...state.friends
        ]
      };
    }),

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
    }),

  captureStory: (caption) =>
    set((state) => ({
      stories: [
        {
          id: `s${state.stories.length + 1}`,
          friendId: "me",
          name: "You",
          avatar: "ME",
          mediaLabel: caption || "New story post",
          postedAt: "Now",
          viewed: false
        },
        ...state.stories
      ]
    })),

  sendSnapToChat: (chatId) =>
    set((state) => {
      const snapMessage: Message = {
        id: `m${state.messages.length + 1}`,
        chatId,
        authorId: "me",
        content: "You sent a snap",
        createdAt: "Now",
        type: "snap",
        mine: true
      };

      return {
        messages: [...state.messages, snapMessage],
        conversations: state.conversations.map((conversation) =>
          conversation.id === chatId
            ? { ...conversation, lastMessage: "You sent a snap", updatedAt: "Now", unread: 0 }
            : conversation
        )
      };
    })
}));
