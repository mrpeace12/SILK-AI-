import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Download } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/50 to-background z-0"></div>
      <Card className="w-full max-w-md shadow-2xl z-10 border-primary/20 bg-background/80 backdrop-blur-lg text-center">
        <CardHeader className="items-center text-center">
          <Logo className="h-20 w-20" />
          <CardTitle className="text-4xl font-bold tracking-tighter pt-4">Welcome to SILK AI</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">The future of intelligent conversation.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-6">
          <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground font-semibold">
            <Link href="/sign-in">
              Sign In to Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Button asChild size="lg" variant="secondary">
                <Link href="/chat">
                  Continue as Guest
                </Link>
              </Button>
            <form action="/api/chat" method="POST">
                <input type="hidden" name="action" value="download" />
                <Button type="submit" size="lg" variant="outline" className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Download Code
                </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
