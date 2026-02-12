/**
 * CSV Import - Parser Utility
 *
 * Parses a CSV file using PapaParse, validates headers,
 * sanitizes values, and validates each row against a Zod schema.
 */

import Papa from 'papaparse';
import { sanitizeString } from '@/shared/utils/sanitize';
import type { CsvImportConfig, CsvParseResult, CsvRowError } from './types';

/**
 * Parse a CSV file and validate each row against the feature's schema.
 * Returns valid rows + categorized errors.
 */
export function parseCsv<T>(
  file: File,
  config: CsvImportConfig<T>
): Promise<CsvParseResult<T>> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fileErrors: string[] = [];
        const rowErrors: CsvRowError[] = [];
        const validRows: T[] = [];

        // 1. Check for PapaParse-level errors
        if (results.errors.length > 0) {
          for (const err of results.errors.slice(0, 5)) {
            fileErrors.push(
              `Row ${(err.row ?? 0) + 2}: ${err.message}`
            );
          }
        }

        // 2. Validate headers — check required columns exist
        const headers = results.meta.fields ?? [];
        const requiredColumns = config.columns.filter((c) => c.required);
        const missingColumns = requiredColumns
          .filter((col) => !headers.includes(col.key))
          .map((col) => col.label);

        if (missingColumns.length > 0) {
          fileErrors.push(
            `Missing required column${missingColumns.length > 1 ? 's' : ''}: ${missingColumns.join(', ')}`
          );
          resolve({ validRows: [], rowErrors: [], fileErrors, totalRows: 0 });
          return;
        }

        // 3. Validate each row
        const data = results.data as Record<string, string>[];

        if (data.length === 0) {
          fileErrors.push('CSV file contains no data rows');
          resolve({ validRows: [], rowErrors: [], fileErrors, totalRows: 0 });
          return;
        }

        for (let i = 0; i < data.length; i++) {
          const rawRow = data[i];

          // Sanitize all string values (XSS prevention)
          const sanitizedRow: Record<string, string> = {};
          for (const [key, value] of Object.entries(rawRow)) {
            sanitizedRow[key] =
              typeof value === 'string'
                ? sanitizeString(value.trim())
                : value;
          }

          // Transform (feature-specific: e.g. empty string -> null)
          const transformed = config.transformRow
            ? config.transformRow(sanitizedRow)
            : sanitizedRow;

          // Validate against Zod schema
          const result = config.rowSchema.safeParse(transformed);
          if (result.success) {
            validRows.push(result.data);
          } else {
            const errors = result.error.issues.map((issue) => {
              const field = issue.path.join('.');
              return field
                ? `Invalid ${field} "${issue.message}".`
                : issue.message;
            });
            // Row number: +2 for 1-indexed + header row
            rowErrors.push({ row: i + 2, errors });
          }
        }

        resolve({
          validRows,
          rowErrors,
          fileErrors,
          totalRows: data.length,
        });
      },
      error: (error) => {
        resolve({
          validRows: [],
          rowErrors: [],
          fileErrors: [`Failed to parse CSV: ${error.message}`],
          totalRows: 0,
        });
      },
    });
  });
}
