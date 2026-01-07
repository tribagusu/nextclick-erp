/**
 * Project Members Feature - Repository
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectMember, AddProjectMemberInput } from '../types';

export class ProjectMemberRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all members for a project with employee details
   */
  async findByProject(projectId: string): Promise<{ data: ProjectMember[] | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('project_employees')
      .select(`
        project_id,
        employee_id,
        role,
        assigned_at,
        employee:employees!project_employees_employee_id_fkey (
          id,
          name,
          email,
          position
        )
      `)
      .eq('project_id', projectId)
      .order('assigned_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as unknown as ProjectMember[], error: null };
  }

  /**
   * Add a member to a project
   */
  async addMember(input: AddProjectMemberInput): Promise<{ data: ProjectMember | null; error: Error | null }> {
    const { data, error } = await this.supabase
      .from('project_employees')
      .insert({
        project_id: input.project_id,
        employee_id: input.employee_id,
        role: input.role || null,
      })
      .select(`
        project_id,
        employee_id,
        role,
        assigned_at,
        employee:employees!project_employees_employee_id_fkey (
          id,
          name,
          email,
          position
        )
      `)
      .single();

    if (error) {
      // Check for duplicate
      if (error.code === '23505') {
        return { data: null, error: new Error('Employee is already a team member') };
      }
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as unknown as ProjectMember, error: null };
  }

  /**
   * Remove a member from a project
   */
  async removeMember(projectId: string, employeeId: string): Promise<{ error: Error | null }> {
    const { error } = await this.supabase
      .from('project_employees')
      .delete()
      .eq('project_id', projectId)
      .eq('employee_id', employeeId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  }

  /**
   * Update member role
   */
  async updateMemberRole(projectId: string, employeeId: string, role: string | null): Promise<{ error: Error | null }> {
    const { error } = await this.supabase
      .from('project_employees')
      .update({ role })
      .eq('project_id', projectId)
      .eq('employee_id', employeeId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  }

  /**
   * Check if employee is a member of project
   */
  async isMember(projectId: string, employeeId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('project_employees')
      .select('project_id')
      .eq('project_id', projectId)
      .eq('employee_id', employeeId)
      .single();

    return !!data;
  }
}
