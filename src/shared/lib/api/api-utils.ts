/**
 * API Response Utilities
 * 
 * Standardized API response format for consistency across all endpoints.
 */

import { NextResponse } from 'next/server';

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

/**
 * Handle database errors with appropriate status codes
 */
export function handleDatabaseError(error: unknown): NextResponse<ApiError> {
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
  
  // Generic database error
  return errorResponse(
    ErrorCodes.DATABASE_ERROR,
    'Database operation failed',
    500
  );
}
