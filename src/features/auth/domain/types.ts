/**
 * Auth Feature - Domain Types
 *
 * Type definitions for authentication operations.
 */

import type { User, UserRole } from '@/shared/types/database.types';

// =============================================================================
// AUTH STATE
// =============================================================================

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

// =============================================================================
// AUTH CONTEXT
// =============================================================================

export interface AuthContextValue extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signUp: (data: RegisterData) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
