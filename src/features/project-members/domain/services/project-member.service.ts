/**
 * Project Members Feature - Service
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { ProjectMemberRepository } from './project-member.repository';
import { addProjectMemberSchema, type AddProjectMemberData } from '../schemas';
import type { ProjectMember, ProjectMemberListResponse } from '../types';

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ProjectMemberService {
  private repository: ProjectMemberRepository;

  constructor(supabase: SupabaseClient) {
    this.repository = new ProjectMemberRepository(supabase as never);
  }

  /**
   * Get all team members for a project
   */
  async getProjectMembers(projectId: string): Promise<ServiceResult<ProjectMemberListResponse>> {
    if (!projectId) {
      return { success: false, error: 'Project ID is required' };
    }

    const { data, error } = await this.repository.findByProject(projectId);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        members: data || [],
        total: data?.length || 0,
      },
    };
  }

  /**
   * Add a team member to a project
   */
  async addProjectMember(input: AddProjectMemberData): Promise<ServiceResult<ProjectMember>> {
    // Validate input
    const validation = addProjectMemberSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const { data, error } = await this.repository.addMember(validation.data);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data! };
  }

  /**
   * Remove a team member from a project
   */
  async removeProjectMember(projectId: string, employeeId: string): Promise<ServiceResult<void>> {
    if (!projectId || !employeeId) {
      return { success: false, error: 'Project ID and Employee ID are required' };
    }

    const { error } = await this.repository.removeMember(projectId, employeeId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Update a team member's role
   */
  async updateMemberRole(projectId: string, employeeId: string, role: string | null): Promise<ServiceResult<void>> {
    if (!projectId || !employeeId) {
      return { success: false, error: 'Project ID and Employee ID are required' };
    }

    const { error } = await this.repository.updateMemberRole(projectId, employeeId, role);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}
