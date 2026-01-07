/**
 * Auth Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas';

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct credentials', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty fields', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct signup data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'newuser@example.com',
        password: 'Secure123',
        confirmPassword: 'Secure123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'newuser@example.com',
        password: 'Secure123',
        confirmPassword: 'Different123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short passwords', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'newuser@example.com',
        password: '12345',
        confirmPassword: '12345',
      });
      expect(result.success).toBe(false);
    });

    it('should require name', () => {
      const result = registerSchema.safeParse({
        name: '',
        email: 'newuser@example.com',
        password: 'Secure123',
        confirmPassword: 'Secure123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'forgot@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate matching passwords with requirements', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewSecure123',
        confirmPassword: 'NewSecure123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NewSecure123',
        confirmPassword: 'Different123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject passwords without uppercase', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'newsecure123',
        confirmPassword: 'newsecure123',
      });
      expect(result.success).toBe(false);
    });
  });
});
