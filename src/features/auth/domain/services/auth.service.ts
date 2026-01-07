/**
 * Auth Service
 *
 * Server-side authentication operations using Supabase Auth.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, User } from '@/shared/types/database.types';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '../types';

export class AuthService {
  private client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Fetch the user profile from our users table
    const { data: userProfile, error: profileError } = await this.client
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return {
        success: false,
        error: 'Failed to fetch user profile',
      };
    }

    return {
      success: true,
      user: userProfile as User,
      message: 'Signed in successfully',
    };
  }

  /**
   * Sign up a new user
   */
  async signUp(data: RegisterData): Promise<AuthResponse> {
    // Create the auth user
    const { data: authData, error: authError } = await this.client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user',
      };
    }

    // The user profile should be created automatically by DB trigger
    // But we'll fetch it to confirm and return
    const { data: userProfile, error: profileError } = await this.client
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      // User might need email confirmation first
      return {
        success: true,
        message: 'Please check your email to confirm your account',
      };
    }

    return {
      success: true,
      user: userProfile as User,
      message: 'Account created successfully',
    };
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Password reset email sent',
    };
  }

  /**
   * Reset password with new password
   */
  async resetPassword(newPassword: string): Promise<AuthResponse> {
    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await this.client.auth.getUser();

    if (!authUser) {
      return null;
    }

    const { data: userProfile } = await this.client
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return userProfile as User | null;
  }

  /**
   * Get the current session
   */
  async getSession() {
    const { data: { session } } = await this.client.auth.getSession();
    return session;
  }
}
