/**
 * Dashboard Layout
 *
 * Layout for authenticated dashboard pages with sidebar.
 * Fetches user data from server and provides to client components.
 */

import { redirect } from 'next/navigation';
import { createClient } from '../../../supabase/server';
import { DashboardLayoutClient } from './DashboardLayoutClient';
import type { User } from '@/shared/types/database.types';

export default async function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    redirect('/signin');
  }

  // Fetch user profile from database
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // If no profile exists yet, redirect with error
  if (!userProfile) {
    // This shouldn't happen if trigger is working
    redirect('/signin?error=profile_not_found');
  }

  // Cast to our User type (Supabase types may not have is_active yet)
  const profile = userProfile as User;

  // Check if user is active
  if (!profile.is_active) {
    // Sign out the inactive user
    await supabase.auth.signOut();
    redirect('/signin?error=account_disabled');
  }

  const user = {
    name: profile.name,
    email: profile.email,
    avatar_url: profile.avatar_url,
    role: profile.role,
  };

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
