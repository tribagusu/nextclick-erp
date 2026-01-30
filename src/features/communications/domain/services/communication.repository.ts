/**
 * Communication Repository
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, CommunicationLog, Client, Project } from '@/shared/base-feature/domain/database.types';
import { BaseRepository } from '@/shared/base-feature/domain/base.repository';
import type { CommunicationCreateInput, CommunicationListParams, CommunicationUpdateInput } from '../types';
import { PaginatedResponse } from '@/shared/base-feature/domain/base.types';
import { TableNames } from '@/shared/app.constants';

export class CommunicationRepository extends BaseRepository<CommunicationLog, CommunicationCreateInput, CommunicationUpdateInput> {
  constructor(dbClient: SupabaseClient<Database>) {
    super(dbClient, TableNames.COMMUNICATION_LOG);
  }

  async findAllPaginated(params: CommunicationListParams = {}): Promise<PaginatedResponse<CommunicationLog>> {
    const {
      page = 1,
      pageSize = 10,
      search,
      mode,
      client_id,
      project_id,
      follow_up_required,
      sortBy = 'date',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    let query = this.dbClient
      .from(TableNames.COMMUNICATION_LOG)
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search) {
      query = query.ilike('summary', `%${search}%`);
    }
    if (mode) {
      query = query.eq('mode', mode);
    }
    if (client_id) {
      query = query.eq('client_id', client_id);
    }
    if (project_id) {
      query = query.eq('project_id', project_id);
    }
    if (follow_up_required !== undefined) {
      query = query.eq('follow_up_required', follow_up_required);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return {
      data: (data ?? []) as CommunicationLog[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async findByIdWithRelations(id: string): Promise<(CommunicationLog & { client_name: string; project_name: string | null }) | null> {
    const { data: log, error } = await this.dbClient
      .from(TableNames.COMMUNICATION_LOG)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !log) return null;

    const logData = log as CommunicationLog;

    const { data: clientData } = await this.dbClient
      .from('clients')
      .select('name')
      .eq('id', logData.client_id)
      .single();

    let projectName: string | null = null;
    if (logData.project_id) {
      const { data: projectData } = await this.dbClient
        .from('projects')
        .select('project_name')
        .eq('id', logData.project_id)
        .single();
      projectName = (projectData as Pick<Project, 'project_name'> | null)?.project_name ?? null;
    }

    return {
      ...logData,
      client_name: (clientData as Pick<Client, 'name'> | null)?.name ?? 'Unknown',
      project_name: projectName,
    };
  }
}
