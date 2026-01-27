/**
 * Communication Repository
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, CommunicationLog, Client, Project } from '@/shared/types/database.types';
import { BaseRepository } from '@/shared/lib/api/base-repository';
import type { CommunicationListParams, CommunicationListResponse } from '../types';

export class CommunicationRepository extends BaseRepository<CommunicationLog> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'communication_logs');
  }

  async findAllPaginated(params: CommunicationListParams = {}): Promise<CommunicationListResponse> {
    const {
      page = 1,
      pageSize = 10,
      search,
      mode,
      clientId,
      projectId,
      followUpRequired,
      sortBy = 'date',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    let query = this.client
      .from('communication_logs')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (search) {
      query = query.ilike('summary', `%${search}%`);
    }
    if (mode) {
      query = query.eq('mode', mode);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (followUpRequired !== undefined) {
      query = query.eq('follow_up_required', followUpRequired);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return {
      communications: (data ?? []) as CommunicationLog[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async findByIdWithRelations(id: string): Promise<(CommunicationLog & { client_name: string; project_name: string | null }) | null> {
    const { data: log, error } = await this.client
      .from('communication_logs')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !log) return null;

    const logData = log as CommunicationLog;
    
    const { data: clientData } = await this.client
      .from('clients')
      .select('name')
      .eq('id', logData.client_id)
      .single();

    let projectName: string | null = null;
    if (logData.project_id) {
      const { data: projectData } = await this.client
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
