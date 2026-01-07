/**
 * Project Service
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Project } from '@/shared/types/database.types';
import { ProjectRepository } from './project.repository';
import type { ProjectListParams, ProjectListResponse, ProjectCreateInput, ProjectUpdateInput } from '../types';
import { projectFormSchema, transformProjectInput } from '../schemas';

export class ProjectService {
  private repository: ProjectRepository;

  constructor(client: SupabaseClient<Database>) {
    this.repository = new ProjectRepository(client);
  }

  async getProjects(params: ProjectListParams): Promise<ProjectListResponse> {
    return this.repository.findAllPaginated(params);
  }

  async getProject(id: string) {
    return this.repository.findByIdWithClient(id);
  }

  async createProject(input: ProjectCreateInput): Promise<{ success: boolean; project?: Project; error?: string }> {
    const result = projectFormSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      const data = transformProjectInput(result.data);
      const project = await this.repository.create(data);
      return { success: true, project };
    } catch (error) {
      console.error('Create project error:', error);
      return { success: false, error: 'Failed to create project' };
    }
  }

  async updateProject(id: string, input: ProjectUpdateInput): Promise<{ success: boolean; project?: Project; error?: string }> {
    const result = projectFormSchema.partial().safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      const data = transformProjectInput({
        project_name: result.data.project_name ?? '',
        client_id: result.data.client_id ?? '',
        ...result.data,
      });
      const project = await this.repository.update(id, data as Partial<Project>);
      return { success: true, project };
    } catch (error) {
      console.error('Update project error:', error);
      return { success: false, error: 'Failed to update project' };
    }
  }

  async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repository.softDelete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete project error:', error);
      return { success: false, error: 'Failed to delete project' };
    }
  }
}
