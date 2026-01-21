/**
 * Next.js Proxy (it was Middleware)
 * 
 * Handles authentication and route protection.
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '../supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, icons, etc)
     * - api/auth routes (for OAuth callbacks)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth).*)',
  ],
};
