/**
 * Project Repository
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Project, Client } from '@/shared/base-feature/domain/database.types';
import { BaseRepository } from '@/shared/base-feature/domain/base.repository';
import type { ProjectCreateInput, ProjectListParams, ProjectUpdateInput } from '../types';
import { PaginatedResponse } from '@/shared/base-feature/domain/base.types';
import { TableNames } from '@/shared/app.constants';

export class ProjectRepository extends BaseRepository<Project, ProjectCreateInput, ProjectUpdateInput> {
  constructor(dbClient: SupabaseClient<Database>) {
    super(dbClient, 'projects');
  }

  async findAllPaginated(params: ProjectListParams = {}): Promise<PaginatedResponse<Project>> {
    const {
      page = 1,
      pageSize = 10,
      search,
      status,
      priority,
      client_id,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    let query = this.dbClient
      .from(TableNames.PROJECT)
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
    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return {
      data: (data ?? []) as Project[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async findByIdWithClient(id: string): Promise<(Project & { client_name: string }) | null> {
    const { data: project, error } = await this.dbClient
      .from(TableNames.PROJECT)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !project) return null;

    const { data: clientData } = await this.dbClient
      .from(TableNames.CLIENT)
      .select('name')
      .eq('id', (project as Project).client_id)
      .single();

    return {
      ...(project as Project),
      client_name: (clientData as Pick<Client, 'name'> | null)?.name ?? 'Unknown',
    };
  }
}
