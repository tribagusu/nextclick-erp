import { ApiHandler, ApiWrapper } from "@/shared/base-feature/api/api-utils";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { AppRouteHandlerRoutes } from "../../../../.next/types/routes";

/**
 * API Request Context Wrapper
 * 
 * Initializes the context for the request following instructions
 */
export function withRequestContext<TPath extends AppRouteHandlerRoutes>(): ApiWrapper<TPath> {
  return (apiHandler: ApiHandler<TPath>): ApiHandler<TPath> =>
    async (request: NextRequest, ctx: RouteContext<TPath>) => {
      return RequestContext.run(
        {},
        () => apiHandler(request, ctx)
      );
    };
}

export class RequestContext {
  private static als = new AsyncLocalStorage<RequestContextStore>();

  static run<T>(initialContext: RequestContextStore, fn: () => Promise<T>): Promise<T> {
    return this.als.run(initialContext, fn);
  }

  static get(): RequestContextStore {
    const store = this.als.getStore()
    if (!store) {
      throw new Error('RequestContext not initialized');
    }
    return store;
  }

  static set(context: RequestContextStore) {
    Object.assign(this.get(), context);
  }
};

export interface RequestContextStore {
  dbClient?: SupabaseClient;
  user?: User
}
