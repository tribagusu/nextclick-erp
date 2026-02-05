/**
 * Project Repository
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Project, Client } from '@/shared/base-feature/domain/database.types';
import { BaseRepository } from '@/shared/base-feature/domain/base.repository';
import type { ProjectCreateInput, ProjectListParams, ProjectListResponse, ProjectUpdateInput } from '../types';

export class ProjectRepository extends BaseRepository<Project, ProjectCreateInput, ProjectUpdateInput> {
  constructor(dbClient: SupabaseClient<Database>) {
    super(dbClient, 'projects');
  }

  async findAllPaginated(params: ProjectListParams = {}): Promise<ProjectListResponse> {
    const {
      page = 1,
      pageSize = 10,
      search,
      status,
      priority,
      clientId,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    let query = this.dbClient
      .from('projects')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search) {
      query = query.ilike('project_name', `%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return {
      projects: (data ?? []) as Project[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async findByIdWithClient(id: string): Promise<(Project & { client_name: string }) | null> {
    const { data: project, error } = await this.dbClient
      .from('projects')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !project) return null;

    const { data: clientData } = await this.dbClient
      .from('clients')
      .select('name')
      .eq('id', (project as Project).client_id)
      .single();

    return {
      ...(project as Project),
      client_name: (clientData as Pick<Client, 'name'> | null)?.name ?? 'Unknown',
    };
  }
}
