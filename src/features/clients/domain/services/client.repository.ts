/**
 * Client Repository
 *
 * Database operations for clients, extending BaseRepository.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Client } from '@/shared/base-feature/domain/database.types';
import { BaseRepository } from '@/shared/base-feature/domain/base.repository';
import type { ClientListParams, ClientListResponse, ClientUpdateInput, ClientCreateInput } from '../types';

export class ClientRepository extends BaseRepository<Client, ClientCreateInput, ClientUpdateInput> {
  constructor(dbClient: SupabaseClient<Database>) {
    super(dbClient, 'clients');
  }

  /**
   * Get clients with pagination and search
   */
  async findAllPaginated(params: ClientListParams = {}): Promise<ClientListResponse> {
    const {
      page = 1,
      pageSize = 10,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    // Build query
    let query = this.dbClient
      .from('clients')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    // Add sorting and pagination
    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return {
      clients: (data ?? []) as Client[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  /**
   * Search clients by name or email
   */
  async search(query: string, limit = 10): Promise<Client[]> {
    const { data, error } = await this.dbClient
      .from('clients')
      .select('*')
      .is('deleted_at', null)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as Client[];
  }

  /**
   * Get client with related projects count
   */
  async findByIdWithStats(id: string): Promise<Client & { projectCount: number } | null> {
    const { data: client, error } = await this.dbClient
      .from('clients')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !client) return null;

    // Get project count
    const { count } = await this.dbClient
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', id)
      .is('deleted_at', null);

    return {
      ...(client as Client),
      projectCount: count ?? 0,
    };
  }
}
