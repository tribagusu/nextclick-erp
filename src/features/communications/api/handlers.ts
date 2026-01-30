/**
 * Communications API Handlers
 */

import { CommunicationRepository } from '@/features/communications/domain/services/communication.repository';
import { CommunicationListParams } from '@/features/communications/domain/types';
import { Actions, Resources } from '@/shared/app.constants';
import {
  NotFoundError,
  successResponse
} from '@/shared/base-feature/api/api-utils';
import { handleApiError, handleCreate, handleDelete, handleGet, handleGetAll, handleUpdate } from '@/shared/base-feature/api/base.handlers';
import type { CommunicationLog, CommunicationMode } from '@/shared/base-feature/domain/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { communicationApiSchema } from '../domain/schemas';
import { CommunicationService } from '../domain/services/communication.service';

export async function handleGetCommunications(request: Request) {
  try {
    const { dbClient, baseGetAllParams } = await handleGetAll(request);

    const url = new URL(request.url);
    const filterParams: CommunicationListParams = {
      mode: (url.searchParams.get('mode') as CommunicationMode) ?? undefined,
      client_id: url.searchParams.get('clientId') ?? undefined,
      project_id: url.searchParams.get('projectId') ?? undefined,
      follow_up_required: url.searchParams.get('followUpRequired') === 'true' ? true : undefined,
      sortBy: (url.searchParams.get('sortBy') as keyof CommunicationLog) ?? 'date',
    };

    const service = createCommunicationService(dbClient);
    const { data, ...paginationDetails} = await service.getCommunications({ ...baseGetAllParams, ...filterParams });

    return successResponse<CommunicationLog[]>(data, paginationDetails);
  } catch (error) {
    return handleApiError(error, Resources.COMMUNICATION_LOG, Actions.READ);
  }
}

export async function handleGetCommunication(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dbClient, input } = await handleGet(request, Resources.COMMUNICATION_LOG, id);

    const service = createCommunicationService(dbClient);
    const communication = await service.getCommunication(input);

    if (!communication) throw new NotFoundError(Resources.COMMUNICATION_LOG);

    return successResponse(communication);
  } catch (error) {
    return handleApiError(error, Resources.COMMUNICATION_LOG, Actions.READ);
  }
}

export async function handleCreateCommunication(request: Request) {
  try {
    const { dbClient, input } = await handleCreate(request, Resources.COMMUNICATION_LOG, communicationApiSchema);

    const service = createCommunicationService(dbClient);
    const communication = await service.create(input);

    return successResponse(communication, undefined, 201);
  } catch (error) {
    return handleApiError(error, Resources.COMMUNICATION_LOG, Actions.CREATE);
  }
}

export async function handleUpdateCommunication(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dbClient, input } = await handleUpdate(request, id, Resources.COMMUNICATION_LOG, communicationApiSchema);

    let communication = null;
    if (input) {
      const service = createCommunicationService(dbClient);
      communication = await service.update(id, input);
    }

    return successResponse(communication);
  } catch (error) {
    return handleApiError(error, Resources.COMMUNICATION_LOG, Actions.UPDATE);
  }
}

export async function handleDeleteCommunication(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { dbClient, input } = await handleDelete(request, Resources.COMMUNICATION_LOG, id);

    const service = createCommunicationService(dbClient);
    await service.delete(input)

    return successResponse({ message: `${Resources.COMMUNICATION_LOG} deleted successfully` });
  } catch (error) {
    return handleApiError(error, Resources.COMMUNICATION_LOG, Actions.DELETE);
  }
}

function createCommunicationService(dbClient: SupabaseClient) {
  return new CommunicationService(new CommunicationRepository(dbClient));
}