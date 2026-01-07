/**
 * Milestones Feature - Validation Schemas
 */

import { z } from 'zod';

export const milestoneStatusOptions = ['pending', 'in_progress', 'completed', 'cancelled'] as const;

export const milestoneFormSchema = z.object({
  project_id: z
    .string()
    .min(1, 'Project is required'),
  milestone: z
    .string()
    .min(1, 'Milestone name is required')
    .min(2, 'Name must be at least 2 characters'),
  description: z
    .string()
    .optional()
    .or(z.literal('')),
  due_date: z
    .string()
    .optional()
    .or(z.literal('')),
  completion_date: z
    .string()
    .optional()
    .or(z.literal('')),
  status: z
    .enum(milestoneStatusOptions)
    .default('pending'),
  remarks: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type MilestoneFormData = z.input<typeof milestoneFormSchema>;

export function transformMilestoneInput(data: MilestoneFormData) {
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
