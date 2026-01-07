/**
 * Projects Feature - Domain Types
 */

import type { Project, ProjectStatus, ProjectPriority } from '@/shared/types/database.types';

export type ProjectRow = Project;

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  sortBy?: keyof Project;
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  projects: ProjectRow[];
  total: number;
  page: number;
  pageSize: number;
}

export type ProjectCreateInput = {
  project_name: string;
  client_id: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  total_budget?: number;
  amount_paid?: number;
  payment_terms?: string | null;
};

export type ProjectUpdateInput = Partial<ProjectCreateInput>;
