/**
 * Clients Feature - Validation Schemas
 *
 * Zod schemas for client form validation.
 */

import { z } from 'zod';

// =============================================================================
// CLIENT SCHEMA
// =============================================================================

export const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'Client name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
  company_name: z
    .string()
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Transform empty strings to null for database
export function transformClientInput(data: ClientFormData) {
  return {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    company_name: data.company_name || null,
    address: data.address || null,
    notes: data.notes || null,
  };
}
