import { create } from "zustand";
import type { AccountProfile, AppPage, BootstrapPayload, Conversation, Friend, FriendRequest, Message, Story } from "../types";

interface SnipState {
  currentPage: AppPage;
  activeChatId: string | null;
  visible: boolean;
  account: AccountProfile | null;
  isReady: boolean;
  friends: Friend[];
  friendRequests: FriendRequest[];
  stories: Story[];
  conversations: Conversation[];
  messages: Message[];
  setPage: (page: AppPage) => void;
  setVisible: (visible: boolean) => void;
  setActiveChat: (chatId: string) => void;
  setBootstrap: (payload: BootstrapPayload) => void;
  setAccount: (account: AccountProfile | null) => void;
  setFriends: (friends: Friend[]) => void;
  setFriendRequests: (requests: FriendRequest[]) => void;
  setStories: (stories: Story[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: Message[]) => void;
}

export const useSnipStore = create<SnipState>((set) => ({
  currentPage: "camera",
  activeChatId: null,
  visible: true,
  account: null,
  isReady: false,
  friends: [],
  friendRequests: [],
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
      friendRequests: payload.friendRequests,
      stories: payload.stories,
      conversations: payload.conversations,
      messages: payload.messages,
      activeChatId: payload.conversations[0]?.id ?? null,
      isReady: true
    }),
  setAccount: (account) => set({ account }),
  setFriends: (friends) => set({ friends }),
  setFriendRequests: (friendRequests) => set({ friendRequests }),
  setStories: (stories) => set({ stories }),
  setConversations: (conversations) => set({ conversations }),
  setMessages: (messages) => set({ messages })
}));
