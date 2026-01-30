/**
 * Common handler functions that allows code reuse
 */

import { Actions } from '@/shared/app.constants';
import { AppError, ErrorCodes, errorResponse, forbiddenResponse, internalErrorResponse, UnauthorizedError, ValidationError } from '@/shared/base-feature/api/api-utils';
import { GetAllParams } from '@/shared/base-feature/domain/base.types';
import { uuidSchema } from '@/shared/base-feature/domain/schemas';
import { ZodError, ZodObject } from 'zod';
import { createClient } from '../../../../supabase/server';
import { $ZodIssue } from 'zod/v4/core';

export async function handleGetAll(request: Request) {
  const dbClient = await validateAuthentication();
  const baseGetAllParams = new GetAllParams(request.url);
  return { dbClient, baseGetAllParams }
}

export async function handleGet(request: Request, resource: string, id: string) {
  const dbClient = await validateAuthentication();
  const input = uuidSchema.safeParse({ id });
  if (!input.success) {
    throw new ValidationError(resource, Actions.READ, input.error)
  }
  return { dbClient, input: input.data.id }
}

export async function handleCreate(request: Request, resource: string, validationSchema: ZodObject) {
  const dbClient = await validateAuthentication();
  const input = validationSchema.safeParse(await request.json());
  if (!input.success) {
    throw new ValidationError(resource, Actions.CREATE, input.error)
  }
  return { dbClient, input: input.data }
}

export async function handleUpdate(request: Request, id: string, resource: string, validationSchema: ZodObject) {
  const dbClient = await validateAuthentication();
  const idParam = uuidSchema.safeParse({ id });
  const input = validationSchema.partial().safeParse(await request.json());

  const error: $ZodIssue[] = [];
  if (!idParam.success) {
    error.push(...idParam.error.issues)
  }
  if (!input.success) {
    error.push(...input.error.issues)
  }
  if (error.length > 0) {
    throw new ValidationError(resource, Actions.UPDATE, new ZodError(error))
  }
  return { dbClient, input: input.data }
}

export async function handleDelete(request: Request, resource: string, id: string) {
  const dbClient = await validateAuthentication();
  const input = uuidSchema.safeParse({ id });
  if (!input.success) {
    throw new ValidationError(resource, Actions.DELETE, input.error)
  }
  return { dbClient, input: input.data.id }
}

async function validateAuthentication() {
  const dbClient = await createClient();
  const { data: { user } } = await dbClient.auth.getUser();
  if (!user) throw new UnauthorizedError;
  return dbClient;
}

// =============================================================================
// Global Exception Handler
// =============================================================================
export function handleApiError(error: unknown, resource: string, action: string): Response {
  console.error(`${action} ${resource} error:`, error);
  let response = null;
  if (error instanceof AppError) {
    response = error.getErrorResponse();
  } else {
    response = handleDatabaseError(error);
  }
  return response ? response : internalErrorResponse();
}

/**
 * Handle database errors with appropriate status codes
 */
function handleDatabaseError(error: unknown) {
  console.error('[Database Error]', error);

  const err = error as { code?: string; message?: string };

  // Foreign key violation
  if (err.code === '23503') {
    return errorResponse(
      ErrorCodes.CONFLICT,
      'Referenced record does not exist',
      409
    );
  }

  // Unique constraint violation
  if (err.code === '23505') {
    return errorResponse(
      ErrorCodes.CONFLICT,
      'Record already exists',
      409
    );
  }

  // RLS policy violation
  if (err.code === '42501') {
    return forbiddenResponse();
  }

  return null;
}