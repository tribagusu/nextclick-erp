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
  validationErrorResponse,
  unauthorizedResponse,
  internalErrorResponse,
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
  const result = await service.getProjects({ ...baseGetAllParams, ...filterParams });

  return successResponse(result);
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

/**
 * Bulk import projects from CSV data.
 * Resolves client_name → client_id using case-insensitive lookup.
 */
export async function handleImportProjects(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const rows = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return validationErrorResponse('No rows provided for import');
    }

    if (rows.length > 500) {
      return validationErrorResponse('Maximum 500 rows per import');
    }

    // Fetch all active clients for name → id resolution
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name')
      .is('deleted_at', null);

    if (clientsError) {
      console.error('Failed to fetch clients for import:', clientsError);
      return internalErrorResponse();
    }

    // Build case-insensitive name → id map
    const clientMap = new Map<string, string>();
    for (const c of (clients ?? []) as { id: string; name: string }[]) {
      clientMap.set(c.name.toLowerCase(), c.id);
    }

    // Resolve client_name → client_id for each row
    const resolvedRows = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const clientName = row.client_name?.trim();
      if (!clientName) {
        return validationErrorResponse(`Row ${i + 1}: Client name is required`);
      }

      const clientId = clientMap.get(clientName.toLowerCase());
      if (!clientId) {
        return validationErrorResponse(`Row ${i + 1}: Client "${clientName}" not found`);
      }

      // Replace client_name with client_id
      const { client_name: _, ...rest } = row;
      resolvedRows.push({ ...rest, client_id: clientId });
    }

    const service = new ProjectService(new ProjectRepository(supabase));
    const result = await service.importProjects(resolvedRows);

    if (!result.success) {
      return validationErrorResponse(result.error || 'Failed to import projects');
    }

    return successResponse({ imported: result.imported }, undefined, 201);
  } catch (error) {
    console.error('Import projects error:', error);
    return internalErrorResponse();
  }
}

async function createProjectService(dbClient: SupabaseClient | undefined) {
  return new ProjectService(new ProjectRepository(dbClient ?? await createClient()));
}
