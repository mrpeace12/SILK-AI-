import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-6">
        <Link href="/" aria-label="Back to homepage">
          <Logo />
        </Link>
      </div>
      {children}
    </div>
  );
}
