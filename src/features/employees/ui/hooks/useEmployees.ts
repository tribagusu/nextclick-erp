/**
 * Employees Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Employee } from '@/shared/types/database.types';
import type { EmployeeListParams, EmployeeListResponse, EmployeeCreateInput, EmployeeUpdateInput } from '../../domain/types';

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

async function fetchEmployees(params: EmployeeListParams): Promise<EmployeeListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.department) searchParams.set('department', params.department);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const response = await fetch(`/api/employees?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch employees');
  const json = await response.json();
  return json.data;
}

async function fetchEmployee(id: string): Promise<Employee & { projectCount: number }> {
  const response = await fetch(`/api/employees/${id}`);
  if (!response.ok) throw new Error('Failed to fetch employee');
  const json = await response.json();
  return json.data;
}

async function createEmployee(input: EmployeeCreateInput): Promise<Employee> {
  const response = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to create employee');
  }
  const json = await response.json();
  return json.data;
}

async function updateEmployee({ id, ...input }: EmployeeUpdateInput & { id: string }): Promise<Employee> {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to update employee');
  }
  const json = await response.json();
  return json.data;
}

async function deleteEmployee(id: string): Promise<void> {
  const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error?.message || 'Failed to delete employee');
  }
}

export function useEmployees(params: EmployeeListParams = {}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => fetchEmployees(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => fetchEmployee(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.setQueryData(employeeKeys.detail(data.id), data);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

/**
 * Get the current user's employee record (if linked via user_id)
 */
async function fetchCurrentEmployee(): Promise<Employee | null> {
  const response = await fetch('/api/employees/me');
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch current employee');
  }
  const json = await response.json();
  return json.data;
}

export function useCurrentEmployee() {
  return useQuery({
    queryKey: [...employeeKeys.all, 'me'] as const,
    queryFn: fetchCurrentEmployee,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

