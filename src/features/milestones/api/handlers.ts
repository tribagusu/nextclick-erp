/**
 * Milestones API Handlers
 */

import { createClient } from '@/shared/lib/supabase/server';
import { MilestoneService } from '../domain/services/milestone.service';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
} from '@/shared/lib/api/api-utils';
import type { MilestoneStatus } from '@/shared/types/database.types';

export async function handleGetMilestones(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const params = {
      page: parseInt(url.searchParams.get('page') ?? '1'),
      pageSize: parseInt(url.searchParams.get('pageSize') ?? '10'),
      search: url.searchParams.get('search') ?? undefined,
      status: (url.searchParams.get('status') as MilestoneStatus) ?? undefined,
      projectId: url.searchParams.get('projectId') ?? undefined,
      sortBy: (url.searchParams.get('sortBy') as 'milestone' | 'due_date') ?? 'due_date',
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
    };

    const service = new MilestoneService(supabase);
    const data = await service.getMilestones(params);
    return successResponse(data);
  } catch (error) {
    console.error('Get milestones error:', error);
    return internalErrorResponse();
  }
}

export async function handleGetMilestone(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const service = new MilestoneService(supabase);
    const milestone = await service.getMilestone(id);

    if (!milestone) return notFoundResponse('Milestone');
    return successResponse(milestone);
  } catch (error) {
    console.error('Get milestone error:', error);
    return internalErrorResponse();
  }
}

export async function handleCreateMilestone(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const service = new MilestoneService(supabase);
    const result = await service.createMilestone(body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to create milestone');
    }
    return successResponse(result.milestone, undefined, 201);
  } catch (error) {
    console.error('Create milestone error:', error);
    return internalErrorResponse();
  }
}

export async function handleUpdateMilestone(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const service = new MilestoneService(supabase);
    const result = await service.updateMilestone(id, body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to update milestone');
    }
    return successResponse(result.milestone);
  } catch (error) {
    console.error('Update milestone error:', error);
    return internalErrorResponse();
  }
}

export async function handleDeleteMilestone(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const service = new MilestoneService(supabase);
    const result = await service.deleteMilestone(id);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to delete milestone');
    }
    return successResponse({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Delete milestone error:', error);
    return internalErrorResponse();
  }
}
