'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenuItem, SidebarMenu, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserNav } from '@/components/user-nav';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<{ allowAiTraining: boolean }>(userDocRef);

  const [allowAiTraining, setAllowAiTraining] = useState(true);

  useEffect(() => {
    if (userData !== null && userData.allowAiTraining !== undefined) {
      setAllowAiTraining(userData.allowAiTraining);
    }
  }, [userData]);

  const handleTrainingToggle = (isChecked: boolean) => {
    if (userDocRef) {
      setAllowAiTraining(isChecked);
      updateDocumentNonBlocking(userDocRef, { allowAiTraining: isChecked });
    }
  };

  const isLoading = isUserLoading || isUserDataLoading;

  return (
    <SidebarProvider>
      <Sidebar
        variant="inset"
        className="border-r border-border/80 bg-background/90 backdrop-blur-sm"
      >
        <SidebarHeader className="items-center justify-center p-4">
          <Logo className="size-10" />
          <span className="text-2xl font-semibold tracking-tight">SILK AI</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/chat" tooltip="Back to Chat">
                <ArrowLeft />
                Back to Chat
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarHeader>
            <UserNav />
        </SidebarHeader>
      </Sidebar>
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-4 w-[250px]" />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Switch
                    id="ai-training"
                    checked={allowAiTraining}
                    onCheckedChange={handleTrainingToggle}
                    disabled={user?.isAnonymous}
                  />
                  <Label htmlFor="ai-training" className="flex flex-col gap-1">
                    <span>Allow AI Training</span>
                    <span className="font-normal text-muted-foreground text-xs">
                      Allow SILK AI to use your anonymized conversations to improve the model.
                    </span>
                  </Label>
                </div>
              )}
               {user?.isAnonymous && (
                  <p className="text-xs text-muted-foreground">
                    Sign in to manage your data preferences.
                  </p>
                )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
