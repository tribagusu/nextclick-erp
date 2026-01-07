/**
 * Supabase Middleware Client
 * 
 * Used in Next.js middleware for session management
 * and request/response cookie handling.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/shared/types/database.types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public auth routes that don't require authentication
  const publicAuthRoutes = [
    '/signin',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/auth',
  ];
  
  const isPublicAuthRoute = publicAuthRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Protected routes - redirect to signin if not authenticated
  if (!user && !isPublicAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    return NextResponse.redirect(url);
  }

  // If logged in and trying to access auth pages (except reset-password), redirect to dashboard
  if (user && (
    request.nextUrl.pathname.startsWith('/signin') || 
    request.nextUrl.pathname.startsWith('/signup')
  )) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
