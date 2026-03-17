import type { Conversation, Friend, Message, Story } from "../types";

export const friendsSeed: Friend[] = [
  { id: "u1", name: "Nova Reyes", username: "novar", avatar: "NR", isOnline: true, streak: 14 },
  { id: "u2", name: "Kai Monroe", username: "kaim", avatar: "KM", isOnline: true, streak: 8 },
  { id: "u3", name: "Mila Chen", username: "mila", avatar: "MC", isOnline: false, streak: 21 },
  { id: "u4", name: "Jace Walker", username: "jace", avatar: "JW", isOnline: true, streak: 3 }
];

export const storiesSeed: Story[] = [
  {
    id: "s1",
    friendId: "u1",
    name: "Nova Reyes",
    avatar: "NR",
    mediaLabel: "Session drift a Del Perro",
    postedAt: "il y a 2 min",
    viewed: false
  },
  {
    id: "s2",
    friendId: "u2",
    name: "Kai Monroe",
    avatar: "KM",
    mediaLabel: "Street art a Vespucci",
    postedAt: "il y a 18 min",
    viewed: false
  },
  {
    id: "s3",
    friendId: "u3",
    name: "Mila Chen",
    avatar: "MC",
    mediaLabel: "Coucher de soleil a Rockford Hills",
    postedAt: "il y a 1 h",
    viewed: true
  }
];

export const conversationsSeed: Conversation[] = [
  { id: "c1", friendId: "u1", lastMessage: "Legion dans 5 minutes ?", updatedAt: "09:21", unread: 2 },
  { id: "c2", friendId: "u2", lastMessage: "Snap envoye", updatedAt: "08:57", unread: 0 },
  { id: "c3", friendId: "u3", lastMessage: "Ta peinture est parfaite", updatedAt: "Hier", unread: 1 }
];

export const messagesSeed: Message[] = [
  { id: "m1", chatId: "c1", authorId: "u1", content: "Legion dans 5 minutes ?", createdAt: "09:21", type: "text", mine: false },
  { id: "m2", chatId: "c1", authorId: "me", content: "J'arrive.", createdAt: "09:22", type: "text", mine: true },
  { id: "m3", chatId: "c2", authorId: "u2", content: "Snap envoye", createdAt: "08:57", type: "snap", mine: false },
  { id: "m4", chatId: "c3", authorId: "me", content: "Le skyline est propre", createdAt: "Hier", type: "text", mine: true }
];
