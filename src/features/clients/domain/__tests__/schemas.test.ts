/**
 * Client Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { clientSchema, transformClientInput } from '../schemas';

describe('Client Schema', () => {
  describe('clientSchema validation', () => {
    it('should validate correct client data', () => {
      const result = clientSchema.safeParse({
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1234567890',
        address: '123 Main Street',
        notes: 'Important client',
      });
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const result = clientSchema.safeParse({
        name: '',
        email: 'contact@acme.com',
      });
      expect(result.success).toBe(false);
    });

    it('should require name to be at least 2 characters', () => {
      const result = clientSchema.safeParse({
        name: 'A',
        email: 'contact@acme.com',
      });
      expect(result.success).toBe(false);
    });

    it('should accept empty email', () => {
      const result = clientSchema.safeParse({
        name: 'Acme Corporation',
        email: '',
      });
      expect(result.success).toBe(true);
    });

    it('should allow optional fields to be empty', () => {
      const result = clientSchema.safeParse({
        name: 'Acme Corporation',
        email: '',
        phone: '',
        address: '',
        notes: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('transformClientInput', () => {
    it('should transform empty strings to null', () => {
      const result = transformClientInput({
        name: 'Acme Corporation',
        email: '',
        phone: '',
        address: '',
        notes: '',
      });
      expect(result.name).toBe('Acme Corporation');
      expect(result.email).toBeNull();
      expect(result.phone).toBeNull();
      expect(result.address).toBeNull();
      expect(result.notes).toBeNull();
    });

    it('should preserve non-empty values', () => {
      const result = transformClientInput({
        name: 'Acme Corporation',
        email: 'test@acme.com',
        phone: '+1234567890',
        address: '123 Main St',
        notes: 'VIP client',
      });
      expect(result.email).toBe('test@acme.com');
      expect(result.phone).toBe('+1234567890');
      expect(result.address).toBe('123 Main St');
      expect(result.notes).toBe('VIP client');
    });
  });
});
