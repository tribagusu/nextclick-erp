/**
 * Settings Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { profileUpdateSchema, passwordChangeSchema } from '../schemas';

describe('Settings Schemas', () => {
  describe('profileUpdateSchema', () => {
    it('should validate correct profile data', () => {
      const result = profileUpdateSchema.safeParse({
        name: 'John Doe',
        email: 'john@company.com',
        phone: '+1234567890',
      });
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const result = profileUpdateSchema.safeParse({
        name: '',
        email: 'john@company.com',
      });
      expect(result.success).toBe(false);
    });

    it('should require name to be at least 2 characters', () => {
      const result = profileUpdateSchema.safeParse({
        name: 'J',
        email: 'john@company.com',
      });
      expect(result.success).toBe(false);
    });

    it('should accept empty email', () => {
      const result = profileUpdateSchema.safeParse({
        name: 'John Doe',
        email: '',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty phone', () => {
      const result = profileUpdateSchema.safeParse({
        name: 'John Doe',
        phone: '',
      });
      expect(result.success).toBe(true);
    });

    it('should validate email format when provided', () => {
      const result = profileUpdateSchema.safeParse({
        name: 'John Doe',
        email: 'invalid-email',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid email format', () => {
      const result = profileUpdateSchema.safeParse({
        name: 'John Doe',
        email: 'valid@email.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('passwordChangeSchema', () => {
    it('should validate correct password change data', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldPassword123',
        newPassword: 'NewSecure456',
        confirmPassword: 'NewSecure456',
      });
      expect(result.success).toBe(true);
    });

    it('should require current password', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: '',
        newPassword: 'NewSecure456',
        confirmPassword: 'NewSecure456',
      });
      expect(result.success).toBe(false);
    });

    it('should require new password to be at least 8 characters', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldPassword123',
        newPassword: 'Short1',
        confirmPassword: 'Short1',
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldPassword123',
        newPassword: 'NewSecure456',
        confirmPassword: 'Different789',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match");
      }
    });

    it('should accept matching passwords', () => {
      const result = passwordChangeSchema.safeParse({
        currentPassword: 'OldPassword123',
        newPassword: 'MatchingNew123',
        confirmPassword: 'MatchingNew123',
      });
      expect(result.success).toBe(true);
    });

    it('should require all fields', () => {
      const result = passwordChangeSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
