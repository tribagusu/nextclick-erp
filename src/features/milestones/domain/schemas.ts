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
    .min(1, 'Please select a project for this milestone'),
  milestone: z
    .string()
    .min(1, 'Please enter a milestone name')
    .min(2, 'Milestone name must be at least 2 characters'),
  description: z
    .string()
    .min(1, 'Please enter a description')
    .max(1000, 'Description cannot exceed 1000 characters'),
  due_date: z
    .string()
    .min(1, 'Please select a target finish date'),
  completion_date: z.string().optional(),
  status: z
    .enum(milestoneStatusOptions, {
      message: 'Please select a valid milestone status',
    })
    .default('pending'),
  remarks: z
    .string()
    .max(500, 'Remarks cannot exceed 500 characters')
    .optional(),
});

export type MilestoneFormData = z.input<typeof milestoneFormSchema>;

// =============================================================================
// API SCHEMA (for API validation - accepts null for optional fields)
// =============================================================================

export const milestoneApiSchema = z.object({
  project_id: z
    .string()
    .min(1, 'Please select a project for this milestone'),
  milestone: z
    .string()
    .min(1, 'Please enter a milestone name')
    .min(2, 'Milestone name must be at least 2 characters'),
  description: z
    .string()
    .min(1, 'Description is required'),
  due_date: z
    .string()
    .min(1, 'Target finish date is required'),
  completion_date: z.string().nullish().transform(v => v ?? null),
  status: z.enum(milestoneStatusOptions, {
    message: 'Please select a valid milestone status',
  }).optional().transform(v => v ?? 'pending'),
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
