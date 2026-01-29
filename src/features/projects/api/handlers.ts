/**
 * Projects API Handlers
 */

import { createClient } from '../../../../supabase/server';
import { ProjectService } from '../domain/services/project.service';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
} from '@/shared/base-feature/api/api-utils';
import type { ProjectStatus, ProjectPriority } from '@/shared/base-feature/domain/database.types';

export async function handleGetProjects(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const params = {
      page: parseInt(url.searchParams.get('page') ?? '1'),
      pageSize: parseInt(url.searchParams.get('pageSize') ?? '10'),
      search: url.searchParams.get('search') ?? undefined,
      status: (url.searchParams.get('status') as ProjectStatus) ?? undefined,
      priority: (url.searchParams.get('priority') as ProjectPriority) ?? undefined,
      clientId: url.searchParams.get('clientId') ?? undefined,
      sortBy: (url.searchParams.get('sortBy') as 'project_name' | 'created_at') ?? 'created_at',
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
    };

    const service = new ProjectService(supabase);
    const data = await service.getProjects(params);
    return successResponse(data);
  } catch (error) {
    console.error('Get projects error:', error);
    return internalErrorResponse();
  }
}

export async function handleGetProject(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const service = new ProjectService(supabase);
    const project = await service.getProject(id);

    if (!project) return notFoundResponse('Project');
    return successResponse(project);
  } catch (error) {
    console.error('Get project error:', error);
    return internalErrorResponse();
  }
}

export async function handleCreateProject(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const service = new ProjectService(supabase);
    const result = await service.createProject(body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to create project');
    }
    return successResponse(result.project, undefined, 201);
  } catch (error) {
    console.error('Create project error:', error);
    return internalErrorResponse();
  }
}

export async function handleUpdateProject(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const service = new ProjectService(supabase);
    const result = await service.updateProject(id, body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to update project');
    }
    return successResponse(result.project);
  } catch (error) {
    console.error('Update project error:', error);
    return internalErrorResponse();
  }
}

export async function handleDeleteProject(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const service = new ProjectService(supabase);
    const result = await service.deleteProject(id);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to delete project');
    }
    return successResponse({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return internalErrorResponse();
  }
}
