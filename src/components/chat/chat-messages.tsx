'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { type Message } from 'ai/react';
import { Logo } from '../logo';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
}

// Helper to check if content is a JSON string with file data
const isFileMessage = (content: string) => {
  try {
    const parsed = JSON.parse(content);
    return parsed.tool_code && parsed.tool_code.fileDataBase64 && parsed.tool_code.filename && parsed.tool_code.fileType;
  } catch (e) {
    return false;
  }
};

const FileMessage = ({ content }: { content: string }) => {
    try {
        const parsedContent = JSON.parse(content);
        const { fileDataBase64, filename, fileType } = parsedContent.tool_code;
        const dataUrl = `data:${fileType};base64,${fileDataBase64}`;

        const handleDownload = () => {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="flex flex-col items-start gap-2">
                <p>I've prepared the file for you. You can download it below.</p>
                <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download {filename}
                </Button>
            </div>
        );
    } catch {
        // If parsing fails, render the raw content
        return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>;
    }
};

export function ChatMessages({ messages }: ChatMessagesProps) {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            'flex items-start gap-4',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {message.role === 'assistant' && (
            <Avatar className="h-9 w-9 border-2 border-primary/50">
                <div className='bg-background p-1.5 rounded-full'>
                    <Logo className="h-6 w-6" />
                </div>
            </Avatar>
          )}

          <div
            className={cn(
              'max-w-[85%] space-y-3',
              message.role === 'user' ? 'text-right' : 'text-left'
            )}
          >
            <div
              className={cn(
                'rounded-xl p-3.5',
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50'
              )}
            >
              {message.role === 'assistant' && isFileMessage(message.content) ? (
                  <FileMessage content={message.content} />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
            
          </div>

          {message.role === 'user' && (
            <Avatar className="h-9 w-9 border-2 border-border">
              <AvatarImage src={userAvatar?.imageUrl} alt="User Avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
}

    