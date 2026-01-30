/**
 * Common util functions for testing
 * 
 */

export function withParams<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}
