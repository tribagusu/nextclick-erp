/**
 * Client Service
 *
 * Business logic for client operations.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Client } from '@/shared/types/database.types';
import { ClientRepository } from './client.repository';
import type { ClientListParams, ClientListResponse, ClientCreateInput, ClientUpdateInput } from '../types';
import { clientApiSchema, clientUpdateSchema } from '../schemas';

export class ClientService {
  private repository: ClientRepository;

  constructor(client: SupabaseClient<Database>) {
    this.repository = new ClientRepository(client);
  }

  /**
   * Get paginated list of clients
   */
  async getClients(params: ClientListParams): Promise<ClientListResponse> {
    return this.repository.findAllPaginated(params);
  }

  /**
   * Get a single client by ID
   */
  async getClient(id: string): Promise<Client | null> {
    return this.repository.findById(id);
  }

  /**
   * Get client with project stats
   */
  async getClientWithStats(id: string) {
    return this.repository.findByIdWithStats(id);
  }

  /**
   * Create a new client
   */
  async createClient(input: ClientCreateInput): Promise<{ success: boolean; client?: Client; error?: string }> {
    // Validate input (API schema accepts null values)
    const result = clientApiSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      // result.data is already validated, pass directly to repository
      const client = await this.repository.create(result.data as Partial<Client>);
      return { success: true, client };
    } catch (error) {
      console.error('Create client error:', error);
      // Extract meaningful error message from database errors
      const err = error as { message?: string; code?: string; details?: string };
      if (err.code === '42501') {
        return { success: false, error: 'Permission denied. You do not have access to create clients.' };
      }
      return { success: false, error: err.message || 'Failed to create client' };
    }
  }

  /**
   * Update an existing client
   */
  async updateClient(id: string, input: ClientUpdateInput): Promise<{ success: boolean; client?: Client; error?: string }> {
    // Validate input using update schema (without email/phone requirement)
    const result = clientUpdateSchema.safeParse(input);
    if (!result.success) {
      console.error('Client validation failed:', result.error.issues);
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      // Filter out undefined values and transform empty strings to null
      const updates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(result.data)) {
        if (value !== undefined) {
          updates[key] = value === '' ? null : value;
        }
      }

      const client = await this.repository.update(id, updates as Partial<Client>);
      return { success: true, client };
    } catch (error) {
      console.error('Update client error:', error);
      return { success: false, error: 'Failed to update client' };
    }
  }

  /**
   * Soft delete a client
   */
  async deleteClient(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repository.softDelete(id);
      return { success: true };
    } catch (error: unknown) {
      console.error('Delete client error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete client';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Search clients
   */
  async searchClients(query: string, limit = 10): Promise<Client[]> {
    return this.repository.search(query, limit);
  }
}
