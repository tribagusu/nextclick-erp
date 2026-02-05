import { ApiHandler, AppError, ErrorCodes, errorResponse, forbiddenResponse, internalErrorResponse } from "@/shared/base-feature/api/api-utils";
import { NextRequest } from "next/server";
import { AppRouteHandlerRoutes } from "../../../../.next/types/routes";

/**
 * API Error Handling Wrapper
 * 
 * Global exception handler wrapper for API calls, standardize error responses
 */
export function withErrorHandling<TPath extends AppRouteHandlerRoutes>() {
  return (apiHandler: ApiHandler<TPath>): ApiHandler<TPath> =>
    async (request: NextRequest, ctx: RouteContext<TPath>) => {
      try {
        return await apiHandler(request, ctx);
      } catch (error) {
        return handleApiError(error);
      }
    };
}

export function handleApiError(error: unknown): Response {
  console.error(error);
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
