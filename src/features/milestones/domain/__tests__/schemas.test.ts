/**
 * Milestone Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { milestoneFormSchema, transformMilestoneInput, milestoneStatusOptions } from '../schemas';

describe('Milestone Schemas', () => {
  describe('milestoneFormSchema', () => {
    it('should validate correct milestone data', () => {
      const result = milestoneFormSchema.safeParse({
        project_id: 'project-uuid',
        milestone: 'Phase 1 Complete',
        description: 'Initial development phase',
        status: 'pending',
        due_date: '2024-03-15',
      });
      expect(result.success).toBe(true);
    });

    it('should require project_id', () => {
      const result = milestoneFormSchema.safeParse({
        project_id: '',
        milestone: 'Phase 1 Complete',
      });
      expect(result.success).toBe(false);
    });

    it('should require milestone name', () => {
      const result = milestoneFormSchema.safeParse({
        project_id: 'project-uuid',
        milestone: '',
      });
      expect(result.success).toBe(false);
    });

    it('should require milestone name to be at least 2 characters', () => {
      const result = milestoneFormSchema.safeParse({
        project_id: 'project-uuid',
        milestone: 'P',
      });
      expect(result.success).toBe(false);
    });

    it('should validate all status options', () => {
      milestoneStatusOptions.forEach((status) => {
        const result = milestoneFormSchema.safeParse({
          project_id: 'project-uuid',
          milestone: 'Test Milestone',
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const result = milestoneFormSchema.safeParse({
        project_id: 'project-uuid',
        milestone: 'Test Milestone',
        status: 'invalid_status',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('transformMilestoneInput', () => {
    it('should transform empty optional fields to null', () => {
      const result = transformMilestoneInput({
        project_id: 'project-uuid',
        milestone: 'Test Milestone',
        description: '',
        due_date: '',
        completion_date: '',
        remarks: '',
      });
      expect(result.description).toBeNull();
      expect(result.due_date).toBeNull();
      expect(result.completion_date).toBeNull();
      expect(result.remarks).toBeNull();
    });

    it('should default status to pending', () => {
      const result = transformMilestoneInput({
        project_id: 'project-uuid',
        milestone: 'Test Milestone',
      });
      expect(result.status).toBe('pending');
    });

    it('should preserve valid dates', () => {
      const result = transformMilestoneInput({
        project_id: 'project-uuid',
        milestone: 'Test Milestone',
        due_date: '2024-03-15',
        completion_date: '2024-03-20',
      });
      expect(result.due_date).toBe('2024-03-15');
      expect(result.completion_date).toBe('2024-03-20');
    });
  });
});
