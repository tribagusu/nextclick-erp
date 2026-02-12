/**
 * Client CSV Import Config Tests
 */

import { describe, it, expect } from 'vitest';
import { clientCsvImportConfig } from '../csv-import-config';
import { clientApiSchema } from '../../domain/schemas';

describe('clientCsvImportConfig', () => {
  describe('config structure', () => {
    it('has correct entity names', () => {
      expect(clientCsvImportConfig.entityName).toBe('Client');
      expect(clientCsvImportConfig.entityNamePlural).toBe('Clients');
    });

    it('has correct required columns', () => {
      const required = clientCsvImportConfig.columns.filter((c) => c.required);
      const requiredKeys = required.map((c) => c.key);

      expect(requiredKeys).toContain('name');
      expect(requiredKeys).toContain('company_name');
      expect(requiredKeys).toContain('address');
      expect(requiredKeys).toHaveLength(3);
    });

    it('has correct optional columns', () => {
      const optional = clientCsvImportConfig.columns.filter((c) => !c.required);
      const optionalKeys = optional.map((c) => c.key);

      expect(optionalKeys).toContain('email');
      expect(optionalKeys).toContain('phone');
      expect(optionalKeys).toContain('notes');
      expect(optionalKeys).toHaveLength(3);
    });

    it('uses clientApiSchema as rowSchema', () => {
      expect(clientCsvImportConfig.rowSchema).toBe(clientApiSchema);
    });

    it('has correct API endpoint', () => {
      expect(clientCsvImportConfig.apiEndpoint).toBe('/api/clients/import');
    });
  });

  describe('transformRow', () => {
    const transform = clientCsvImportConfig.transformRow!;

    it('converts empty email, phone, notes to null', () => {
      const result = transform({
        name: 'Test',
        company_name: 'Test Co',
        address: '123 Main St',
        email: '',
        phone: '',
        notes: '',
      });

      expect(result.email).toBeNull();
      expect(result.phone).toBeNull();
      expect(result.notes).toBeNull();
    });

    it('preserves non-empty values', () => {
      const result = transform({
        name: 'Acme Corp',
        company_name: 'Acme Inc',
        address: '456 Oak Ave',
        email: 'acme@example.com',
        phone: '555-1234',
        notes: 'VIP client',
      });

      expect(result.name).toBe('Acme Corp');
      expect(result.email).toBe('acme@example.com');
      expect(result.phone).toBe('555-1234');
      expect(result.company_name).toBe('Acme Inc');
      expect(result.address).toBe('456 Oak Ave');
      expect(result.notes).toBe('VIP client');
    });

    it('keeps required fields as-is even when empty', () => {
      const result = transform({
        name: '',
        company_name: '',
        address: '',
        email: 'test@example.com',
        phone: '',
        notes: '',
      });

      // Required fields use ?? '' fallback, not null conversion
      expect(result.name).toBe('');
      expect(result.company_name).toBe('');
      expect(result.address).toBe('');
    });

    it('trims whitespace from optional fields', () => {
      const result = transform({
        name: 'Test',
        company_name: 'Co',
        address: 'Addr',
        email: '  test@example.com  ',
        phone: '  555-1234  ',
        notes: '  some notes  ',
      });

      expect(result.email).toBe('test@example.com');
      expect(result.phone).toBe('555-1234');
      expect(result.notes).toBe('some notes');
    });

    it('handles missing keys gracefully', () => {
      const result = transform({
        name: 'Test',
        company_name: 'Co',
        address: 'Addr',
      });

      // Missing optional fields default to null
      expect(result.email).toBeNull();
      expect(result.phone).toBeNull();
      expect(result.notes).toBeNull();
    });
  });
});
