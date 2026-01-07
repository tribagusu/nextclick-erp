/**
 * Project Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { projectFormSchema, transformProjectInput, projectStatusOptions, projectPriorityOptions } from '../schemas';

describe('Project Schemas', () => {
  describe('projectFormSchema', () => {
    it('should validate correct project data', () => {
      const result = projectFormSchema.safeParse({
        project_name: 'Website Redesign',
        client_id: 'client-uuid',
        description: 'Complete website overhaul',
        status: 'active',
        priority: 'high',
        total_budget: '50000',
        amount_paid: '25000',
      });
      expect(result.success).toBe(true);
    });

    it('should require project name', () => {
      const result = projectFormSchema.safeParse({
        project_name: '',
        client_id: 'client-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should require client_id', () => {
      const result = projectFormSchema.safeParse({
        project_name: 'Website Redesign',
        client_id: '',
      });
      expect(result.success).toBe(false);
    });

    it('should validate all status options', () => {
      projectStatusOptions.forEach((status) => {
        const result = projectFormSchema.safeParse({
          project_name: 'Test Project',
          client_id: 'client-uuid',
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should validate all priority options', () => {
      projectPriorityOptions.forEach((priority) => {
        const result = projectFormSchema.safeParse({
          project_name: 'Test Project',
          client_id: 'client-uuid',
          priority,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const result = projectFormSchema.safeParse({
        project_name: 'Test Project',
        client_id: 'client-uuid',
        status: 'invalid_status',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid priority', () => {
      const result = projectFormSchema.safeParse({
        project_name: 'Test Project',
        client_id: 'client-uuid',
        priority: 'invalid_priority',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('transformProjectInput', () => {
    it('should transform budget strings to numbers', () => {
      const result = transformProjectInput({
        project_name: 'Test Project',
        client_id: 'client-uuid',
        total_budget: '50000',
        amount_paid: '25000',
      });
      expect(result.total_budget).toBe(50000);
      expect(result.amount_paid).toBe(25000);
    });

    it('should default budgets to 0 for empty strings', () => {
      const result = transformProjectInput({
        project_name: 'Test Project',
        client_id: 'client-uuid',
        total_budget: '',
        amount_paid: '',
      });
      expect(result.total_budget).toBe(0);
      expect(result.amount_paid).toBe(0);
    });

    it('should transform empty optional fields to null', () => {
      const result = transformProjectInput({
        project_name: 'Test Project',
        client_id: 'client-uuid',
        description: '',
        start_date: '',
        end_date: '',
        payment_terms: '',
      });
      expect(result.description).toBeNull();
      expect(result.start_date).toBeNull();
      expect(result.end_date).toBeNull();
      expect(result.payment_terms).toBeNull();
    });

    it('should default status to draft', () => {
      const result = transformProjectInput({
        project_name: 'Test Project',
        client_id: 'client-uuid',
      });
      expect(result.status).toBe('draft');
    });

    it('should default priority to medium', () => {
      const result = transformProjectInput({
        project_name: 'Test Project',
        client_id: 'client-uuid',
      });
      expect(result.priority).toBe('medium');
    });
  });
});
