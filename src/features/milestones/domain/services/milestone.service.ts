/**
 * Milestone Service
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ProjectMilestone } from '@/shared/types/database.types';
import { MilestoneRepository } from './milestone.repository';
import type { MilestoneListParams, MilestoneListResponse, MilestoneCreateInput, MilestoneUpdateInput } from '../types';
import { milestoneFormSchema, transformMilestoneInput } from '../schemas';

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
    const result = milestoneFormSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      const data = transformMilestoneInput(result.data);
      const milestone = await this.repository.create(data);
      return { success: true, milestone };
    } catch (error) {
      console.error('Create milestone error:', error);
      return { success: false, error: 'Failed to create milestone' };
    }
  }

  async updateMilestone(id: string, input: MilestoneUpdateInput): Promise<{ success: boolean; milestone?: ProjectMilestone; error?: string }> {
    const result = milestoneFormSchema.partial().safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      const data = transformMilestoneInput({
        project_id: result.data.project_id ?? '',
        milestone: result.data.milestone ?? '',
        ...result.data,
      });
      const milestone = await this.repository.update(id, data as Partial<ProjectMilestone>);
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
