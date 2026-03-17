export type AppPage = "camera" | "stories" | "chats" | "friends" | "profile";

export interface Story {
  id: string;
  friendId: string;
  name: string;
  avatar: string;
  mediaLabel: string;
  postedAt: string;
  viewed: boolean;
}

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  streak: number;
}

export interface FriendRequest {
  id: string;
  from: Friend;
  createdAt: string;
}

export interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isFriend: boolean;
  hasPending: boolean;
}

export interface SearchUsersPayload {
  users: SearchUser[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AccountProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
}

export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  content: string;
  createdAt: string;
  type: "text" | "snap";
  mine: boolean;
}

export interface Conversation {
  id: string;
  friendId: string;
  lastMessage: string;
  updatedAt: string;
  unread: number;
}

export interface NUIMessage<T = unknown> {
  app: string;
  action: string;
  payload?: T;
}

export interface NUIResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface BootstrapPayload {
  account: AccountProfile | null;
  friends: Friend[];
  stories: Story[];
  conversations: Conversation[];
  messages: Message[];
  friendRequests: FriendRequest[];
}
