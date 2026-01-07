'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { useSignOut } from '@/features/auth/ui/hooks/useAuth';
import type { UserRole } from '@/shared/types/database.types';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string;
    avatar_url: string | null;
    role: UserRole;
  };
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
  const router = useRouter();
  const signOutMutation = useSignOut();

  const handleLogout = async () => {
    await signOutMutation.mutateAsync();
    router.push('/signin');
    router.refresh();
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}
