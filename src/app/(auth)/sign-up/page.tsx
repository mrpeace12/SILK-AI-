'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { updateProfile } from 'firebase/auth';

const formSchema = z.object({
  username: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function SignUpPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // This effect runs after a user is created via Firebase Auth and the user object becomes available.
    if (user && !isUserLoading && isSubmitting) {
      const username = form.getValues('username');
      
      // 1. Update Firebase Auth user profile
      updateProfile(user, { displayName: username }).then(() => {
        // 2. Create user document in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(
          userRef,
          {
            id: user.uid,
            email: user.email,
            username: username,
            registrationDate: new Date().toISOString(),
            allowAiTraining: true,
          },
          { merge: true }
        );
        
        // 3. Redirect to chat page
        router.push('/chat');
      }).catch((error) => {
        console.error("Error updating profile or setting document: ", error);
        setIsSubmitting(false); // Reset submitting state on error
      });
    }
  }, [user, isUserLoading, isSubmitting, router, firestore, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    initiateEmailSignUp(auth, values.email, values.password);
  }
  
  // Prevent logged-in users from seeing the sign-up page
  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/chat');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return <div className="text-center">Loading...</div>;
  }
  
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>Enter your information to create an account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Max Robinson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create an account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="mt-4 mb-6 text-center text-sm">
        Already have an account?{' '}
        <Link href="/sign-in" className="underline">
          Sign in
        </Link>
      </div>
    </Card>
  );
}
