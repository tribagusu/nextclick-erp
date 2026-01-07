/**
 * Projects Feature - Validation Schemas
 */

import { z } from 'zod';

export const projectStatusOptions = ['draft', 'active', 'on_hold', 'completed', 'cancelled'] as const;
export const projectPriorityOptions = ['low', 'medium', 'high', 'urgent'] as const;

export const projectFormSchema = z.object({
  project_name: z
    .string()
    .min(1, 'Project name is required')
    .min(2, 'Name must be at least 2 characters'),
  client_id: z
    .string()
    .min(1, 'Client is required'),
  description: z
    .string()
    .optional()
    .or(z.literal('')),
  start_date: z
    .string()
    .optional()
    .or(z.literal('')),
  end_date: z
    .string()
    .optional()
    .or(z.literal('')),
  status: z
    .enum(projectStatusOptions)
    .default('draft'),
  priority: z
    .enum(projectPriorityOptions)
    .default('medium'),
  total_budget: z
    .string()
    .optional()
    .or(z.literal('')),
  amount_paid: z
    .string()
    .optional()
    .or(z.literal('')),
  payment_terms: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type ProjectFormData = z.input<typeof projectFormSchema>;

export function transformProjectInput(data: ProjectFormData) {
  return {
    project_name: data.project_name,
    client_id: data.client_id,
    description: data.description || null,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    status: data.status ?? 'draft',
    priority: data.priority ?? 'medium',
    total_budget: data.total_budget ? parseFloat(data.total_budget) : 0,
    amount_paid: data.amount_paid ? parseFloat(data.amount_paid) : 0,
    payment_terms: data.payment_terms || null,
  };
}
