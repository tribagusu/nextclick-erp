/**
 * Employees Feature - API Handlers
 */

import { createClient } from '../../../../supabase/server';
import { EmployeeService } from '../domain/services/employee.service';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
} from '@/shared/lib/api/api-utils';
import type { EmployeeStatus } from '@/shared/types/database.types';

export async function handleGetEmployees(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const params = {
      page: parseInt(url.searchParams.get('page') ?? '1'),
      pageSize: parseInt(url.searchParams.get('pageSize') ?? '10'),
      search: url.searchParams.get('search') ?? undefined,
      status: (url.searchParams.get('status') as EmployeeStatus) ?? undefined,
      department: url.searchParams.get('department') ?? undefined,
      sortBy: (url.searchParams.get('sortBy') as 'name' | 'created_at') ?? 'created_at',
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
    };

    const service = new EmployeeService(supabase);
    const data = await service.getEmployees(params);
    return successResponse(data);
  } catch (error) {
    console.error('Get employees error:', error);
    return internalErrorResponse();
  }
}

export async function handleGetEmployee(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const service = new EmployeeService(supabase);
    const employee = await service.getEmployeeWithStats(id);

    if (!employee) return notFoundResponse('Employee');
    return successResponse(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    return internalErrorResponse();
  }
}

export async function handleCreateEmployee(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const service = new EmployeeService(supabase);
    const result = await service.createEmployee(body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to create employee');
    }
    return successResponse(result.employee, undefined, 201);
  } catch (error) {
    console.error('Create employee error:', error);
    return internalErrorResponse();
  }
}

export async function handleUpdateEmployee(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const service = new EmployeeService(supabase);
    const result = await service.updateEmployee(id, body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to update employee');
    }
    return successResponse(result.employee);
  } catch (error) {
    console.error('Update employee error:', error);
    return internalErrorResponse();
  }
}

export async function handleDeleteEmployee(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const service = new EmployeeService(supabase);
    const result = await service.deleteEmployee(id);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to delete employee');
    }
    return successResponse({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    return internalErrorResponse();
  }
}
