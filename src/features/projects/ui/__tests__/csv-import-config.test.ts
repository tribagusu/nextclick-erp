/**
 * Project CSV Import Config Tests
 */

import { describe, it, expect } from 'vitest';
import { projectCsvImportConfig } from '../csv-import-config';
import { projectCsvSchema } from '../../domain/schemas';

describe('projectCsvImportConfig', () => {
  describe('config structure', () => {
    it('has correct entity names', () => {
      expect(projectCsvImportConfig.entityName).toBe('Project');
      expect(projectCsvImportConfig.entityNamePlural).toBe('Projects');
    });

    it('has correct required columns', () => {
      const required = projectCsvImportConfig.columns.filter((c) => c.required);
      const requiredKeys = required.map((c) => c.key);

      expect(requiredKeys).toContain('project_name');
      expect(requiredKeys).toContain('client_name');
      expect(requiredKeys).toHaveLength(2);
    });

    it('has correct optional columns', () => {
      const optional = projectCsvImportConfig.columns.filter((c) => !c.required);
      const optionalKeys = optional.map((c) => c.key);

      expect(optionalKeys).toContain('description');
      expect(optionalKeys).toContain('status');
      expect(optionalKeys).toContain('priority');
      expect(optionalKeys).toContain('start_date');
      expect(optionalKeys).toContain('end_date');
      expect(optionalKeys).toContain('total_budget');
      expect(optionalKeys).toContain('payment_terms');
      expect(optionalKeys).toHaveLength(7);
    });

    it('uses projectCsvSchema as rowSchema', () => {
      expect(projectCsvImportConfig.rowSchema).toBe(projectCsvSchema);
    });

    it('has correct API endpoint', () => {
      expect(projectCsvImportConfig.apiEndpoint).toBe('/api/projects/import');
    });
  });

  describe('transformRow', () => {
    const transform = projectCsvImportConfig.transformRow!;

    it('converts empty optional strings to null', () => {
      const result = transform({
        project_name: 'Test Project',
        client_name: 'Acme Corp',
        description: '',
        start_date: '',
        end_date: '',
        payment_terms: '',
        total_budget: '',
      });

      expect(result.description).toBeNull();
      expect(result.start_date).toBeNull();
      expect(result.end_date).toBeNull();
      expect(result.payment_terms).toBeNull();
      expect(result.total_budget).toBeNull();
    });

    it('preserves non-empty values', () => {
      const result = transform({
        project_name: 'Website Redesign',
        client_name: 'Acme Corp',
        description: 'Full redesign',
        start_date: '2024-01-01',
        end_date: '2024-06-01',
        status: 'active',
        priority: 'high',
        total_budget: '50000',
        payment_terms: 'Net 30',
      });

      expect(result.project_name).toBe('Website Redesign');
      expect(result.client_name).toBe('Acme Corp');
      expect(result.description).toBe('Full redesign');
      expect(result.start_date).toBe('2024-01-01');
      expect(result.end_date).toBe('2024-06-01');
      expect(result.status).toBe('active');
      expect(result.priority).toBe('high');
      expect(result.total_budget).toBe(50000);
      expect(result.payment_terms).toBe('Net 30');
    });

    it('keeps required fields as-is even when empty', () => {
      const result = transform({
        project_name: '',
        client_name: '',
      });

      expect(result.project_name).toBe('');
      expect(result.client_name).toBe('');
    });

    it('parses total_budget string to number', () => {
      const result = transform({
        project_name: 'Test',
        client_name: 'Client',
        total_budget: '12345.67',
      });

      expect(result.total_budget).toBe(12345.67);
    });

    it('returns null for empty budget string', () => {
      const result = transform({
        project_name: 'Test',
        client_name: 'Client',
        total_budget: '',
      });

      expect(result.total_budget).toBeNull();
    });

    it('lowercases status and priority', () => {
      const result = transform({
        project_name: 'Test',
        client_name: 'Client',
        status: 'Active',
        priority: 'High',
      });

      expect(result.status).toBe('active');
      expect(result.priority).toBe('high');
    });

    it('returns undefined for empty status/priority so Zod defaults apply', () => {
      const result = transform({
        project_name: 'Test',
        client_name: 'Client',
        status: '',
        priority: '',
      });

      expect(result.status).toBeUndefined();
      expect(result.priority).toBeUndefined();
    });

    it('trims whitespace from optional fields', () => {
      const result = transform({
        project_name: 'Test',
        client_name: '  Acme Corp  ',
        description: '  some description  ',
        payment_terms: '  Net 30  ',
        start_date: '  2024-01-01  ',
      });

      expect(result.client_name).toBe('Acme Corp');
      expect(result.description).toBe('some description');
      expect(result.payment_terms).toBe('Net 30');
      expect(result.start_date).toBe('2024-01-01');
    });

    it('handles missing keys gracefully', () => {
      const result = transform({
        project_name: 'Test',
        client_name: 'Client',
      });

      expect(result.description).toBeNull();
      expect(result.start_date).toBeNull();
      expect(result.end_date).toBeNull();
      expect(result.total_budget).toBeNull();
      expect(result.payment_terms).toBeNull();
      expect(result.status).toBeUndefined();
      expect(result.priority).toBeUndefined();
    });
  });
});
