/**
 * Project Service
 */

import { BaseService } from '@/shared/base-feature/domain/base.service';
import { PaginatedResponse } from '@/shared/base-feature/domain/base.types';
import type { Project } from '@/shared/base-feature/domain/database.types';
import type { ProjectCreateInput, ProjectListParams, ProjectUpdateInput } from '../types';
import { projectApiSchema } from '../schemas';
import { ProjectRepository } from './project.repository';

export class ProjectService extends BaseService<Project, ProjectCreateInput, ProjectUpdateInput> {

  constructor(private projectRepo: ProjectRepository) {
    super(projectRepo)
  }

  async getProjects(params: ProjectListParams): Promise<PaginatedResponse<Project>> {
    return this.projectRepo.findAllPaginated(params);
  }

  async getProject(id: string) {
    return this.projectRepo.findByIdWithClient(id);
  }

  /**
   * Bulk import projects from CSV data.
   * Rows must already have client_id resolved (handler resolves client_name → client_id).
   * Re-validates each row server-side, then batch-inserts.
   */
  async importProjects(
    rows: ProjectCreateInput[]
  ): Promise<{ success: boolean; imported?: number; error?: string }> {
    // Re-validate every row server-side (defense in depth)
    const validatedRows: Partial<Project>[] = [];
    for (let i = 0; i < rows.length; i++) {
      const result = projectApiSchema.safeParse(rows[i]);
      if (!result.success) {
        return {
          success: false,
          error: `Row ${i + 1}: ${result.error.issues[0].message}`,
        };
      }
      validatedRows.push(result.data as Partial<Project>);
    }

    try {
      const count = await this.projectRepo.createMany(validatedRows);
      return { success: true, imported: count };
    } catch (error) {
      console.error('Import projects error:', error);
      const err = error as { message?: string; code?: string };
      if (err.code === '42501') {
        return { success: false, error: 'Permission denied. You do not have access to import projects.' };
      }
      return { success: false, error: err.message || 'Failed to import projects' };
    }
  }
}
