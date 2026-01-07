/**
 * Project Members Feature - TanStack Query Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProjectMember, ProjectMemberListResponse } from '../../domain/types';

const QUERY_KEY = 'project-members';

/**
 * Fetch project team members
 */
async function fetchProjectMembers(projectId: string): Promise<ProjectMemberListResponse> {
  const response = await fetch(`/api/projects/${projectId}/members`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch team members');
  }
  return response.json();
}

/**
 * Add team member to project
 */
async function addProjectMember(
  projectId: string,
  data: { employee_id: string; role?: string | null }
): Promise<ProjectMember> {
  const response = await fetch(`/api/projects/${projectId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add team member');
  }
  return response.json();
}

/**
 * Remove team member from project
 */
async function removeProjectMember(projectId: string, employeeId: string): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}/members?employeeId=${employeeId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove team member');
  }
}

/**
 * Hook to fetch project team members
 */
export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: () => fetchProjectMembers(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to add a team member
 */
export function useAddProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { employee_id: string; role?: string | null }) =>
      addProjectMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });
}

/**
 * Hook to remove a team member
 */
export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) => removeProjectMember(projectId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });
}
