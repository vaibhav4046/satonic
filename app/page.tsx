import { ChatSurface } from "@/components/chat/chat-surface";

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden bg-background">
      <ChatSurface />
    </main>
  );
}
