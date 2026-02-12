/**
 * CSV Import Dialog
 *
 * Generic, reusable dialog for importing data from CSV files.
 * Each feature provides a CsvImportConfig to customize columns,
 * validation, and API endpoint.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/shared/components/ui/alert';

import { parseCsv } from './parse-csv';
import type { CsvImportConfig, CsvParseResult } from './types';

const MAX_VISIBLE_ERRORS = 20;

interface CsvImportDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: CsvImportConfig<T>;
  onImport: (rows: T[]) => Promise<void>;
  isImporting?: boolean;
}

export function CsvImportDialog<T>({
  open,
  onOpenChange,
  config,
  onImport,
  isImporting = false,
}: CsvImportDialogProps<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CsvParseResult<T> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredColumns = config.columns.filter((c) => c.required);
  const optionalColumns = config.columns.filter((c) => !c.required);

  const reset = useCallback(() => {
    setFile(null);
    setParseResult(null);
    setIsDragging(false);
    setIsParsing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        reset();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, reset]
  );

  const handleFile = useCallback(
    async (selectedFile: File) => {
      if (!selectedFile.name.endsWith('.csv')) {
        setParseResult({
          validRows: [],
          rowErrors: [],
          fileErrors: ['Please upload a CSV file (.csv)'],
          totalRows: 0,
        });
        return;
      }

      setFile(selectedFile);
      setIsParsing(true);

      const result = await parseCsv(selectedFile, config);

      setParseResult(result);
      setIsParsing(false);
    },
    [config]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleImportClick = useCallback(async () => {
    if (!parseResult || parseResult.validRows.length === 0) return;
    await onImport(parseResult.validRows);
  }, [parseResult, onImport]);

  const hasFileErrors = parseResult && parseResult.fileErrors.length > 0;
  const hasRowErrors = parseResult && parseResult.rowErrors.length > 0;
  const hasErrors = hasFileErrors || hasRowErrors;
  const validCount = parseResult?.validRows.length ?? 0;
  const canImport = validCount > 0 && !hasFileErrors && !isImporting;

  // Build description text
  const descriptionParts: string[] = [];
  if (requiredColumns.length > 0) {
    descriptionParts.push(
      `${requiredColumns.map((c) => c.label).join(', ')} (required)`
    );
  }
  if (optionalColumns.length > 0) {
    descriptionParts.push(
      `${optionalColumns.map((c) => c.label).join(', ')} (all optional)`
    );
  }
  const description = `Upload a CSV file with the following columns: ${descriptionParts.join(', ')}. ${config.entityName} IDs will be auto-generated.`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />

          {file ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Drag and drop, or{' '}
              <span className="text-primary underline">browse</span> your files
            </p>
          )}

          {file && !isParsing && !hasErrors && (
            <p className="mt-1 text-xs text-muted-foreground">
              Drag and drop to replace, or{' '}
              <span className="text-primary underline">browse</span>
            </p>
          )}

          {isParsing && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Parsing CSV...
            </div>
          )}
        </div>

        {/* Validation Results */}
        {parseResult && !isParsing && (
          <div className="space-y-3">
            {/* File-level errors */}
            {hasFileErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Blocked - Errors Found</AlertTitle>
                <AlertDescription>
                  <ul className="mt-1 list-disc pl-4">
                    {parseResult.fileErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Row-level errors */}
            {hasRowErrors && !hasFileErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Blocked - Errors Found</AlertTitle>
                <AlertDescription>
                  <ul className="mt-1 max-h-[160px] list-disc overflow-y-auto pl-4">
                    {parseResult.rowErrors
                      .slice(0, MAX_VISIBLE_ERRORS)
                      .map((rowErr) =>
                        rowErr.errors.map((msg, j) => (
                          <li key={`${rowErr.row}-${j}`}>
                            Row {rowErr.row}: {msg}
                          </li>
                        ))
                      )}
                  </ul>
                  {parseResult.rowErrors.length > MAX_VISIBLE_ERRORS && (
                    <p className="mt-2 text-xs">
                      ...and {parseResult.rowErrors.length - MAX_VISIBLE_ERRORS}{' '}
                      more error{parseResult.rowErrors.length - MAX_VISIBLE_ERRORS > 1 ? 's' : ''}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Ready to import */}
            {validCount > 0 && !hasFileErrors && !hasRowErrors && (
              <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <div>
                    <p className="font-medium text-green-500">Ready to Import</p>
                    <p className="mt-0.5 text-green-400/90">
                      {validCount} {validCount === 1 ? config.entityName.toLowerCase() : config.entityNamePlural.toLowerCase()}{' '}
                      {validCount === 1 ? 'is' : 'are'} ready to be imported.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImportClick} disabled={!canImport}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import {validCount} {config.entityNamePlural}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
