export type AppPage = "camera" | "stories" | "chats" | "friends" | "profile";

export interface Story {
  id: string;
  friendId: string;
  name: string;
  avatar: string;
  mediaUrl: string;
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
