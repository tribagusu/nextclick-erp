/**
 * Employee Repository
 *
 * Database operations for employees, extending BaseRepository.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Employee, EmployeeStatus } from '@/shared/base-feature/domain/database.types';
import { BaseRepository } from '@/shared/base-feature/domain/base.repository';
import type { EmployeeCreateInput, EmployeeListParams, EmployeeListResponse, EmployeeUpdateInput } from '../types';

export class EmployeeRepository extends BaseRepository<Employee, EmployeeCreateInput, EmployeeUpdateInput> {
  constructor(dbClient: SupabaseClient<Database>) {
    super(dbClient, 'employees');
  }

  /**
   * Get employees with pagination and filters
   */
  async findAllPaginated(params: EmployeeListParams = {}): Promise<EmployeeListResponse> {
    const {
      page = 1,
      pageSize = 10,
      search,
      status,
      department,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    // Build query
    let query = this.dbClient
      .from('employees')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Add search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,position.ilike.%${search}%`);
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Add department filter
    if (department) {
      query = query.eq('department', department);
    }

    // Add sorting and pagination
    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return {
      employees: (data ?? []) as Employee[],
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  /**
   * Get unique departments for filtering
   */
  async getDepartments(): Promise<string[]> {
    const { data, error } = await this.dbClient
      .from('employees')
      .select('department')
      .is('deleted_at', null)
      .not('department', 'is', null);

    if (error) throw error;

    const departments = new Set<string>();
    for (const row of (data ?? []) as { department: string | null }[]) {
      if (row.department) {
        departments.add(row.department);
      }
    }
    return Array.from(departments).sort();
  }

  /**
   * Get employees by status
   */
  async findByStatus(status: EmployeeStatus): Promise<Employee[]> {
    const { data, error } = await this.dbClient
      .from('employees')
      .select('*')
      .eq('status', status)
      .is('deleted_at', null)
      .order('name');

    if (error) throw error;
    return (data ?? []) as Employee[];
  }

  /**
   * Get employee with project count
   */
  async findByIdWithStats(id: string): Promise<Employee & { projectCount: number } | null> {
    const { data: employee, error } = await this.dbClient
      .from('employees')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !employee) return null;

    // Get project count
    const { count } = await this.dbClient
      .from('project_employees')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', id);

    return {
      ...(employee as Employee),
      projectCount: count ?? 0,
    };
  }
}
