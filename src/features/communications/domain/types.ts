/**
 * Communications Feature - Domain Types
 */

import type { CommunicationLog, CommunicationMode } from '@/shared/types/database.types';

export type CommunicationRow = CommunicationLog;

export interface CommunicationListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  mode?: CommunicationMode;
  clientId?: string;
  projectId?: string;
  followUpRequired?: boolean;
  sortBy?: keyof CommunicationLog;
  sortOrder?: 'asc' | 'desc';
}

export interface CommunicationListResponse {
  communications: CommunicationRow[];
  total: number;
  page: number;
  pageSize: number;
}

export type CommunicationCreateInput = {
  client_id: string;
  project_id?: string | null;
  date: string;
  mode: CommunicationMode;
  summary: string;
  follow_up_required?: boolean;
  follow_up_date?: string | null;
};

export type CommunicationUpdateInput = Partial<CommunicationCreateInput>;
