/**
 * Auth Hooks
 *
 * TanStack Query hooks for authentication operations.
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/shared/types/database.types';
import type { LoginCredentials, RegisterData, AuthResponse } from '../../domain/types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// API functions
async function fetchCurrentUser(): Promise<User | null> {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    if (response.status === 401) return null;
    throw new Error('Failed to fetch user');
  }
  const json = await response.json();
  return json.data?.user ?? null;
}

async function signIn(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const json = await response.json();
  if (!response.ok) {
    return { success: false, error: json.error || 'Sign in failed' };
  }
  return json.data;
}

async function signUp(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) {
    return { success: false, error: json.error || 'Sign up failed' };
  }
  return json.data;
}

async function signOut(): Promise<void> {
  const response = await fetch('/api/auth/signout', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Sign out failed');
  }
}

async function forgotPassword(email: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await response.json();
  if (!response.ok) {
    return { success: false, error: json.error || 'Failed to send reset email' };
  }
  return { success: true, message: json.message };
}

async function resetPassword(password: string, confirmPassword: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, confirmPassword }),
  });
  const json = await response.json();
  if (!response.ok) {
    return { success: false, error: json.error || 'Failed to reset password' };
  }
  return { success: true, message: json.message };
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to get the current authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Hook for sign in mutation
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
    },
  });
}

/**
 * Hook for sign up mutation
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      if (data.success && data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
    },
  });
}

/**
 * Hook for sign out mutation
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.clear();
    },
  });
}

/**
 * Hook for forgot password mutation
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

/**
 * Hook for reset password mutation
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ password, confirmPassword }: { password: string; confirmPassword: string }) =>
      resetPassword(password, confirmPassword),
  });
}
