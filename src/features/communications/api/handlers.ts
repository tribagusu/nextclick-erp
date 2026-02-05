/**
 * Communications API Handlers
 */

import { CommunicationRepository } from '@/features/communications/domain/services/communication.repository';
import { CommunicationListParams } from '@/features/communications/domain/types';
import { Actions, Resources } from '@/shared/app.constants';
import {
  buildApiPipeline,
  ErrorCodes,
  NotFoundError,
  successResponse,
  validatePartialSchema,
  validateSchema
} from '@/shared/base-feature/api/api-utils';
import { withAuth } from '@/shared/base-feature/api/authentication.wrapper';
import { withErrorHandling } from '@/shared/base-feature/api/error-handling.wrapper';
import { RequestContext, withRequestContext } from '@/shared/base-feature/api/request-context.wrapper';
import { GetAllParams } from '@/shared/base-feature/domain/base.types';
import type { CommunicationLog, CommunicationMode } from '@/shared/base-feature/domain/database.types';
import { uuidSchema } from '@/shared/base-feature/domain/schemas';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../../../../supabase/server';
import { communicationApiSchema } from '../domain/schemas';
import { CommunicationService } from '../domain/services/communication.service';

export const handleGetCommunications = buildApiPipeline<'/api/communications'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (request, _routeCtx) => {
  const url = request.nextUrl
  const { dbClient } = RequestContext.get()
  const baseGetAllParams = new GetAllParams(url);
  const filterParams: CommunicationListParams = {
    mode: (url.searchParams.get('mode') as CommunicationMode) ?? undefined,
    client_id: url.searchParams.get('clientId') ?? undefined,
    project_id: url.searchParams.get('projectId') ?? undefined,
    follow_up_required: url.searchParams.get('followUpRequired') === 'true' ? true : undefined,
    sortBy: (url.searchParams.get('sortBy') as keyof CommunicationLog) ?? 'date',
  };

  const service = await createCommunicationService(dbClient);
  const { data, ...paginationDetails } = await service.getCommunications({ ...baseGetAllParams, ...filterParams });

  return successResponse(data, paginationDetails);
});

export const handleGetCommunication = buildApiPipeline<'/api/communications/[id]'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (_request, routeCtx) => {
  const { dbClient } = RequestContext.get()
  const { id } = validateSchema(
    Resources.COMMUNICATION_LOG,
    Actions.READ,
    await routeCtx.params,
    uuidSchema,
    ErrorCodes.INVALID_ROUTE_PARAM
  );

  const service = await createCommunicationService(dbClient);
  const communication = await service.getCommunication(id);

  if (!communication) throw new NotFoundError(Resources.COMMUNICATION_LOG);

  return successResponse(communication);
});

export const handleCreateCommunication = buildApiPipeline<'/api/communications'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (request) => {
  const { dbClient } = RequestContext.get()
  const input = validateSchema(
    Resources.COMMUNICATION_LOG,
    Actions.CREATE,
    await request.json(),
    communicationApiSchema,
  );

  let communication = null;
  if (input) {
    const service = await createCommunicationService(dbClient);
    communication = await service.create(input);
  }

  return successResponse(communication, undefined, 201);

})

export const handleUpdateCommunication = buildApiPipeline<'/api/communications/[id]'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (request, routeCtx) => {
  const { dbClient } = RequestContext.get()
  const { id } = validateSchema(
    Resources.COMMUNICATION_LOG,
    Actions.UPDATE,
    await routeCtx.params,
    uuidSchema,
    ErrorCodes.INVALID_ROUTE_PARAM
  );

  const input = validatePartialSchema(
    Resources.COMMUNICATION_LOG,
    Actions.UPDATE,
    await request.json(),
    communicationApiSchema,
  );

  let communication = null;
  if (input) {
    const service = await createCommunicationService(dbClient);
    communication = await service.update(id, input);
  }

  return successResponse(communication);

})

export const handleDeleteCommunication = buildApiPipeline<'/api/communications/[id]'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (_request, routeCtx) => {
  const { dbClient } = RequestContext.get()
  const { id } = validateSchema(
    Resources.COMMUNICATION_LOG,
    Actions.DELETE,
    await routeCtx.params,
    uuidSchema,
    ErrorCodes.INVALID_ROUTE_PARAM
  );

  const service = await createCommunicationService(dbClient);
  await service.delete(id)

  return successResponse({ message: `${Resources.COMMUNICATION_LOG} deleted successfully` });
});

async function createCommunicationService(dbClient: SupabaseClient | undefined) {
  return new CommunicationService(new CommunicationRepository(dbClient ?? await createClient()));
}