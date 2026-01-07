/**
 * Employees Feature - Domain Types
 *
 * Type definitions for employee operations.
 */

import type { Employee, EmployeeStatus } from '@/shared/types/database.types';

// =============================================================================
// EMPLOYEE DTOS
// =============================================================================

export type EmployeeRow = Employee;

export interface EmployeeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: EmployeeStatus;
  department?: string;
  sortBy?: keyof Employee;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeListResponse {
  employees: EmployeeRow[];
  total: number;
  page: number;
  pageSize: number;
}

// For creating a new employee (omit auto-generated fields)
export type EmployeeCreateInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  hire_date?: string | null;
  status?: EmployeeStatus;
  salary?: number | null;
};

// For updating an employee (all fields optional)
export type EmployeeUpdateInput = Partial<EmployeeCreateInput>;
