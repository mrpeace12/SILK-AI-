'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Paperclip } from 'lucide-react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({ input, handleInputChange, handleSubmit }: ChatInputProps) {
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        placeholder="Ask SILK AI anything..."
        className="min-h-[52px] w-full rounded-2xl border-2 border-input bg-background/80 p-4 pr-36 text-base shadow-sm resize-none focus-visible:ring-primary"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="rounded-full">
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Upload file</span>
        </Button>
        <Button type="button" variant="ghost" size="icon" className="rounded-full">
          <Mic className="h-5 w-5" />
          <span className="sr-only">Use microphone</span>
        </Button>
        <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90" disabled={!input.trim()}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
}
