/**
 * CSV Parser Tests
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseCsv } from '../parse-csv';
import type { CsvImportConfig } from '../types';
import { clientApiSchema, type ClientApiData } from '@/features/clients/domain/schemas';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function csvFile(content: string, name = 'test.csv'): File {
  return new File([content], name, { type: 'text/csv' });
}

/** Minimal config that uses the real clientApiSchema. */
const clientConfig: CsvImportConfig<ClientApiData> = {
  title: 'Import Clients',
  entityName: 'Client',
  entityNamePlural: 'Clients',
  columns: [
    { key: 'name', label: 'name', required: true },
    { key: 'company_name', label: 'company_name', required: true },
    { key: 'address', label: 'address', required: true },
    { key: 'email', label: 'email', required: false },
    { key: 'phone', label: 'phone', required: false },
    { key: 'notes', label: 'notes', required: false },
  ],
  transformRow: (raw) => ({
    name: raw.name ?? '',
    email: raw.email?.trim() || null,
    phone: raw.phone?.trim() || null,
    company_name: raw.company_name ?? '',
    address: raw.address ?? '',
    notes: raw.notes?.trim() || null,
  }),
  rowSchema: clientApiSchema,
  apiEndpoint: '/api/clients/import',
};

/** Simple schema for isolated tests (no cross-field refine). */
const simpleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.string().optional(),
});

type SimpleRow = z.infer<typeof simpleSchema>;

const simpleConfig: CsvImportConfig<SimpleRow> = {
  title: 'Import',
  entityName: 'Item',
  entityNamePlural: 'Items',
  columns: [
    { key: 'name', label: 'name', required: true },
    { key: 'value', label: 'value', required: false },
  ],
  rowSchema: simpleSchema,
  apiEndpoint: '/api/items/import',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('parseCsv', () => {
  it('parses valid CSV with all required columns', async () => {
    const csv = [
      'name,company_name,address,email,phone,notes',
      'Acme Corp,Acme Inc,123 Main St,acme@example.com,555-1234,VIP client',
      'Beta LLC,Beta Co,456 Oak Ave,beta@example.com,,',
    ].join('\n');

    const result = await parseCsv(csvFile(csv), clientConfig);

    expect(result.fileErrors).toHaveLength(0);
    expect(result.rowErrors).toHaveLength(0);
    expect(result.validRows).toHaveLength(2);
    expect(result.totalRows).toBe(2);
    expect(result.validRows[0].name).toBe('Acme Corp');
    expect(result.validRows[1].email).toBe('beta@example.com');
  });

  it('reports missing required columns as fileErrors', async () => {
    // Missing company_name and address
    const csv = [
      'name,email',
      'Acme Corp,acme@example.com',
    ].join('\n');

    const result = await parseCsv(csvFile(csv), clientConfig);

    expect(result.fileErrors.length).toBeGreaterThan(0);
    expect(result.fileErrors[0]).toContain('Missing required column');
    expect(result.fileErrors[0]).toContain('company_name');
    expect(result.fileErrors[0]).toContain('address');
    expect(result.validRows).toHaveLength(0);
    expect(result.totalRows).toBe(0);
  });

  it('reports empty CSV (headers only, no data rows)', async () => {
    const csv = 'name,company_name,address,email,phone,notes\n';

    const result = await parseCsv(csvFile(csv), clientConfig);

    expect(result.fileErrors).toContain('CSV file contains no data rows');
    expect(result.validRows).toHaveLength(0);
  });

  it('validates rows and reports row-level errors with correct row numbers', async () => {
    const csv = [
      'name,company_name,address,email,phone',
      ',Acme Inc,123 Main St,acme@example.com,555-1234', // Row 2: missing name
      'Beta LLC,Beta Co,456 Oak Ave,beta@example.com,',   // Row 3: valid
    ].join('\n');

    const result = await parseCsv(csvFile(csv), clientConfig);

    expect(result.rowErrors).toHaveLength(1);
    expect(result.rowErrors[0].row).toBe(2); // header=1, first data row=2
    expect(result.validRows).toHaveLength(1);
    expect(result.totalRows).toBe(2);
  });

  it('handles mix of valid and invalid rows', async () => {
    const csv = [
      'name,company_name,address,email,phone',
      'Valid Client,Company A,Address A,valid@email.com,',  // valid
      'A,Company B,Address B,,',                              // invalid: name too short + no email/phone
      'Another Valid,Company C,Address C,,555-9999',          // valid
      ',Company D,Address D,bad-email,',                      // invalid: no name + bad email
    ].join('\n');

    const result = await parseCsv(csvFile(csv), clientConfig);

    expect(result.validRows).toHaveLength(2);
    expect(result.rowErrors).toHaveLength(2);
    expect(result.totalRows).toBe(4);
    // Row numbers: header=1, so data rows start at 2
    expect(result.rowErrors[0].row).toBe(3);
    expect(result.rowErrors[1].row).toBe(5);
  });

  it('sanitizes HTML/XSS content from CSV values', async () => {
    const csv = [
      'name,value',
      '<script>alert("xss")</script>Test,safe',
    ].join('\n');

    const result = await parseCsv(csvFile(csv), simpleConfig);

    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].name).not.toContain('<script>');
    expect(result.validRows[0].name).toContain('Test');
  });

  it('applies transformRow when provided', async () => {
    const csv = [
      'name,company_name,address,email,phone,notes',
      'Test Client,Test Co,123 Test St,,,', // email, phone, notes empty
    ].join('\n');

    const result = await parseCsv(csvFile(csv), clientConfig);

    // The refine requires email OR phone, so this should fail
    expect(result.rowErrors).toHaveLength(1);
    expect(result.rowErrors[0].errors[0]).toContain('email or phone');
  });

  it('works without transformRow (uses raw values)', async () => {
    const csv = [
      'name,value',
      'TestItem,hello',
      'AnotherItem,world',
    ].join('\n');

    // simpleConfig has no transformRow
    const result = await parseCsv(csvFile(csv), simpleConfig);

    expect(result.validRows).toHaveLength(2);
    expect(result.rowErrors).toHaveLength(0);
    expect(result.validRows[0].name).toBe('TestItem');
    expect(result.validRows[0].value).toBe('hello');
  });

  it('trims whitespace from values', async () => {
    const csv = [
      'name,value',
      '  Padded Name  , padded value ',
    ].join('\n');

    const result = await parseCsv(csvFile(csv), simpleConfig);

    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].name).toBe('Padded Name');
  });

  it('transforms empty optional strings to null via transformRow', async () => {
    const csv = [
      'name,company_name,address,email,phone,notes',
      'Test Client,Test Co,123 Test St,test@example.com,,',
    ].join('\n');

    const result = await parseCsv(csvFile(csv), clientConfig);

    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].phone).toBeNull();
    expect(result.validRows[0].notes).toBeNull();
  });
});
