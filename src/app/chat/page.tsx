'use client';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatWelcome } from '@/components/chat/chat-welcome';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { useChat } from 'ai/react';
import { useAuth, useUser } from '@/firebase';
import { useEffect } from 'react';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    // The 'onFinish' logic is removed, as the new API structure
    // correctly handles JSON data and the ChatMessages component will
    // render the download button automatically.
  });
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);


  if (isUserLoading) {
    return <div className="flex h-full w-full items-center justify-center"><p>Loading chat...</p></div>;
  }
  
  return (
    <div className="relative flex h-full max-h-screen flex-col">
      <header className="flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6 z-10">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1 flex items-center gap-2">
          <Logo className="h-8 w-8" />
        </div>
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? <ChatWelcome /> : <ChatMessages messages={messages} />}
      </main>
      <footer className="border-t p-4 bg-background/80 backdrop-blur-sm">
        <ChatInput input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />
      </footer>
    </div>
  );
}

    