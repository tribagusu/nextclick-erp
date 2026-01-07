/**
 * Clients Feature - Domain Types
 *
 * Type definitions for client operations.
 */

import type { Client } from '@/shared/types/database.types';

// =============================================================================
// CLIENT DTOS
// =============================================================================

export type ClientRow = Client;

export interface ClientListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: keyof Client;
  sortOrder?: 'asc' | 'desc';
}

export interface ClientListResponse {
  clients: ClientRow[];
  total: number;
  page: number;
  pageSize: number;
}

// For creating a new client (omit auto-generated fields)
export type ClientCreateInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  address?: string | null;
  notes?: string | null;
};

// For updating a client (all fields optional)
export type ClientUpdateInput = Partial<ClientCreateInput>;
