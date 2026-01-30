/**
 * Utility Functions
 * 
 * Common utilities for styling and general use.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge class names with Tailwind CSS support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Restricts the value given within the limits specified
 * @param value value to restrict
 * @param min minimum limit value
 * @param max maximum limit value
 * @param defaultValue default assigned when value is off limits
 * @returns restricted value
 */
export function restrictValue(value: any, min: number, max: number, defaultValue: number) {
  if (isNaN(Number(value))) {
    return defaultValue;
  } else if (value <= min) {
    return min;
  } else if (value >= max) {
    return max;
  }
  return Number(value);;
}
