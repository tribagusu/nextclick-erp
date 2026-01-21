/**
 * Project Members Feature - API Handlers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';
import { ProjectMemberService } from '../domain/services/project-member.service';

/**
 * GET /api/projects/[id]/members - Get project team members
 */
export async function handleGetProjectMembers(
  _request: NextRequest,
  projectId: string
): Promise<NextResponse> {
  const supabase = await createClient();
  const service = new ProjectMemberService(supabase);

  const result = await service.getProjectMembers(projectId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.data);
}

/**
 * POST /api/projects/[id]/members - Add team member
 */
export async function handleAddProjectMember(
  request: NextRequest,
  projectId: string
): Promise<NextResponse> {
  const supabase = await createClient();
  const service = new ProjectMemberService(supabase);

  const body = await request.json();
  const result = await service.addProjectMember({
    project_id: projectId,
    employee_id: body.employee_id,
    role: body.role || null,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.data, { status: 201 });
}

/**
 * DELETE /api/projects/[id]/members - Remove team member
 */
export async function handleRemoveProjectMember(
  request: NextRequest,
  projectId: string
): Promise<NextResponse> {
  const supabase = await createClient();
  const service = new ProjectMemberService(supabase);

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  if (!employeeId) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  const result = await service.removeProjectMember(projectId, employeeId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
