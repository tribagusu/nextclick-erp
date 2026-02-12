/**
 * Communications Feature - Validation Schemas
 */

import { z } from 'zod';

export const communicationModeOptions = ['email', 'call', 'meeting'] as const;

// =============================================================================
// FORM SCHEMA (for client-side form validation)
// =============================================================================

export const communicationFormSchema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  project_id: z.string().optional(),
  date: z.string().min(1, 'Please select a communication date'),
  mode: z.enum(communicationModeOptions, {
    message: 'Please select a communication type (email, call, or meeting)',
  }),
  summary: z
    .string()
    .min(1, 'Please provide a summary of the communication')
    .min(10, 'Summary must be at least 10 characters'),
  follow_up_required: z.boolean().default(false),
  follow_up_date: z.string().optional(),
});

export type CommunicationFormData = z.input<typeof communicationFormSchema>;

// =============================================================================
// API SCHEMA (accepts null for optional fields from server)
// =============================================================================

export const communicationApiSchema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  project_id: z.string().nullable().optional(),
  date: z.string().min(1, 'Please select a communication date'),
  mode: z.enum(communicationModeOptions, {
    message: 'Please select a communication type (email, call, or meeting)',
  }),
  summary: z
    .string()
    .min(1, 'Please provide a summary of the communication')
    .min(10, 'Summary must be at least 10 characters'),
  follow_up_required: z.boolean().default(false),
  follow_up_date: z.string().nullable().optional(),
});

export type CommunicationApiData = z.infer<typeof communicationApiSchema>;
