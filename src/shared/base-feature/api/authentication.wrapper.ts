import { ApiHandler, ApiWrapper, UnauthorizedError } from "@/shared/base-feature/api/api-utils";
import { RequestContext } from "@/shared/base-feature/api/request-context.wrapper";
import { NextRequest } from "next/server";
import { createClient } from "../../../../supabase/server";
import { AppRouteHandlerRoutes } from "../../../../.next/types/routes";

/**
 * API Authentication Wrapper
 * 
 * Authentication validation for API calls
 */
export function withAuth<TPath extends AppRouteHandlerRoutes>(): ApiWrapper<TPath> {
  return (apiHandler: ApiHandler<TPath>): ApiHandler<TPath> =>
    async (request: NextRequest, ctx: RouteContext<TPath>) => {
      const dbClient = await createClient();
      const { data: { user } } = await dbClient.auth.getUser();

      if (!user) throw new UnauthorizedError;

      RequestContext.set({ dbClient, user })

      return await apiHandler(request, ctx);
    };
}