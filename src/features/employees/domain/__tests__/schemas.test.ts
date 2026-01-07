/**
 * Employee Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { employeeFormSchema, transformEmployeeInput, employeeStatusOptions } from '../schemas';

describe('Employee Schemas', () => {
  describe('employeeFormSchema', () => {
    it('should validate correct employee data', () => {
      const result = employeeFormSchema.safeParse({
        name: 'John Doe',
        email: 'john@company.com',
        position: 'Developer',
        department: 'Engineering',
        status: 'active',
        phone: '+1234567890',
        salary: '75000',
      });
      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const result = employeeFormSchema.safeParse({
        name: '',
        email: 'john@company.com',
      });
      expect(result.success).toBe(false);
    });

    it('should require name to be at least 2 characters', () => {
      const result = employeeFormSchema.safeParse({
        name: 'J',
        email: 'john@company.com',
      });
      expect(result.success).toBe(false);
    });

    it('should accept empty email', () => {
      const result = employeeFormSchema.safeParse({
        name: 'John Doe',
        email: '',
      });
      expect(result.success).toBe(true);
    });

    it('should validate status options', () => {
      employeeStatusOptions.forEach((status) => {
        const result = employeeFormSchema.safeParse({
          name: 'John Doe',
          email: 'john@company.com',
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const result = employeeFormSchema.safeParse({
        name: 'John Doe',
        email: 'john@company.com',
        status: 'invalid_status',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('transformEmployeeInput', () => {
    it('should transform salary string to number', () => {
      const result = transformEmployeeInput({
        name: 'John Doe',
        email: 'john@company.com',
        salary: '75000',
        status: 'active',
      });
      expect(result.salary).toBe(75000);
    });

    it('should default salary to null for empty string', () => {
      const result = transformEmployeeInput({
        name: 'John Doe',
        email: 'john@company.com',
        salary: '',
        status: 'active',
      });
      expect(result.salary).toBeNull();
    });

    it('should transform empty optional fields to null', () => {
      const result = transformEmployeeInput({
        name: 'John Doe',
        email: 'john@company.com',
        phone: '',
        position: '',
        department: '',
        status: 'active',
      });
      expect(result.phone).toBeNull();
      expect(result.position).toBeNull();
      expect(result.department).toBeNull();
    });

    it('should include status from input', () => {
      const result = transformEmployeeInput({
        name: 'John Doe',
        email: 'john@company.com',
        status: 'inactive',
      });
      expect(result.status).toBe('inactive');
    });
  });
});
