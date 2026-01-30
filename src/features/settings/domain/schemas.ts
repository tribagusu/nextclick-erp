/**
 * Settings Feature - Validation Schemas
 *
 * Zod schemas for profile update and password change forms.
 */

import { z } from 'zod';

// =============================================================================
// PROFILE UPDATE SCHEMA
// =============================================================================

/**
 * Schema for updating personal profile fields.
 * Only allows name, email, phone - other fields are admin-only.
 */
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
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
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// =============================================================================
// PASSWORD CHANGE SCHEMA
// =============================================================================

/**
 * Schema for changing password with current password verification.
 */
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
