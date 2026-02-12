/**
 * CSV Import - Shared Types
 *
 * Generic interfaces for the reusable CSV import feature.
 * Each feature provides a CsvImportConfig to plug into the shared dialog.
 */

import type { ZodType } from 'zod';

/**
 * Describes one column that a CSV file must/can contain.
 */
export interface CsvColumnDef {
  /** The CSV header name (matches the field key) */
  key: string;
  /** Human-readable label shown in the dialog */
  label: string;
  /** Whether this column is required */
  required: boolean;
}

/**
 * A single row's validation errors, tied to a row number.
 */
export interface CsvRowError {
  /** 1-indexed row number (accounting for header row) */
  row: number;
  /** List of error messages for this row */
  errors: string[];
}

/**
 * Result of parsing + validating a CSV file.
 */
export interface CsvParseResult<T> {
  /** Rows that passed validation, ready for import */
  validRows: T[];
  /** Per-row errors for rows that failed validation */
  rowErrors: CsvRowError[];
  /** File-level errors (wrong columns, empty file, etc.) */
  fileErrors: string[];
  /** Total data rows found in the file (before validation) */
  totalRows: number;
}

/**
 * Configuration object that each feature provides to CsvImportDialog.
 * This is the main integration surface between shared and feature code.
 */
export interface CsvImportConfig<T> {
  /** Dialog title, e.g. "Import Clients from CSV" */
  title: string;
  /** Entity name (singular), e.g. "Client" — used for button label, toast */
  entityName: string;
  /** Entity name (plural), e.g. "Clients" */
  entityNamePlural: string;
  /** Column definitions — order matters for the info display */
  columns: CsvColumnDef[];
  /** Zod schema to validate each parsed row */
  rowSchema: ZodType<T>;
  /**
   * Optional transform applied to each raw parsed row BEFORE Zod validation.
   * Use to convert empty strings to null, trim values, etc.
   */
  transformRow?: (raw: Record<string, string>) => Record<string, unknown>;
  /** The API endpoint to POST the validated rows to */
  apiEndpoint: string;
}
