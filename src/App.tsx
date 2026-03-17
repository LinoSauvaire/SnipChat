import { AnimatePresence } from "framer-motion";
import { BottomNav } from "./components/BottomNav";
import { PhoneFrame } from "./components/PhoneFrame";
import { TopBar } from "./components/TopBar";
import { useNuiEvent } from "./hooks/useNuiEvent";
import { selectMessagesByChat, useSnipStore } from "./hooks/useSnipStore";
import { CameraPage } from "./pages/CameraPage";
import { ChatPage } from "./pages/ChatPage";
import { FriendsPage } from "./pages/FriendsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StoriesPage } from "./pages/StoriesPage";
import { appName, resourceName } from "./utils/constants";
import { postToLua } from "./utils/nui";

function App() {
  const {
    currentPage,
    activeChatId,
    friends,
    stories,
    conversations,
    visibility,
    setPage,
    setVisibility,
    setActiveChat,
    addFriend,
    sendMessage,
    captureStory,
    sendSnapToFriend
  } = useSnipStore();

  const messages = useSnipStore(selectMessagesByChat(activeChatId));

  useNuiEvent<{ visible: boolean }>("setVisible", (payload) => {
    if (typeof payload?.visible === "boolean") setVisibility(payload.visible);
  });

  useNuiEvent("openApp", () => {
    setVisibility(true);
    setPage("camera");
  });

  if (!visibility) return null;

  return (
    <PhoneFrame>
      <TopBar title="SnipChat" subtitle={`${appName} · ${resourceName}`} />

      <main className="app-body">
        <AnimatePresence mode="wait">
          {currentPage === "camera" ? (
            <CameraPage
              onCaptureStory={() => {
                captureStory("Captured from camera screen");
                postToLua("captureStory", { source: "camera", app: appName });
              }}
              onSendSnap={() => {
                if (!activeChatId) return;
                sendSnapToFriend(activeChatId);
                postToLua("sendSnap", { chatId: activeChatId });
              }}
            />
          ) : null}

          {currentPage === "stories" ? <StoriesPage stories={stories} /> : null}

          {currentPage === "chats" ? (
            <ChatPage
              activeChatId={activeChatId}
              friends={friends}
              conversations={conversations}
              messages={messages}
              onSelectChat={(chatId) => {
                setActiveChat(chatId);
                postToLua("openChat", { chatId });
              }}
              onSendMessage={(chatId, content) => {
                sendMessage(chatId, content);
                postToLua("sendMessage", { chatId, content });
              }}
            />
          ) : null}

          {currentPage === "friends" ? (
            <FriendsPage
              friends={friends}
              onAddFriend={(name, username) => {
                addFriend(name, username);
                postToLua("addFriend", { name, username });
              }}
            />
          ) : null}

          {currentPage === "profile" ? <ProfilePage friends={friends} stories={stories} /> : null}
        </AnimatePresence>
      </main>

      <BottomNav
        currentPage={currentPage}
        onNavigate={(page) => {
          setPage(page);
          postToLua("navigate", { page });
        }}
      />
    </PhoneFrame>
  );
}

export default App;
