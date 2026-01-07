/**
 * Dashboard Hooks
 *
 * TanStack Query hooks for dashboard data fetching.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardData, DashboardMetrics } from '../../domain/types';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
};

// API functions
async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch('/api/dashboard');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  const json = await response.json();
  return json.data;
}

async function fetchMetrics(): Promise<DashboardMetrics> {
  const response = await fetch('/api/dashboard/metrics');
  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }
  const json = await response.json();
  return json.data;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to get all dashboard data
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: fetchDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get metrics only
 */
export function useMetrics() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: fetchMetrics,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
