/**
 * Milestone Employees API Handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import type { MilestoneEmployeeListResponse } from '../domain/milestone-employees.types';

/**
 * GET /api/milestones/[id]/employees - Get milestone assignees
 */
export async function handleGetMilestoneEmployees(
  _request: NextRequest,
  milestoneId: string
): Promise<NextResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('milestone_employees')
    .select(`
      milestone_id,
      employee_id,
      assigned_at,
      employee:employees!milestone_employees_employee_id_fkey (
        id,
        name,
        email,
        position
      )
    `)
    .eq('milestone_id', milestoneId)
    .order('assigned_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const response: MilestoneEmployeeListResponse = {
    employees: data || [],
    total: data?.length || 0,
  };

  return NextResponse.json(response);
}

/**
 * POST /api/milestones/[id]/employees - Assign employee to milestone
 */
export async function handleAddMilestoneEmployee(
  request: NextRequest,
  milestoneId: string
): Promise<NextResponse> {
  const supabase = await createClient();

  const body = await request.json();
  const { employee_id } = body;

  if (!employee_id) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  // First verify the milestone exists and get its project_id
  const { data: milestoneData, error: milestoneError } = await supabase
    .from('project_milestones')
    .select('id, project_id')
    .eq('id', milestoneId)
    .single();

  if (milestoneError || !milestoneData) {
    return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
  }

  const projectId = milestoneData.project_id as string;

  // Verify employee is a project team member
  const { data: projectMember } = await supabase
    .from('project_employees')
    .select('employee_id')
    .eq('project_id', projectId)
    .eq('employee_id', employee_id)
    .single();

  if (!projectMember) {
    return NextResponse.json(
      { error: 'Employee must be a project team member first' },
      { status: 400 }
    );
  }

  // Add to milestone
  const { data, error } = await supabase
    .from('milestone_employees')
    .insert({
      milestone_id: milestoneId,
      employee_id: employee_id,
    })
    .select(`
      milestone_id,
      employee_id,
      assigned_at,
      employee:employees!milestone_employees_employee_id_fkey (
        id,
        name,
        email,
        position
      )
    `)
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Employee already assigned' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}

/**
 * DELETE /api/milestones/[id]/employees - Remove employee from milestone
 */
export async function handleRemoveMilestoneEmployee(
  request: NextRequest,
  milestoneId: string
): Promise<NextResponse> {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  if (!employeeId) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('milestone_employees')
    .delete()
    .eq('milestone_id', milestoneId)
    .eq('employee_id', employeeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
