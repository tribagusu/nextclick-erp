/**
 * Milestones Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProjectMilestone } from '@/shared/base-feature/domain/database.types';
import type { MilestoneListParams, MilestoneListResponse, MilestoneCreateInput, MilestoneUpdateInput } from '../../domain/types';

export const milestoneKeys = {
  all: ['milestones'] as const,
  lists: () => [...milestoneKeys.all, 'list'] as const,
  list: (params: MilestoneListParams) => [...milestoneKeys.lists(), params] as const,
  details: () => [...milestoneKeys.all, 'detail'] as const,
  detail: (id: string) => [...milestoneKeys.details(), id] as const,
};

async function fetchMilestones(params: MilestoneListParams): Promise<MilestoneListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.projectId) searchParams.set('projectId', params.projectId);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(`/api/milestones?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch milestones');
  const json = await response.json();
  return json.data;
}

async function fetchMilestone(id: string): Promise<ProjectMilestone & { project_name: string }> {
  const response = await fetch(`/api/milestones/${id}`);
  if (!response.ok) throw new Error('Failed to fetch milestone');
  const json = await response.json();
  return json.data;
}

async function createMilestone(input: MilestoneCreateInput): Promise<ProjectMilestone> {
  const response = await fetch('/api/milestones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to create milestone');
  }
  const json = await response.json();
  return json.data;
}

async function updateMilestone({ id, ...input }: MilestoneUpdateInput & { id: string }): Promise<ProjectMilestone> {
  const response = await fetch(`/api/milestones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to update milestone');
  }
  const json = await response.json();
  return json.data;
}

async function deleteMilestone(id: string): Promise<void> {
  const response = await fetch(`/api/milestones/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to delete milestone');
  }
}

export function useMilestones(params: MilestoneListParams = {}) {
  return useQuery({
    queryKey: milestoneKeys.list(params),
    queryFn: () => fetchMilestones(params),
  });
}

export function useMilestone(id: string) {
  return useQuery({
    queryKey: milestoneKeys.detail(id),
    queryFn: () => fetchMilestone(id),
    enabled: !!id,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.lists() });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMilestone,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.lists() });
      queryClient.setQueryData(milestoneKeys.detail(data.id), data);
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.lists() });
    },
  });
}
