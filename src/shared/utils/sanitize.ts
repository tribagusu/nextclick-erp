import DOMPurify from 'dompurify';

/**
 * Sanitizes a string by removing all HTML tags to prevent XSS attacks.
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return input;
  }

  try {
    // Only use DOMPurify in browser environment
    if (typeof window !== 'undefined' && DOMPurify) {
      return DOMPurify.sanitize(input, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [] 
      });
    }
  } catch (error) {
    console.warn('DOMPurify error, using fallback:', error);
  }
  
  // Fallback: basic HTML tag removal
  return input.replace(/<[^>]*>/g, '');
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