/**
 * Milestone Service
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ProjectMilestone } from '@/shared/base-feature/domain/database.types';
import { MilestoneRepository } from './milestone.repository';
import type { MilestoneListParams, MilestoneListResponse, MilestoneCreateInput, MilestoneUpdateInput } from '../types';
import { milestoneApiSchema } from '../schemas';

export class MilestoneService {
  private repository: MilestoneRepository;

  constructor(client: SupabaseClient<Database>) {
    this.repository = new MilestoneRepository(client);
  }

  async getMilestones(params: MilestoneListParams): Promise<MilestoneListResponse> {
    return this.repository.findAllPaginated(params);
  }

  async getMilestone(id: string) {
    return this.repository.findByIdWithProject(id);
  }

  async createMilestone(input: MilestoneCreateInput): Promise<{ success: boolean; milestone?: ProjectMilestone; error?: string }> {
    // Debug logging (server-side, always logs)
    console.log('[MilestoneService] createMilestone input:', JSON.stringify(input, null, 2));
    
    const result = milestoneApiSchema.safeParse(input);
    console.log('[MilestoneService] Validation result:', {
      success: result.success,
      error: result.success ? null : result.error.issues,
    });
    
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      // Input is already transformed by client, use validated data directly
      const milestone = await this.repository.create(result.data);
      return { success: true, milestone };
    } catch (error) {
      console.error('Create milestone error:', error);
      return { success: false, error: 'Failed to create milestone' };
    }
  }

  async updateMilestone(id: string, input: MilestoneUpdateInput): Promise<{ success: boolean; milestone?: ProjectMilestone; error?: string }> {
    const result = milestoneApiSchema.partial().safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      // Build update data, only including fields that are actually provided
      // This handles restricted mode updates where only status/remarks/completion_date are sent
      const updateData: Record<string, unknown> = {};
      
      if (result.data.status) updateData.status = result.data.status;
      if (result.data.remarks !== undefined) updateData.remarks = result.data.remarks || null;
      if (result.data.completion_date !== undefined) {
        updateData.completion_date = result.data.completion_date || null;
      }
      
      // Only include these fields if they're actually provided (non-empty)
      if (result.data.project_id) updateData.project_id = result.data.project_id;
      if (result.data.milestone) updateData.milestone = result.data.milestone;
      if (result.data.description !== undefined) updateData.description = result.data.description || null;
      if (result.data.due_date) updateData.due_date = result.data.due_date;
      
      const milestone = await this.repository.update(id, updateData as Partial<ProjectMilestone>);
      return { success: true, milestone };
    } catch (error) {
      console.error('Update milestone error:', error);
      return { success: false, error: 'Failed to update milestone' };
    }
  }

  async deleteMilestone(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repository.softDelete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete milestone error:', error);
      return { success: false, error: 'Failed to delete milestone' };
    }
  }
}
