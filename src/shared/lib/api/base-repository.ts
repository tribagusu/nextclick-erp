/**
 * Base Repository Pattern
 * 
 * Generic CRUD operations with soft delete support.
 * Use as a base for feature-specific repositories.
 * 
 * Note: Uses more relaxed typing to work with Supabase's complex
 * query builder types. Individual feature repositories can add
 * stricter typing as needed.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TableName } from '@/shared/types/database.types';

export interface RepositoryOptions {
  /** Include soft-deleted records */
  includeSoftDeleted?: boolean;
}

// Generic record type helper - using object for wider compatibility with interfaces
export class BaseRepository<TRow extends { id: string; deleted_at?: string | null }> {
  protected client: SupabaseClient<Database>;
  protected tableName: TableName;

  constructor(client: SupabaseClient<Database>, tableName: TableName) {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * Get all records (excluding soft-deleted by default)
   */
  async findAll(options?: RepositoryOptions): Promise<TRow[]> {
    let query = this.client.from(this.tableName).select('*');

    if (!options?.includeSoftDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as TRow[];
  }

  /**
   * Get a single record by ID
   */
  async findById(id: string, options?: RepositoryOptions): Promise<TRow | null> {
    let query = this.client.from(this.tableName).select('*').eq('id', id);

    if (!options?.includeSoftDeleted) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return (data ?? null) as TRow | null;
  }

  /**
   * Create a new record
   */
  async create(record: Partial<TRow>): Promise<TRow> {
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(record as never)
      .select()
      .single();

    if (error) throw error;
    return data as TRow;
  }

  /**
   * Update a record by ID
   */
  async update(id: string, updates: Partial<TRow>): Promise<TRow> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TRow;
  }

  /**
   * Soft delete a record by ID
   */
  async softDelete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Hard delete a record by ID (use with caution)
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Restore a soft-deleted record
   */
  async restore(id: string): Promise<TRow> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({ deleted_at: null } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as TRow;
  }
}

/**
 * Create a typed repository for a specific table
 * 
 * Example usage:
 * ```ts
 * import type { Client } from '@/shared/types/database.types';
 * 
 * // In a server component or API route
 * const supabase = await createClient();
 * const clientsRepo = new BaseRepository<Client>(supabase, 'clients');
 * const clients = await clientsRepo.findAll();
 * ```
 */
