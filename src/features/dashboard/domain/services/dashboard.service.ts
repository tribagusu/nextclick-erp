/**
 * Dashboard Service
 *
 * Aggregates metrics from various tables for dashboard display.
 * Uses explicit type casting due to manual database types.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Project, Client, ProjectMilestone, CommunicationLog } from '@/shared/types/database.types';
import type { DashboardMetrics, ProjectSummary, ClientStats, DashboardData, RecentActivity } from '../types';

// Helper type for Supabase client
type SupabaseDB = SupabaseClient<Database>;

export class DashboardService {
  private client: SupabaseDB;

  constructor(client: SupabaseDB) {
    this.client = client;
  }

  /**
   * Get all dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    const [metrics, recentProjects, topClients, recentActivity] = await Promise.all([
      this.getMetrics(),
      this.getRecentProjects(),
      this.getTopClients(),
      this.getRecentActivity(),
    ]);

    return {
      metrics,
      recentProjects,
      topClients,
      recentActivity,
    };
  }

  /**
   * Get aggregated metrics
   */
  async getMetrics(): Promise<DashboardMetrics> {
    // Count clients
    const { count: totalClients } = await this.client
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Count active projects
    const { count: activeProjects } = await this.client
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null);

    // Count completed projects
    const { count: completedProjects } = await this.client
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .is('deleted_at', null);

    // Count employees
    const { count: totalEmployees } = await this.client
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null);

    // Count pending milestones
    const { count: pendingMilestones } = await this.client
      .from('project_milestones')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress'])
      .is('deleted_at', null);

    // Count recent communications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: recentCommunications } = await this.client
      .from('communication_logs')
      .select('*', { count: 'exact', head: true })
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .is('deleted_at', null);

    // Calculate total revenue and outstanding payments
    const { data: projectsData } = await this.client
      .from('projects')
      .select('total_budget, amount_paid')
      .is('deleted_at', null);

    let totalRevenue = 0;
    let outstandingPayments = 0;
    if (projectsData) {
      const projects = projectsData as Pick<Project, 'total_budget' | 'amount_paid'>[];
      for (const project of projects) {
        totalRevenue += project.total_budget || 0;
        outstandingPayments += (project.total_budget || 0) - (project.amount_paid || 0);
      }
    }

    return {
      totalClients: totalClients ?? 0,
      activeProjects: activeProjects ?? 0,
      completedProjects: completedProjects ?? 0,
      totalEmployees: totalEmployees ?? 0,
      pendingMilestones: pendingMilestones ?? 0,
      recentCommunications: recentCommunications ?? 0,
      totalRevenue,
      outstandingPayments,
    };
  }

  /**
   * Get recent projects with progress
   */
  async getRecentProjects(limit = 5): Promise<ProjectSummary[]> {
    // Fetch projects
    const { data, error } = await this.client
      .from('projects')
      .select('id, project_name, status, priority, end_date, client_id')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const projects = data as Pick<Project, 'id' | 'project_name' | 'status' | 'priority' | 'end_date' | 'client_id'>[];

    // Calculate progress for each project based on milestones
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        // Get client name
        const { data: clientData } = await this.client
          .from('clients')
          .select('name')
          .eq('id', project.client_id)
          .single();

        // Get milestones for progress calculation
        const { data: milestonesData } = await this.client
          .from('project_milestones')
          .select('status')
          .eq('project_id', project.id)
          .is('deleted_at', null);

        let progress = 0;
        if (milestonesData && milestonesData.length > 0) {
          const milestones = milestonesData as Pick<ProjectMilestone, 'status'>[];
          const completedCount = milestones.filter((m) => m.status === 'completed').length;
          progress = Math.round((completedCount / milestones.length) * 100);
        }

        return {
          id: project.id,
          projectName: project.project_name,
          clientName: (clientData as Pick<Client, 'name'> | null)?.name ?? 'Unknown',
          status: project.status,
          priority: project.priority,
          progress,
          dueDate: project.end_date,
        };
      })
    );

    return projectsWithProgress;
  }

  /**
   * Get top clients by project value
   */
  async getTopClients(limit = 5): Promise<ClientStats[]> {
    // Fetch clients
    const { data: clientsData, error } = await this.client
      .from('clients')
      .select('id, name')
      .is('deleted_at', null)
      .limit(limit);

    if (error || !clientsData) return [];

    const clients = clientsData as Pick<Client, 'id' | 'name'>[];

    const clientStats = await Promise.all(
      clients.map(async (client) => {
        // Get projects for this client
        const { data: projectsData } = await this.client
          .from('projects')
          .select('total_budget')
          .eq('client_id', client.id)
          .is('deleted_at', null);

        // Get last communication
        const { data: commData } = await this.client
          .from('communication_logs')
          .select('date')
          .eq('client_id', client.id)
          .is('deleted_at', null)
          .order('date', { ascending: false })
          .limit(1);

        const projects = (projectsData ?? []) as Pick<Project, 'total_budget'>[];
        const totalValue = projects.reduce((sum, p) => sum + (p.total_budget ?? 0), 0);
        const comms = (commData ?? []) as Pick<CommunicationLog, 'date'>[];
        const lastContact = comms.length > 0 ? comms[0].date : null;

        return {
          id: client.id,
          name: client.name,
          projectCount: projects.length,
          totalValue,
          lastContact,
        };
      })
    );

    return clientStats.sort((a, b) => b.totalValue - a.totalValue);
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Get recent projects
    const { data: projectsData } = await this.client
      .from('projects')
      .select('id, project_name, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(3);

    if (projectsData) {
      const projects = projectsData as Pick<Project, 'id' | 'project_name' | 'created_at'>[];
      for (const project of projects) {
        activities.push({
          id: `project-${project.id}`,
          type: 'project',
          title: 'New Project',
          description: project.project_name,
          timestamp: project.created_at,
        });
      }
    }

    // Get recent communications
    const { data: commsData } = await this.client
      .from('communication_logs')
      .select('id, summary, created_at, mode')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(3);

    if (commsData) {
      const comms = commsData as Pick<CommunicationLog, 'id' | 'summary' | 'created_at' | 'mode'>[];
      for (const comm of comms) {
        activities.push({
          id: `comm-${comm.id}`,
          type: 'communication',
          title: `${comm.mode.charAt(0).toUpperCase() + comm.mode.slice(1)} Log`,
          description: comm.summary.substring(0, 100) + (comm.summary.length > 100 ? '...' : ''),
          timestamp: comm.created_at,
        });
      }
    }

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}
