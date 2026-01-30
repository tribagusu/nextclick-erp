/**
 * Settings Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProfileUpdateFormData, PasswordChangeFormData } from '../../domain/schemas';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

interface ProfileData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch('/api/settings/profile');
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('NO_EMPLOYEE_RECORD');
    }
    throw new Error('Failed to fetch profile');
  }
  const json = await response.json();
  return json.data;
}

async function updateProfile(data: ProfileUpdateFormData): Promise<ProfileData> {
  const response = await fetch('/api/settings/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to update profile');
  }
  const json = await response.json();
  return json.data;
}

async function changePassword(data: PasswordChangeFormData): Promise<void> {
  const response = await fetch('/api/settings/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to change password');
  }
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Fetch current user's employee profile for settings
 */
export function useProfile() {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: fetchProfile,
    retry: (failureCount, error) => {
      // Don't retry if no employee record
      if (error.message === 'NO_EMPLOYEE_RECORD') return false;
      return failureCount < 3;
    },
  });
}

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.profile(), data);
    },
  });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}
