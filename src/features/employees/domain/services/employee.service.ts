/**
 * Employee Service
 *
 * Business logic for employee operations.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Employee } from '@/shared/types/database.types';
import { EmployeeRepository } from './employee.repository';
import type { EmployeeListParams, EmployeeListResponse, EmployeeCreateInput, EmployeeUpdateInput } from '../types';
import { employeeApiSchema, employeeUpdateSchema } from '../schemas';

export class EmployeeService {
  private repository: EmployeeRepository;

  constructor(client: SupabaseClient<Database>) {
    this.repository = new EmployeeRepository(client);
  }

  /**
   * Get paginated list of employees
   */
  async getEmployees(params: EmployeeListParams): Promise<EmployeeListResponse> {
    return this.repository.findAllPaginated(params);
  }

  /**
   * Get a single employee by ID
   */
  async getEmployee(id: string): Promise<Employee | null> {
    return this.repository.findById(id);
  }

  /**
   * Get employee with project stats
   */
  async getEmployeeWithStats(id: string) {
    return this.repository.findByIdWithStats(id);
  }

  /**
   * Get unique departments
   */
  async getDepartments(): Promise<string[]> {
    return this.repository.getDepartments();
  }

  /**
   * Create a new employee
   */
  async createEmployee(input: EmployeeCreateInput): Promise<{ success: boolean; employee?: Employee; error?: string }> {
    // Use API schema that accepts null values from transformed frontend data
    const result = employeeApiSchema.safeParse(input);
    if (!result.success) {
      console.error('Employee validation failed:', result.error.issues);
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      const employee = await this.repository.create(result.data as Partial<Employee>);
      return { success: true, employee };
    } catch (error) {
      console.error('Create employee error:', error);
      return { success: false, error: 'Failed to create employee' };
    }
  }

  /**
   * Update an existing employee
   */
  async updateEmployee(id: string, input: EmployeeUpdateInput): Promise<{ success: boolean; employee?: Employee; error?: string }> {
    // Use update schema that accepts null values
    const result = employeeUpdateSchema.safeParse(input);
    if (!result.success) {
      console.error('Employee validation failed:', result.error.issues);
      return { success: false, error: result.error.issues[0].message };
    }

    try {
      const employee = await this.repository.update(id, result.data as Partial<Employee>);
      return { success: true, employee };
    } catch (error) {
      console.error('Update employee error:', error);
      return { success: false, error: 'Failed to update employee' };
    }
  }

  /**
   * Soft delete an employee
   */
  async deleteEmployee(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repository.softDelete(id);
      return { success: true };
    } catch (error) {
      console.error('Delete employee error:', error);
      return { success: false, error: 'Failed to delete employee' };
    }
  }
}
