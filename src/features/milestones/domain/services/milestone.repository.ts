/**
 * Milestone Repository
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ProjectMilestone, Project } from '@/shared/base-feature/domain/database.types';
import { BaseRepository } from '@/shared/base-feature/domain/base.repository';
import type { MilestoneCreateInput, MilestoneListParams, MilestoneListResponse, MilestoneUpdateInput } from '../types';

export class MilestoneRepository extends BaseRepository<ProjectMilestone, MilestoneCreateInput, MilestoneUpdateInput> {
  constructor(dbClient: SupabaseClient<Database>) {
    super(dbClient, 'project_milestones');
  }

  async findAllPaginated(params: MilestoneListParams = {}): Promise<MilestoneListResponse> {
    const {
      page = 1,
      pageSize = 10,
      search,
      status,
      projectId,
      sortBy = 'due_date',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    let query = this.dbClient
      .from('project_milestones')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search) {
      query = query.ilike('milestone', `%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return {
      milestones: (data ?? []) as ProjectMilestone[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async findByIdWithProject(id: string): Promise<(ProjectMilestone & { project_name: string }) | null> {
    const { data: milestone, error } = await this.dbClient
      .from('project_milestones')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !milestone) return null;

    const { data: projectData } = await this.dbClient
      .from('projects')
      .select('project_name')
      .eq('id', (milestone as ProjectMilestone).project_id)
      .single();

    return {
      ...(milestone as ProjectMilestone),
      project_name: (projectData as Pick<Project, 'project_name'> | null)?.project_name ?? 'Unknown',
    };
  }
}
