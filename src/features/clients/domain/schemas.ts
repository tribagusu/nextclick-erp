/**
 * Clients Feature - Validation Schemas
 *
 * Zod schemas for client form validation.
 */

import { z } from 'zod';

// =============================================================================
// CLIENT SCHEMA (for form validation)
// =============================================================================

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'Client name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .optional()
    .refine((val) => !val || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Please enter a valid email address',
    }),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// =============================================================================
// API SCHEMA (accepts null for optional fields from transformed input)
// =============================================================================

export const clientApiSchema = z.object({
  name: z
    .string()
    .min(1, 'Client name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type ClientApiData = z.infer<typeof clientApiSchema>;

// =============================================================================
// Transform empty strings to null for database
// =============================================================================

export function transformClientInput(data: ClientFormData): ClientApiData {
  return {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    company_name: data.company_name || null,
    address: data.address || null,
    notes: data.notes || null,
  };
}
