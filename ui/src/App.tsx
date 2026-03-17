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
import "./styles.css";

function App() {
  const {
    currentPage,
    activeChatId,
    visible,
    friends,
    stories,
    conversations,
    messages,
    setPage,
    setVisible,
    setActiveChat,
    addFriend,
    sendMessage,
    captureStory,
    sendSnapToChat
  } = useSnipStore();

  useNuiEvent<{ visible: boolean }>("setVisible", (payload) => {
    if (typeof payload?.visible === "boolean") setVisible(payload.visible);
  });

  useNuiEvent("openApp", () => {
    setVisible(true);
    setPage("camera");
  });

  if (!visible) return null;

  const activeMessages = messages.filter((message) => message.chatId === activeChatId);

  return (
    <PhoneFrame>
      <TopBar title="SnipChat" subtitle={`${appName} - ${resourceName}`} />

      <main className="screen-body">
        <AnimatePresence mode="wait">
          {currentPage === "camera" && (
            <CameraPage
              onStoryCapture={() => {
                captureStory("Capture depuis l'ecran camera");
                sendToLua("captureStory", { source: "camera" });
              }}
              onSendSnap={() => {
                if (!activeChatId) return;
                sendSnapToChat(activeChatId);
                sendToLua("sendSnap", { chatId: activeChatId });
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
              onAddFriend={(name, username) => {
                addFriend(name, username);
                sendToLua("addFriend", { name, username });
              }}
            />
          )}

          {currentPage === "profile" && <ProfilePage friends={friends} stories={stories} />}
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
