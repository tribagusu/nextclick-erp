/**
 * Auth Feature - API Handlers
 *
 * HTTP request handlers for authentication endpoints.
 */

import { createClient } from '@/shared/lib/supabase/server';
import { AuthService } from '../domain/services/auth.service';
import { loginSchema, signUpApiSchema, forgotPasswordSchema, resetPasswordSchema } from '../domain/schemas';
import {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  internalErrorResponse,
} from '@/shared/lib/api/api-utils';

/**
 * Handle sign in request
 */
export async function handleSignIn(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return validationErrorResponse(firstError.message);
    }

    const supabase = await createClient();
    const authService = new AuthService(supabase);
    const response = await authService.signIn(result.data);

    if (!response.success) {
      return unauthorizedResponse(response.error || 'Sign in failed');
    }

    return successResponse(response);
  } catch (error) {
    console.error('Sign in error:', error);
    return internalErrorResponse();
  }
}

/**
 * Handle sign up request
 */
export async function handleSignUp(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const result = signUpApiSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return validationErrorResponse(firstError.message);
    }

    const supabase = await createClient();
    const authService = new AuthService(supabase);
    const response = await authService.signUp({
      email: result.data.email,
      password: result.data.password,
      name: result.data.name,
    });

    if (!response.success) {
      return validationErrorResponse(response.error || 'Sign up failed');
    }

    return successResponse(response, undefined, 201);
  } catch (error) {
    console.error('Sign up error:', error);
    return internalErrorResponse();
  }
}

/**
 * Handle sign out request
 */
export async function handleSignOut() {
  try {
    const supabase = await createClient();
    const authService = new AuthService(supabase);
    await authService.signOut();

    return successResponse({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error);
    return internalErrorResponse();
  }
}

/**
 * Handle forgot password request
 */
export async function handleForgotPassword(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return validationErrorResponse(firstError.message);
    }

    const supabase = await createClient();
    const authService = new AuthService(supabase);
    const response = await authService.forgotPassword(result.data.email);

    if (!response.success) {
      return validationErrorResponse(response.error || 'Failed to send reset email');
    }

    return successResponse({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return internalErrorResponse();
  }
}

/**
 * Handle reset password request
 */
export async function handleResetPassword(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return validationErrorResponse(firstError.message);
    }

    const supabase = await createClient();
    const authService = new AuthService(supabase);
    const response = await authService.resetPassword(result.data.password);

    if (!response.success) {
      return validationErrorResponse(response.error || 'Failed to reset password');
    }

    return successResponse({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return internalErrorResponse();
  }
}

/**
 * Handle get current user request
 */
export async function handleGetCurrentUser() {
  try {
    const supabase = await createClient();
    const authService = new AuthService(supabase);
    const user = await authService.getCurrentUser();

    if (!user) {
      return unauthorizedResponse('Not authenticated');
    }

    return successResponse({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return internalErrorResponse();
  }
}
