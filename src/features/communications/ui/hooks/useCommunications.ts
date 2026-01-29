/**
 * Communications Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CommunicationLog } from '@/shared/base-feature/domain/database.types';
import type { CommunicationListParams, CommunicationCreateInput, CommunicationUpdateInput } from '../../domain/types';
import { PaginatedResponse } from '@/shared/base-feature/domain/base.types';

export const communicationKeys = {
  all: ['communications'] as const,
  lists: () => [...communicationKeys.all, 'list'] as const,
  list: (params: CommunicationListParams) => [...communicationKeys.lists(), params] as const,
  details: () => [...communicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...communicationKeys.details(), id] as const,
};

async function fetchCommunications(params: CommunicationListParams): Promise<PaginatedResponse<CommunicationLog>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);
  if (params.mode) searchParams.set('mode', params.mode);
  if (params.client_id) searchParams.set('clientId', params.client_id);
  if (params.project_id) searchParams.set('projectId', params.project_id);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(`/api/communications?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch communications');
  const json = await response.json();
  return json.data;
}

async function fetchCommunication(id: string): Promise<CommunicationLog & { client_name: string; project_name: string | null }> {
  const response = await fetch(`/api/communications/${id}`);
  if (!response.ok) throw new Error('Failed to fetch communication');
  const json = await response.json();
  return json.data;
}

async function createCommunication(input: CommunicationCreateInput): Promise<CommunicationLog> {
  const response = await fetch('/api/communications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to create communication');
  }
  const json = await response.json();
  return json.data;
}

async function updateCommunication({ id, ...input }: CommunicationUpdateInput & { id: string }): Promise<CommunicationLog> {
  const response = await fetch(`/api/communications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to update communication');
  }
  const json = await response.json();
  return json.data;
}

async function deleteCommunication(id: string): Promise<void> {
  const response = await fetch(`/api/communications/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to delete communication');
  }
}

export function useCommunications(params: CommunicationListParams = {}) {
  return useQuery({
    queryKey: communicationKeys.list(params),
    queryFn: () => fetchCommunications(params),
  });
}

export function useCommunication(id: string) {
  return useQuery({
    queryKey: communicationKeys.detail(id),
    queryFn: () => fetchCommunication(id),
    enabled: !!id,
  });
}

export function useCreateCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCommunication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.lists() });
    },
  });
}

export function useUpdateCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCommunication,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.lists() });
      queryClient.setQueryData(communicationKeys.detail(data.id), data);
    },
  });
}

export function useDeleteCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCommunication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.lists() });
    },
  });
}
