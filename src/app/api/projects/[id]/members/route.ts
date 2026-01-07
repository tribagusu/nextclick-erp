/**
 * Project Members API Route
 * /api/projects/[id]/members
 */

import { NextRequest } from 'next/server';
import {
  handleGetProjectMembers,
  handleAddProjectMember,
  handleRemoveProjectMember,
} from '@/features/project-members/api/handlers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetProjectMembers(request, id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleAddProjectMember(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleRemoveProjectMember(request, id);
}
