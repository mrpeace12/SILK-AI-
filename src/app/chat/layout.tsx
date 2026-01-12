import { ChatLayout } from '@/components/chat/chat-layout';
import React from 'react';

export default function ChatPageLayout({ children }: { children: React.ReactNode }) {
  return <ChatLayout>{children}</ChatLayout>;
}
