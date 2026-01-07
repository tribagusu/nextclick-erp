/**
 * Projects Feature - Validation Schemas
 */

import { z } from 'zod';

export const projectStatusOptions = ['draft', 'active', 'on_hold', 'completed', 'cancelled'] as const;
export const projectPriorityOptions = ['low', 'medium', 'high', 'urgent'] as const;

// =============================================================================
// FORM SCHEMA (for client-side form validation)
// =============================================================================

export const projectFormSchema = z.object({
  project_name: z
    .string()
    .min(1, 'Project name is required')
    .min(2, 'Name must be at least 2 characters'),
  client_id: z
    .string()
    .min(1, 'Client is required'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(projectStatusOptions).default('draft'),
  priority: z.enum(projectPriorityOptions).default('medium'),
  total_budget: z.string().optional(),
  amount_paid: z.string().optional(),
  payment_terms: z.string().optional(),
});

export type ProjectFormData = z.input<typeof projectFormSchema>;

// =============================================================================
// SIMPLIFIED CREATE SCHEMA (for quick project creation dialog)
// =============================================================================

export const projectCreateSchema = z.object({
  project_name: z
    .string()
    .min(1, 'Project name is required')
    .min(2, 'Name must be at least 2 characters'),
  client_id: z
    .string()
    .min(1, 'Client is required'),
  status: z.enum(projectStatusOptions).default('draft'),
  priority: z.enum(projectPriorityOptions).default('medium'),
});

export type ProjectCreateFormData = z.input<typeof projectCreateSchema>;

// =============================================================================
// API SCHEMA (accepts null for optional fields from server)
// =============================================================================

export const projectApiSchema = z.object({
  project_name: z
    .string()
    .min(1, 'Project name is required')
    .min(2, 'Name must be at least 2 characters'),
  client_id: z.string().min(1, 'Client is required'),
  description: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  status: z.enum(projectStatusOptions).default('draft'),
  priority: z.enum(projectPriorityOptions).default('medium'),
  total_budget: z.number().nullable().optional(),
  amount_paid: z.number().nullable().optional(),
  payment_terms: z.string().nullable().optional(),
});

export type ProjectApiData = z.infer<typeof projectApiSchema>;

// =============================================================================
// Transform form data to API format
// =============================================================================

export function transformProjectInput(data: ProjectFormData): ProjectApiData {
  return {
    project_name: data.project_name,
    client_id: data.client_id,
    description: data.description || null,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    status: data.status ?? 'draft',
    priority: data.priority ?? 'medium',
    total_budget: data.total_budget ? parseFloat(data.total_budget) : null,
    amount_paid: data.amount_paid ? parseFloat(data.amount_paid) : null,
    payment_terms: data.payment_terms || null,
  };
}

export function transformProjectCreateInput(data: ProjectCreateFormData): Partial<ProjectApiData> {
  return {
    project_name: data.project_name,
    client_id: data.client_id,
    status: data.status ?? 'draft',
    priority: data.priority ?? 'medium',
  };
}
