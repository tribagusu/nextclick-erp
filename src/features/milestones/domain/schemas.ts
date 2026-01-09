/**
 * Milestones Feature - Validation Schemas
 */

import { z } from 'zod';

export const milestoneStatusOptions = ['pending', 'in_progress', 'completed', 'cancelled'] as const;

// =============================================================================
// FORM SCHEMA (for form validation - accepts empty strings)
// =============================================================================

export const milestoneFormSchema = z.object({
  project_id: z
    .string()
    .min(1, 'Project is required'),
  milestone: z
    .string()
    .min(1, 'Milestone name is required')
    .min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  completion_date: z.string().optional(),
  status: z
    .enum(milestoneStatusOptions)
    .default('pending'),
  remarks: z.string().optional(),
});

export type MilestoneFormData = z.input<typeof milestoneFormSchema>;

// =============================================================================
// API SCHEMA (for API validation - accepts null for optional fields)
// =============================================================================

export const milestoneApiSchema = z.object({
  project_id: z
    .string()
    .min(1, 'Project is required'),
  milestone: z
    .string()
    .min(1, 'Milestone name is required')
    .min(2, 'Name must be at least 2 characters'),
  // Use transform to convert undefined to null for DB compatibility
  description: z.string().nullish().transform(v => v ?? null),
  due_date: z.string().nullish().transform(v => v ?? null),
  completion_date: z.string().nullish().transform(v => v ?? null),
  status: z.enum(milestoneStatusOptions).optional().transform(v => v ?? 'pending'),
  remarks: z.string().nullish().transform(v => v ?? null),
});

export type MilestoneApiData = z.infer<typeof milestoneApiSchema>;

// =============================================================================
// Transform form data to API data (converts empty strings to null)
// =============================================================================

export function transformMilestoneInput(data: MilestoneFormData): MilestoneApiData {
  return {
    project_id: data.project_id,
    milestone: data.milestone,
    description: data.description || null,
    due_date: data.due_date || null,
    completion_date: data.completion_date || null,
    status: data.status ?? 'pending',
    remarks: data.remarks || null,
  };
}
