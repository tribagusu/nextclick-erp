/**
 * Employees Feature - Validation Schemas
 *
 * Zod schemas for employee form validation.
 */

import { z } from 'zod';

// =============================================================================
// EMPLOYEE SCHEMA
// =============================================================================

export const employeeStatusOptions = ['active', 'inactive', 'on_leave'] as const;

// Input schema for form - mirrors what the form fields accept
export const employeeFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Employee name is required')
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
  position: z
    .string()
    .optional()
    .or(z.literal('')),
  department: z
    .string()
    .optional()
    .or(z.literal('')),
  hire_date: z
    .string()
    .optional()
    .or(z.literal('')),
  status: z
    .enum(employeeStatusOptions)
    .default('active'),
  salary: z
    .string()
    .optional()
    .or(z.literal('')),
});

// For validation on API side (with transforms)
export const employeeSchema = employeeFormSchema.transform((data) => ({
  name: data.name,
  email: data.email || null,
  phone: data.phone || null,
  position: data.position || null,
  department: data.department || null,
  hire_date: data.hire_date || null,
  status: data.status,
  salary: data.salary ? parseFloat(data.salary) : null,
}));

// Form data type (input shape)
export type EmployeeFormData = z.input<typeof employeeFormSchema>;

// Transformed data type (output shape for API)
export type EmployeeFormOutput = z.output<typeof employeeSchema>;

// Transform form data to database format
export function transformEmployeeInput(data: EmployeeFormData) {
  return {
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    position: data.position || null,
    department: data.department || null,
    hire_date: data.hire_date || null,
    status: data.status,
    salary: data.salary ? parseFloat(data.salary) : null,
  };
}
