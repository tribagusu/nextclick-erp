/**
 * Milestones Feature - Domain Types
 */

import type { ProjectMilestone, MilestoneStatus } from '@/shared/base-feature/domain/database.types';

export type MilestoneRow = ProjectMilestone;

export interface MilestoneListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: MilestoneStatus;
  projectId?: string;
  sortBy?: keyof ProjectMilestone;
  sortOrder?: 'asc' | 'desc';
}

export interface MilestoneListResponse {
  milestones: MilestoneRow[];
  total: number;
  page: number;
  pageSize: number;
}

export type MilestoneCreateInput = {
  project_id: string;
  milestone: string;
  description?: string | null;
  due_date?: string | null;
  completion_date?: string | null;
  status?: MilestoneStatus;
  remarks?: string | null;
};

export type MilestoneUpdateInput = Partial<MilestoneCreateInput>;
