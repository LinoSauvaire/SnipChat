import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BottomNav } from "./components/BottomNav";
import { PhoneFrame } from "./components/PhoneFrame";
import { TopBar } from "./components/TopBar";
import { useNuiEvent } from "./hooks/useNuiEvent";
import { useSnipStore } from "./hooks/useSnipStore";
import { CameraPage } from "./pages/CameraPage";
import { StoriesPage } from "./pages/StoriesPage";
import { ChatPage } from "./pages/ChatPage";
import { FriendsPage } from "./pages/FriendsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { appName, resourceName } from "./utils/constants";
import { sendToLua } from "./utils/nui";
import type { BootstrapPayload, SearchUser } from "./types";
import "./styles.css";

const emptyBootstrap: BootstrapPayload = {
  account: null,
  friends: [],
  friendRequests: [],
  stories: [],
  conversations: [],
  messages: []
};

function App() {
  const {
    currentPage,
    activeChatId,
    visible,
    account,
    isReady,
    friends,
    friendRequests,
    stories,
    conversations,
    messages,
    setPage,
    setVisible,
    setActiveChat,
    setBootstrap,
    setAccount,
    setFriends,
    setFriendRequests,
    setStories,
    setConversations,
    setMessages
  } = useSnipStore();

  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const result = await sendToLua("bootstrap", {});
        if (result.ok && result.data) {
          setBootstrap(result.data as BootstrapPayload);
          return;
        }

        setBootstrap(emptyBootstrap);
      } catch {
        setBootstrap(emptyBootstrap);
      }
    };

    void bootstrap();
  }, [setBootstrap]);

  useEffect(() => {
    void sendToLua("toggleCamera", { enabled: currentPage === "camera" });
  }, [currentPage]);

  useEffect(() => {
    if (!isReady || currentPage !== "chats") {
      return;
    }

    const refreshConversations = async () => {
      const result = await sendToLua("listConversations", {});
      if (result.ok && result.data?.conversations) {
        setConversations(result.data.conversations);
      }
    };

    void refreshConversations();
  }, [currentPage, isReady, setConversations]);

  useEffect(() => {
    if (!isReady || currentPage !== "chats" || !activeChatId) {
      return;
    }

    const refreshMessages = async () => {
      const result = await sendToLua("listMessages", { chatId: activeChatId, page: 1, pageSize: 40 });
      if (result.ok && result.data?.messages) {
        setMessages(result.data.messages);
      }
      if (result.ok && result.data?.conversations) {
        setConversations(result.data.conversations);
      }
    };

    void refreshMessages();

    const interval = setInterval(() => {
      void refreshMessages();
    }, 4000);

    return () => clearInterval(interval);
  }, [activeChatId, currentPage, isReady, setConversations, setMessages]);

  useEffect(() => {
    if (!isReady || currentPage !== "friends") {
      return;
    }

    const refreshFriends = async () => {
      const [friendsResult, requestsResult] = await Promise.all([
        sendToLua("listFriends", {}),
        sendToLua("listFriendRequests", {})
      ]);

      if (friendsResult.ok && friendsResult.data?.friends) {
        setFriends(friendsResult.data.friends);
      }
      if (requestsResult.ok && requestsResult.data?.friendRequests) {
        setFriendRequests(requestsResult.data.friendRequests);
      }
    };

    void refreshFriends();
  }, [currentPage, isReady, setFriendRequests, setFriends]);

  useNuiEvent<{ visible: boolean }>("setVisible", (payload) => {
    if (typeof payload?.visible === "boolean") setVisible(payload.visible);
  });

  useNuiEvent("openApp", () => {
    setVisible(true);
    setPage("camera");
  });

  if (!isReady) return null;
  if (!visible) return null;

  return (
    <PhoneFrame>
      <TopBar title="SnipChat" subtitle={`${appName} - ${resourceName}`} />

      <main className="screen-body">
        <AnimatePresence mode="wait">
          {currentPage === "camera" && (
            <CameraPage
              onStoryCapture={async (mediaUrl) => {
                const result = await sendToLua("captureStory", {
                  caption: "Story depuis SnipChat",
                  mediaUrl
                });
                if (result.ok && result.data?.stories) {
                  setStories(result.data.stories);
                }
              }}
              onSendSnap={async (mediaUrl) => {
                if (!activeChatId) return;
                const result = await sendToLua("sendSnap", {
                  chatId: activeChatId,
                  mediaUrl
                });
                if (result.ok && result.data?.messages) {
                  setMessages(result.data.messages);
                }
                if (result.ok && result.data?.conversations) {
                  setConversations(result.data.conversations);
                }
              }}
            />
          )}

          {currentPage === "stories" && <StoriesPage stories={stories} />}

          {currentPage === "chats" && (
            <ChatPage
              activeChatId={activeChatId}
              conversations={conversations}
              friends={friends}
              messages={messages}
              onOpenChat={async (chatId) => {
                setActiveChat(chatId);
                const result = await sendToLua("openChat", { chatId, page: 1, pageSize: 40 });
                if (result.ok && result.data?.messages) {
                  setMessages(result.data.messages);
                }
                if (result.ok && result.data?.conversations) {
                  setConversations(result.data.conversations);
                }
              }}
              onSendMessage={async (chatId, text) => {
                const trimmed = text.trim();
                if (!trimmed) return;

                const result = await sendToLua("sendMessage", { chatId, text: trimmed });
                if (result.ok && result.data?.messages) {
                  setMessages(result.data.messages);
                }
                if (result.ok && result.data?.conversations) {
                  setConversations(result.data.conversations);
                }
              }}
            />
          )}

          {currentPage === "friends" && (
            <FriendsPage
              friends={friends}
              friendRequests={friendRequests}
              searchUsers={searchUsers}
              searchPage={searchPage}
              searchTotalPages={searchTotalPages}
              onSearch={async (query, page) => {
                const result = await sendToLua("searchUsers", {
                  query,
                  page,
                  pageSize: 8
                });

                if (result.ok && result.data?.users) {
                  setSearchUsers(result.data.users);
                  setSearchPage(result.data.page ?? 1);
                  setSearchTotalPages(result.data.totalPages ?? 1);
                }
              }}
              onSendFriendRequest={async (username) => {
                const result = await sendToLua("sendFriendRequest", { username });
                if (result.ok && result.data?.friends) {
                  setFriends(result.data.friends);
                }
                const requestsResult = await sendToLua("listFriendRequests", {});
                if (requestsResult.ok && requestsResult.data?.friendRequests) {
                  setFriendRequests(requestsResult.data.friendRequests);
                }
              }}
              onRespondRequest={async (requestId, accept) => {
                const result = await sendToLua("respondFriendRequest", {
                  requestId,
                  accept
                });

                if (result.ok && result.data?.friends) {
                  setFriends(result.data.friends);
                }
                if (result.ok && result.data?.friendRequests) {
                  setFriendRequests(result.data.friendRequests);
                }
              }}
            />
          )}

          {currentPage === "profile" && (
            <ProfilePage
              account={account}
              friends={friends}
              stories={stories}
              onCreateAccount={async (username, displayName) => {
                const result = await sendToLua("registerAccount", {
                  username,
                  displayName
                });
                if (result.ok && result.data?.account) {
                  setAccount(result.data.account);
                }
                if (result.ok && result.data?.friends) {
                  setFriends(result.data.friends);
                }
              }}
              onUpdateProfile={async (displayName, bio) => {
                const result = await sendToLua("updateProfile", {
                  displayName,
                  bio
                });
                if (result.ok && result.data?.account) {
                  setAccount(result.data.account);
                }
              }}
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNav
        currentPage={currentPage}
        onNavigate={(page) => {
          setPage(page);
          void sendToLua("navigate", { page });
        }}
      />
    </PhoneFrame>
  );
}

export default App;
