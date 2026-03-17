import { useEffect } from "react";
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
import type { BootstrapPayload } from "./types";
import "./styles.css";

const emptyBootstrap: BootstrapPayload = {
  account: null,
  friends: [],
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
    stories,
    conversations,
    messages,
    setPage,
    setVisible,
    setActiveChat,
    setBootstrap,
    setAccount,
    setFriends,
    setStories,
    sendMessage
  } = useSnipStore();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const result = await sendToLua("bootstrap", {});
        if (result.ok && result.data) {
          setBootstrap(result.data as BootstrapPayload);
          return;
        }

        // Browser/dev fallback: ensure UI is mounted even if no backend payload is returned.
        setBootstrap(emptyBootstrap);
      } catch {
        setBootstrap(emptyBootstrap);
      }
    };

    bootstrap();
  }, [setBootstrap]);

  useEffect(() => {
    sendToLua("toggleCamera", { enabled: currentPage === "camera" });
  }, [currentPage]);

  useNuiEvent<{ visible: boolean }>("setVisible", (payload) => {
    if (typeof payload?.visible === "boolean") setVisible(payload.visible);
  });

  useNuiEvent("openApp", () => {
    setVisible(true);
    setPage("camera");
  });

  if (!isReady) return null;
  if (!visible) return null;

  const activeMessages = messages.filter((message) => message.chatId === activeChatId);

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
                await sendToLua("sendSnap", {
                  chatId: activeChatId,
                  mediaUrl
                });
              }}
            />
          )}

          {currentPage === "stories" && <StoriesPage stories={stories} />}

          {currentPage === "chats" && (
            <ChatPage
              activeChatId={activeChatId}
              conversations={conversations}
              friends={friends}
              messages={activeMessages}
              onOpenChat={(chatId) => {
                setActiveChat(chatId);
                sendToLua("openChat", { chatId });
              }}
              onSendMessage={(chatId, text) => {
                sendMessage(chatId, text);
                sendToLua("sendMessage", { chatId, text });
              }}
            />
          )}

          {currentPage === "friends" && (
            <FriendsPage
              friends={friends}
              onAddFriend={async (username) => {
                const result = await sendToLua("addFriend", { username });
                if (result.ok && result.data?.friends) {
                  setFriends(result.data.friends);
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
          sendToLua("navigate", { page });
        }}
      />
    </PhoneFrame>
  );
}

export default App;
