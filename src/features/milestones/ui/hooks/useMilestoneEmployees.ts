/**
 * Milestone Employees Hooks
 * 
 * TanStack Query hooks for managing milestone assignees
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MilestoneEmployee, MilestoneEmployeeListResponse } from '../../domain/milestone-employees.types';
import { milestoneKeys } from './useMilestones';

const QUERY_KEY = 'milestone-employees';

/**
 * Fetch milestone assignees
 */
async function fetchMilestoneEmployees(milestoneId: string): Promise<MilestoneEmployeeListResponse> {
  const response = await fetch(`/api/milestones/${milestoneId}/employees`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch milestone assignees');
  }
  return response.json();
}

/**
 * Add employee to milestone
 */
async function addMilestoneEmployee(
  milestoneId: string,
  employeeId: string
): Promise<MilestoneEmployee> {
  const response = await fetch(`/api/milestones/${milestoneId}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id: employeeId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign employee');
  }
  return response.json();
}

/**
 * Remove employee from milestone
 */
async function removeMilestoneEmployee(milestoneId: string, employeeId: string): Promise<void> {
  const response = await fetch(`/api/milestones/${milestoneId}/employees?employeeId=${employeeId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove employee');
  }
}

/**
 * Hook to fetch milestone assignees
 */
export function useMilestoneEmployees(milestoneId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, milestoneId],
    queryFn: () => fetchMilestoneEmployees(milestoneId),
    enabled: !!milestoneId,
  });
}

/**
 * Hook to add employee to milestone
 */
export function useAddMilestoneEmployee(milestoneId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) => addMilestoneEmployee(milestoneId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, milestoneId] });
      queryClient.invalidateQueries({ queryKey: milestoneKeys.lists() });
    },
  });
}

/**
 * Hook to remove employee from milestone
 */
export function useRemoveMilestoneEmployee(milestoneId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: string) => removeMilestoneEmployee(milestoneId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, milestoneId] });
      queryClient.invalidateQueries({ queryKey: milestoneKeys.lists() });
    },
  });
}
