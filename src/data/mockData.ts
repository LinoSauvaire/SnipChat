import type { Conversation, Friend, Message, Story } from "../types";

export const mockFriends: Friend[] = [
  { id: "u1", name: "Nova Reyes", username: "novar", avatar: "NR", isOnline: true, streak: 14 },
  { id: "u2", name: "Kai Monroe", username: "kaim", avatar: "KM", isOnline: true, streak: 8 },
  { id: "u3", name: "Mila Chen", username: "mila", avatar: "MC", isOnline: false, streak: 21 },
  { id: "u4", name: "Jace Walker", username: "jace", avatar: "JW", isOnline: true, streak: 3 }
];

export const mockStories: Story[] = [
  {
    id: "s1",
    friendId: "u1",
    name: "Nova Reyes",
    avatar: "NR",
    mediaUrl: "Night drift at Del Perro Pier",
    postedAt: "2m ago",
    viewed: false
  },
  {
    id: "s2",
    friendId: "u2",
    name: "Kai Monroe",
    avatar: "KM",
    mediaUrl: "Street art run in Vespucci",
    postedAt: "18m ago",
    viewed: false
  },
  {
    id: "s3",
    friendId: "u3",
    name: "Mila Chen",
    avatar: "MC",
    mediaUrl: "Sunset over Rockford Hills",
    postedAt: "1h ago",
    viewed: true
  }
];

export const mockConversations: Conversation[] = [
  { id: "c1", friendId: "u1", lastMessage: "Meet at Legion in 5?", updatedAt: "09:21", unread: 2 },
  { id: "c2", friendId: "u2", lastMessage: "Sent a snap", updatedAt: "08:57", unread: 0 },
  { id: "c3", friendId: "u3", lastMessage: "That paint job is perfect", updatedAt: "Yesterday", unread: 1 }
];

export const mockMessages: Message[] = [
  { id: "m1", chatId: "c1", authorId: "u1", content: "Meet at Legion in 5?", createdAt: "09:21", type: "text", mine: false },
  { id: "m2", chatId: "c1", authorId: "me", content: "On my way.", createdAt: "09:22", type: "text", mine: true },
  { id: "m3", chatId: "c2", authorId: "u2", content: "Sent a snap", createdAt: "08:57", type: "snap", mine: false },
  { id: "m4", chatId: "c3", authorId: "me", content: "That skyline shot was clean", createdAt: "Yesterday", type: "text", mine: true }
];
