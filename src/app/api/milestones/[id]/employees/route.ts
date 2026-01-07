/**
 * Milestone Employees API Route
 * /api/milestones/[id]/employees
 */

import { NextRequest } from 'next/server';
import {
  handleGetMilestoneEmployees,
  handleAddMilestoneEmployee,
  handleRemoveMilestoneEmployee,
} from '@/features/milestones/api/milestone-employees.handlers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetMilestoneEmployees(request, id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleAddMilestoneEmployee(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleRemoveMilestoneEmployee(request, id);
}
