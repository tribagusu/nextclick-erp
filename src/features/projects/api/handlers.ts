/**
 * Projects API Handlers
 */

import { projectApiSchema } from '@/features/projects/domain/schemas';
import { ProjectRepository } from '@/features/projects/domain/services/project.repository';
import { ProjectListParams } from '@/features/projects/domain/types';
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
import type { ProjectPriority, ProjectStatus } from '@/shared/base-feature/domain/database.types';
import { uuidSchema } from '@/shared/base-feature/domain/schemas';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../../../../supabase/server';
import { ProjectService } from '../domain/services/project.service';


export const handleGetProjects = buildApiPipeline<'/api/projects'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (request, _routeCtx) => {
  const url = request.nextUrl
  const { dbClient } = RequestContext.get()
  const baseGetAllParams = new GetAllParams(url);
  const filterParams: ProjectListParams = {
    status: (url.searchParams.get('status') as ProjectStatus) ?? undefined,
    priority: (url.searchParams.get('priority') as ProjectPriority) ?? undefined,
    client_id: url.searchParams.get('clientId') ?? undefined,
    sortBy: (url.searchParams.get('sortBy') as 'project_name' | 'created_at') ?? 'created_at',
  };

  const service = await createProjectService(dbClient);
  const { data, ...paginationDetails } = await service.getProjects({ ...baseGetAllParams, ...filterParams });

  return successResponse(data, paginationDetails);
});

export const handleGetProject = buildApiPipeline<'/api/projects/[id]'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (request, routeCtx) => {
  const { dbClient } = RequestContext.get()
  const { id } = validateSchema(
    Resources.PROJECT,
    Actions.READ,
    await routeCtx.params,
    uuidSchema,
    ErrorCodes.INVALID_ROUTE_PARAM
  );

  const service = await createProjectService(dbClient);
  const project = await service.getProject(id);

  if (!project) throw new NotFoundError(Resources.PROJECT);

  return successResponse(project);
});

export const handleCreateProject = buildApiPipeline<'/api/projects'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (request) => {
  const { dbClient } = RequestContext.get()
  const input = validateSchema(
    Resources.PROJECT,
    Actions.CREATE,
    await request.json(),
    projectApiSchema,
  );

  let project = null;
  if (input) {
    const service = await createProjectService(dbClient);
    project = await service.create(input);
  }

  return successResponse(project, undefined, 201);

})

export const handleUpdateProject = buildApiPipeline<'/api/projects/[id]'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (request, routeCtx) => {
  const { dbClient } = RequestContext.get()
  const { id } = validateSchema(
    Resources.PROJECT,
    Actions.UPDATE,
    await routeCtx.params,
    uuidSchema,
    ErrorCodes.INVALID_ROUTE_PARAM
  );

  const input = validatePartialSchema(
    Resources.PROJECT,
    Actions.UPDATE,
    await request.json(),
    projectApiSchema,
  );

  let project = null;
  if (input) {
    const service = await createProjectService(dbClient);
    project = await service.update(id, input);
  }

  return successResponse(project);

})

export const handleDeleteProject = buildApiPipeline<'/api/projects/[id]'>(
  withRequestContext(),
  withErrorHandling(),
  withAuth()
)(async (_request, routeCtx) => {
  const { dbClient } = RequestContext.get()
  const { id } = validateSchema(
    Resources.PROJECT,
    Actions.DELETE,
    await routeCtx.params,
    uuidSchema,
    ErrorCodes.INVALID_ROUTE_PARAM
  );

  const service = await createProjectService(dbClient);
  await service.delete(id)

  return successResponse({ message: `${Resources.PROJECT} deleted successfully` });
});

async function createProjectService(dbClient: SupabaseClient | undefined) {
  return new ProjectService(new ProjectRepository(dbClient ?? await createClient()));
}
