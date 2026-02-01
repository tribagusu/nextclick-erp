/**
 * Clients Feature - Validation Schemas
 *
 * Zod schemas for client form validation.
 */

import { z } from 'zod';

// =============================================================================
// CLIENT SCHEMA (for form validation)
// =============================================================================

export const clientSchema = z
  .object({
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
      .refine(
        (val) => /^[0-9+\-()\s]*$/.test(val),
        'Phone number contains invalid characters'
      )
      .optional()
      .or(z.literal('')),

    company_name: z
      .string()
      .min(1, 'Company Name is required'),

    address: z
      .string()
      .min(1, 'Client Address is required'),

    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasEmail = data.email && data.email.trim() !== '';
      const hasPhone = data.phone && data.phone.trim() !== '';
      return hasEmail || hasPhone;
    },
    {
      message: 'Either an email or phone number is required',
      path: ['email'], // attaches error to email field (UI-friendly)
    }
  );

export type ClientFormData = z.infer<typeof clientSchema>;

// =============================================================================
// API SCHEMA (accepts null for optional fields from transformed input)
// =============================================================================

export const clientApiSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Client name is required')
      .min(2, 'Name must be at least 2 characters'),

    email: z.string().email('Invalid email format').nullable().optional(),
    phone: z.string().nullable().optional(),

    company_name: z.string(),
    address: z.string(),

    notes: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      const hasEmail = data.email && data.email.trim() !== '';
      const hasPhone = data.phone && data.phone.trim() !== '';
      return hasEmail || hasPhone;
    },
    {
      message: 'Either an email or phone number is required',
      path: ['email'],
    }
  );

export type ClientApiData = z.infer<typeof clientApiSchema>;

// =============================================================================
// UPDATE SCHEMA (without the email/phone requirement for partial updates)
// =============================================================================

export const clientUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').nullable().optional(),
  phone: z.string().nullable().optional(),
  company_name: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().nullable().optional(),
});

export type ClientUpdateData = z.infer<typeof clientUpdateSchema>;

// =============================================================================
// Transform empty strings to null for database
// =============================================================================

export function transformClientInput(data: ClientFormData): ClientApiData {
  return {
    name: data.name,
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    company_name: data.company_name,
    address: data.address,
    notes: data.notes || null,
  };
}