import DOMPurify from 'dompurify';

export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], // Strip ALL HTML tags
    ALLOWED_ATTR: [] 
  });
}

export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key] as string) as T[typeof key];
    }
  }
  
  return sanitized;
}