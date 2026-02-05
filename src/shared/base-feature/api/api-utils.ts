/**
 * API Response Utilities
 * 
 * Standardized API response format for consistency across all endpoints.
 */

import { NextRequest, NextResponse } from 'next/server';
import z, { ZodError, ZodObject } from 'zod';
import { AppRouteHandlerRoutes } from '../../../../.next/types/routes';

// =============================================================================
// TYPES
// =============================================================================

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type ApiWrapper<TPath extends AppRouteHandlerRoutes> = (handler: ApiHandler<TPath>) => ApiHandler<TPath>;
export type ApiHandler<TPath extends AppRouteHandlerRoutes> = (request: NextRequest, ctx: RouteContext<TPath>) => Promise<Response>;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function buildApiPipeline<TPath extends AppRouteHandlerRoutes>(...wrappers: ApiWrapper<TPath>[]) {
  return function (
    handler: ApiHandler<TPath>
  ): ApiHandler<TPath> {
    return wrappers.reduceRight(
      (acc, wrapper) => wrapper(acc),
      handler
    );
  };
}

export function validateSchema<T extends ZodObject>(
  resource: string,
  action: string,
  params: Record<string, unknown>,
  validationSchema: T,
  errorCode: ErrorCode = ErrorCodes.VALIDATION_ERROR,
): z.infer<T> {
  const result = validationSchema.safeParse(params);
  if (!result.success) {
    throw new ValidationError(resource, action, result.error, errorCode);
  }
  return result.data;
}

export function validatePartialSchema(
  resource: string,
  action: string,
  params: Record<string, unknown>,
  validationSchema: ZodObject,
  errorCode: ErrorCode = ErrorCodes.VALIDATION_ERROR,
) {
  const result = validationSchema.partial().safeParse(params);
  if (!result.success) {
    throw new ValidationError(resource, action, result.error, errorCode);
  }
  return result.data;
}

// =============================================================================
// ERROR CODES
// =============================================================================

export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_ROUTE_PARAM: 'INVALID_ROUTE_PARAM',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  meta?: ApiSuccess<T>['meta'],
  status = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json<ApiSuccess<T>>(
    { success: true, data, meta },
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json<ApiError>(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

// =============================================================================
// COMMON ERRORS
// =============================================================================

export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  constructor(message: string) {
    super(message);
  }
  abstract getErrorResponse(): NextResponse<ApiError>;
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  constructor(resource: string, action: string, readonly error: ZodError, readonly errorCode: ErrorCode = ErrorCodes.VALIDATION_ERROR) {
    super(`Failed to ${action} ${resource}`);

  }
  getErrorResponse() {
    return errorResponse(this.errorCode, this.message, this.statusCode, this.formatZodError(this.error));
  }
  private formatZodError(error: ZodError) {
    return error.issues.reduce<Record<string, string>>((result, issue) => {
      const field = issue.path.join('.');
      result[field] = issue.message;
      return result;
    }, {});
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  constructor(message = 'Authentication required') {
    super(message);
  }
  getErrorResponse() {
    return errorResponse(ErrorCodes.UNAUTHORIZED, this.message, this.statusCode);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  constructor(resource: string) {
    super(`${resource} not found`);
  }
  getErrorResponse() {
    return errorResponse(ErrorCodes.NOT_FOUND, this.message, this.statusCode);
  }
}

// =============================================================================
// COMMON ERROR RESPONSES
// =============================================================================

export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(ErrorCodes.UNAUTHORIZED, message, 401);
}

export function forbiddenResponse(message = 'Permission denied') {
  return errorResponse(ErrorCodes.FORBIDDEN, message, 403);
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(ErrorCodes.NOT_FOUND, `${resource} not found`, 404);
}

export function validationErrorResponse(message: string, details?: unknown) {
  return errorResponse(ErrorCodes.VALIDATION_ERROR, message, 400, details);
}

export function conflictResponse(message: string) {
  return errorResponse(ErrorCodes.CONFLICT, message, 409);
}

export function internalErrorResponse(message = 'An unexpected error occurred') {
  return errorResponse(ErrorCodes.INTERNAL_ERROR, message, 500);
}