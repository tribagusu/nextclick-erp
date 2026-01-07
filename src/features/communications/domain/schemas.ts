/**
 * Communications Feature - Validation Schemas
 */

import { z } from 'zod';

export const communicationModeOptions = ['email', 'call', 'meeting'] as const;

export const communicationFormSchema = z.object({
  client_id: z
    .string()
    .min(1, 'Client is required'),
  project_id: z
    .string()
    .optional()
    .or(z.literal('')),
  date: z
    .string()
    .min(1, 'Date is required'),
  mode: z
    .enum(communicationModeOptions),
  summary: z
    .string()
    .min(1, 'Summary is required')
    .min(10, 'Summary must be at least 10 characters'),
  follow_up_required: z
    .boolean()
    .default(false),
  follow_up_date: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type CommunicationFormData = z.input<typeof communicationFormSchema>;

export function transformCommunicationInput(data: CommunicationFormData) {
  return {
    client_id: data.client_id,
    project_id: data.project_id || null,
    date: data.date,
    mode: data.mode,
    summary: data.summary,
    follow_up_required: data.follow_up_required ?? false,
    follow_up_date: data.follow_up_date || null,
  };
}
