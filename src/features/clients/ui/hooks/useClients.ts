/**
 * Clients Hooks
 *
 * TanStack Query hooks for client operations.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client } from '@/shared/base-feature/domain/database.types';
import type { ClientListParams, ClientListResponse, ClientCreateInput, ClientUpdateInput } from '../../domain/types';

// Query keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params: ClientListParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

// API functions
async function fetchClients(params: ClientListParams): Promise<ClientListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(`/api/clients?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch clients');
  const json = await response.json();
  return json.data;
}

async function fetchClient(id: string): Promise<Client & { projectCount: number }> {
  const response = await fetch(`/api/clients/${id}`);
  if (!response.ok) throw new Error('Failed to fetch client');
  const json = await response.json();
  return json.data;
}

async function createClient(input: ClientCreateInput): Promise<Client> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to create client');
  }
  const json = await response.json();
  return json.data;
}

async function updateClient({ id, ...input }: ClientUpdateInput & { id: string }): Promise<Client> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to update client');
  }
  const json = await response.json();
  return json.data;
}

async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to delete client');
  }
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to get paginated list of clients
 */
export function useClients(params: ClientListParams = {}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => fetchClients(params),
  });
}

/**
 * Hook to get a single client
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => fetchClient(id),
    enabled: !!id,
  });
}

/**
 * Hook for creating a client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

/**
 * Hook for updating a client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.setQueryData(clientKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook for deleting a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
