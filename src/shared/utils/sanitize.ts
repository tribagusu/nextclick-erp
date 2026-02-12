/**
 * Sanitizes a string by removing all HTML tags to prevent XSS attacks.
 * Uses regex-based stripping that works in both browser and Node environments.
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return input;
  }

  // Remove dangerous tags AND their content (including malformed/unclosed)
  let result = input.replace(
    /<(script|style|svg|iframe|object|form)\b[^>]*>[\s\S]*?(<\/\1\s*>|$)/gi,
    ''
  );
  // Remove all remaining HTML tags (including self-closing and malformed unclosed tags)
  result = result.replace(/<[^>]*>|<[^>]*$/g, '');
  return result;
}

/**
 * Sanitizes all string fields in a form data object.
 */
export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key] as string) as T[typeof key];
    }
  }

  return sanitized;
}
