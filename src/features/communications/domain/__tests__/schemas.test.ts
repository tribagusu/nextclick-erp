/**
 * Communication Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { communicationFormSchema, communicationModeOptions } from '../schemas';

describe('Communication Schemas', () => {
  describe('communicationFormSchema', () => {
    it('should validate correct communication data', () => {
      const result = communicationFormSchema.safeParse({
        client_id: 'client-uuid',
        date: '2024-01-15',
        mode: 'email',
        summary: 'Discussed project requirements and timeline',
        follow_up_required: true,
        follow_up_date: '2024-01-22',
      });
      expect(result.success).toBe(true);
    });

    it('should require client_id', () => {
      const result = communicationFormSchema.safeParse({
        client_id: '',
        date: '2024-01-15',
        mode: 'email',
        summary: 'Test summary content here',
      });
      expect(result.success).toBe(false);
    });

    it('should require date', () => {
      const result = communicationFormSchema.safeParse({
        client_id: 'client-uuid',
        date: '',
        mode: 'email',
        summary: 'Test summary content here',
      });
      expect(result.success).toBe(false);
    });

    it('should require summary', () => {
      const result = communicationFormSchema.safeParse({
        client_id: 'client-uuid',
        date: '2024-01-15',
        mode: 'email',
        summary: '',
      });
      expect(result.success).toBe(false);
    });

    it('should require summary to be at least 10 characters', () => {
      const result = communicationFormSchema.safeParse({
        client_id: 'client-uuid',
        date: '2024-01-15',
        mode: 'email',
        summary: 'Short',
      });
      expect(result.success).toBe(false);
    });

    it('should validate all mode options', () => {
      communicationModeOptions.forEach((mode) => {
        const result = communicationFormSchema.safeParse({
          client_id: 'client-uuid',
          date: '2024-01-15',
          mode,
          summary: 'Test summary content here',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid mode', () => {
      const result = communicationFormSchema.safeParse({
        client_id: 'client-uuid',
        date: '2024-01-15',
        mode: 'invalid_mode',
        summary: 'Test summary content here',
      });
      expect(result.success).toBe(false);
    });
  });
});
