import { create } from "zustand";
import { mockConversations, mockFriends, mockMessages, mockStories } from "../data/mockData";
import type { AppPage, Conversation, Friend, Message, Story } from "../types";

interface SnipState {
  currentPage: AppPage;
  activeChatId: string | null;
  friends: Friend[];
  stories: Story[];
  conversations: Conversation[];
  messages: Message[];
  visibility: boolean;
  setPage: (page: AppPage) => void;
  setVisibility: (visible: boolean) => void;
  setActiveChat: (chatId: string | null) => void;
  addFriend: (name: string, username: string) => void;
  sendMessage: (chatId: string, content: string) => void;
  captureStory: (caption: string) => void;
  sendSnapToFriend: (chatId: string) => void;
}

export const useSnipStore = create<SnipState>((set) => ({
  currentPage: "camera",
  activeChatId: "c1",
  friends: mockFriends,
  stories: mockStories,
  conversations: mockConversations,
  messages: mockMessages,
  visibility: true,

  setPage: (page) => set({ currentPage: page }),
  setVisibility: (visible) => set({ visibility: visible }),
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
      const trimmed = content.trim();
      if (!trimmed) return state;

      const nextMessage: Message = {
        id: `m${state.messages.length + 1}`,
        chatId,
        authorId: "me",
        content: trimmed,
        createdAt: "Now",
        type: "text",
        mine: true
      };

      const conversations = state.conversations.map((conversation) =>
        conversation.id === chatId
          ? { ...conversation, lastMessage: trimmed, updatedAt: "Now", unread: 0 }
          : conversation
      );

      return {
        messages: [...state.messages, nextMessage],
        conversations
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
          mediaUrl: caption || "New snap story",
          postedAt: "Just now",
          viewed: false
        },
        ...state.stories
      ]
    })),

  sendSnapToFriend: (chatId) =>
    set((state) => {
      const nextMessage: Message = {
        id: `m${state.messages.length + 1}`,
        chatId,
        authorId: "me",
        content: "You sent a snap",
        createdAt: "Now",
        type: "snap",
        mine: true
      };

      const conversations = state.conversations.map((conversation) =>
        conversation.id === chatId
          ? { ...conversation, lastMessage: "You sent a snap", updatedAt: "Now", unread: 0 }
          : conversation
      );

      return {
        messages: [...state.messages, nextMessage],
        conversations
      };
    })
}));

export const selectMessagesByChat = (chatId: string | null) => (state: SnipState): Message[] => {
  if (!chatId) return [];
  return state.messages.filter((message) => message.chatId === chatId);
};
