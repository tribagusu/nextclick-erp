/**
 * Communications API Handlers
 */

import { createClient } from '../../../../supabase/server';
import { CommunicationService } from '../domain/services/communication.service';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  internalErrorResponse,
} from '@/shared/lib/api/api-utils';
import type { CommunicationMode } from '@/shared/types/database.types';

export async function handleGetCommunications(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const url = new URL(request.url);
    const params = {
      page: parseInt(url.searchParams.get('page') ?? '1'),
      pageSize: parseInt(url.searchParams.get('pageSize') ?? '10'),
      search: url.searchParams.get('search') ?? undefined,
      mode: (url.searchParams.get('mode') as CommunicationMode) ?? undefined,
      clientId: url.searchParams.get('clientId') ?? undefined,
      projectId: url.searchParams.get('projectId') ?? undefined,
      followUpRequired: url.searchParams.get('followUpRequired') === 'true' ? true : undefined,
      sortBy: (url.searchParams.get('sortBy') as 'date' | 'created_at') ?? 'date',
      sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
    };

    const service = new CommunicationService(supabase);
    const data = await service.getCommunications(params);
    return successResponse(data);
  } catch (error) {
    console.error('Get communications error:', error);
    return internalErrorResponse();
  }
}

export async function handleGetCommunication(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const service = new CommunicationService(supabase);
    const communication = await service.getCommunication(id);

    if (!communication) return notFoundResponse('Communication log');
    return successResponse(communication);
  } catch (error) {
    console.error('Get communication error:', error);
    return internalErrorResponse();
  }
}

export async function handleCreateCommunication(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const service = new CommunicationService(supabase);
    const result = await service.createCommunication(body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to create communication log');
    }
    return successResponse(result.communication, undefined, 201);
  } catch (error) {
    console.error('Create communication error:', error);
    return internalErrorResponse();
  }
}

export async function handleUpdateCommunication(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();
    const service = new CommunicationService(supabase);
    const result = await service.updateCommunication(id, body);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to update communication log');
    }
    return successResponse(result.communication);
  } catch (error) {
    console.error('Update communication error:', error);
    return internalErrorResponse();
  }
}

export async function handleDeleteCommunication(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const service = new CommunicationService(supabase);
    const result = await service.deleteCommunication(id);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to delete communication log');
    }
    return successResponse({ message: 'Communication log deleted successfully' });
  } catch (error) {
    console.error('Delete communication error:', error);
    return internalErrorResponse();
  }
}
