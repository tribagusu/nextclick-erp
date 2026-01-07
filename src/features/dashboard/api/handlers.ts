/**
 * Dashboard Feature - API Handlers
 *
 * HTTP request handlers for dashboard endpoints.
 */

import { createClient } from '@/shared/lib/supabase/server';
import { DashboardService } from '../domain/services/dashboard.service';
import { successResponse, internalErrorResponse, unauthorizedResponse } from '@/shared/lib/api/api-utils';

/**
 * Handle get dashboard data request
 */
export async function handleGetDashboard() {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse('Not authenticated');
    }

    const dashboardService = new DashboardService(supabase);
    const data = await dashboardService.getDashboardData();

    return successResponse(data);
  } catch (error) {
    console.error('Dashboard error:', error);
    return internalErrorResponse();
  }
}

/**
 * Handle get metrics only
 */
export async function handleGetMetrics() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse('Not authenticated');
    }

    const dashboardService = new DashboardService(supabase);
    const metrics = await dashboardService.getMetrics();

    return successResponse(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    return internalErrorResponse();
  }
}
