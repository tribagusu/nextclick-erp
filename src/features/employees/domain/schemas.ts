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
    .min(1, 'Please enter the employee\'s full name')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .refine(
      (val) => !val || /^[0-9+\-()\s]*$/.test(val),
      'Phone number contains invalid characters'
    )
    .optional()
    .or(z.literal('')),
  position: z
    .string()
    .max(100, 'Position title cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  department: z
    .string()
    .max(100, 'Department name cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  hire_date: z
    .string()
    .optional()
    .or(z.literal('')),
  status: z
    .enum(employeeStatusOptions, {
      message: 'Please select a valid employment status',
    })
    .default('active'),
  salary: z
    .string()
    .refine(
      (val) => !val || !isNaN(parseFloat(val)),
      'Please enter a valid salary amount'
    )
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

// =============================================================================
// API SCHEMA (accepts null values from transformed frontend data)
// =============================================================================

export const employeeApiSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format').nullable().optional(),
  phone: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  hire_date: z.string().nullable().optional(),
  status: z.enum(employeeStatusOptions).optional(),
  salary: z.number().nullable().optional(),
});

export type EmployeeApiData = z.infer<typeof employeeApiSchema>;

// Update schema (name is optional for partial updates)
export const employeeUpdateSchema = employeeApiSchema.partial();

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
