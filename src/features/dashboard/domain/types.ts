/**
 * Dashboard Feature - Domain Types
 *
 * Type definitions for dashboard metrics and analytics.
 */

// =============================================================================
// METRICS TYPES
// =============================================================================

export interface DashboardMetrics {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  totalEmployees: number;
  pendingMilestones: number;
  recentCommunications: number;
  totalRevenue: number;
  outstandingPayments: number;
}

export interface ProjectSummary {
  id: string;
  projectName: string;
  clientName: string;
  status: string;
  priority: string;
  progress: number; // 0-100 percentage
  dueDate: string | null;
}

export interface ClientStats {
  id: string;
  name: string;
  projectCount: number;
  totalValue: number;
  lastContact: string | null;
}

export interface RecentActivity {
  id: string;
  type: 'project' | 'milestone' | 'communication' | 'client';
  title: string;
  description: string;
  timestamp: string;
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

export interface DashboardData {
  metrics: DashboardMetrics;
  recentProjects: ProjectSummary[];
  topClients: ClientStats[];
  recentActivity: RecentActivity[];
}
