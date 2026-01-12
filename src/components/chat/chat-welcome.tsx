import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lightbulb, Code, BookOpen } from 'lucide-react';

export function ChatWelcome() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-4">
      <div className="mb-4">
        <Logo className="h-24 w-24" />
      </div>
      <h2 className="text-3xl font-semibold tracking-tight">How can I help you today?</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        I am SILK AI, a new frontier in intelligent conversation. Let&apos;s explore what we can create together.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
        <Card className="p-4 flex flex-col items-center justify-center text-center bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer">
            <Lightbulb className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold">Suggest ideas</p>
            <p className="text-sm text-muted-foreground">for my new project</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer">
            <Code className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold">Write a function</p>
            <p className="text-sm text-muted-foreground">to sort a list in Python</p>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center text-center bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer">
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <p className="font-semibold">Explain the plot</p>
            <p className="text-sm text-muted-foreground">of a famous novel</p>
        </Card>
      </div>
    </div>
  );
}
