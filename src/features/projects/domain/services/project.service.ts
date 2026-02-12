/**
 * Project Service
 */

import { BaseService } from '@/shared/base-feature/domain/base.service';
import { PaginatedResponse } from '@/shared/base-feature/domain/base.types';
import type { Project } from '@/shared/base-feature/domain/database.types';
import type { ProjectCreateInput, ProjectListParams, ProjectUpdateInput } from '../types';
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
}
