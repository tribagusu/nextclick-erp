/**
 * Communication Service
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, CommunicationLog } from '@/shared/types/database.types';
import { CommunicationRepository } from './communication.repository';
import type { CommunicationListParams, CommunicationListResponse, CommunicationCreateInput, CommunicationUpdateInput } from '../types';
import { communicationApiSchema } from '../schemas';

export class CommunicationService {
  private repository: CommunicationRepository;

  constructor(client: SupabaseClient<Database>) {
    this.repository = new CommunicationRepository(client);
  }

  async getCommunications(params: CommunicationListParams): Promise<CommunicationListResponse> {
    return this.repository.findAllPaginated(params);
  }

  async getCommunication(id: string) {
    return this.repository.findByIdWithRelations(id);
  }

  async createCommunication(input: CommunicationCreateInput): Promise<{ success: boolean; communication?: CommunicationLog; error?: string }> {
    const result = communicationApiSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      const communication = await this.repository.create(result.data as Partial<CommunicationLog>);
      return { success: true, communication };
    } catch (error) {
      console.error('Create communication error:', error);
      return { success: false, error: 'Failed to create communication log' };
    }
  }

  async updateCommunication(id: string, input: CommunicationUpdateInput): Promise<{ success: boolean; communication?: CommunicationLog; error?: string }> {
    const result = communicationApiSchema.partial().safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      const communication = await this.repository.update(id, result.data as Partial<CommunicationLog>);
      return { success: true, communication };
    } catch (error) {
      console.error('Update communication error:', error);
      return { success: false, error: 'Failed to update communication log' };
    }
  }

  async deleteCommunication(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repository.softDelete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete communication error:', error);
      return { success: false, error: 'Failed to delete communication log' };
    }
  }
}
