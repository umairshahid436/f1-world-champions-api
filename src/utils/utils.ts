import { ValidationError } from 'class-validator';
import { SortBy } from '@interfaces/index';

/**
 * Generic sorting function that can sort arrays by any property in ascending or descending order
 */
export function sortByProperty<T>({
  array,
  property,
  sortBy = 'ASC',
}: {
  array: T[];
  property: keyof T;
  sortBy?: SortBy;
}): T[] {
  const ascending = sortBy === 'ASC';
  return [...array].sort((a, b) => {
    const valueA = a[property];
    const valueB = b[property];

    // Handle null/undefined values
    if (valueA === null && valueB === null) return 0;
    if (valueA === undefined && valueB === undefined) return 0;
    if (valueA === null && valueB === undefined) return ascending ? -1 : 1;
    if (valueA === undefined && valueB === null) return ascending ? 1 : -1;

    // In ascending order: null/undefined come first
    // In descending order: null/undefined come last
    if (valueA === null || valueA === undefined) {
      return ascending ? -1 : 1;
    }
    if (valueB === null || valueB === undefined) {
      return ascending ? 1 : -1;
    }

    // Handle different types of values
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return ascending
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return ascending ? valueA - valueB : valueB - valueA;
    }

    if (valueA instanceof Date && valueB instanceof Date) {
      return ascending
        ? valueA.getTime() - valueB.getTime()
        : valueB.getTime() - valueA.getTime();
    }

    // Default comparison for other types
    return ascending
      ? String(valueA).localeCompare(String(valueB))
      : String(valueB).localeCompare(String(valueA));
  });
}

/* Formats validation errors into a structured object */
export function formatValidationErrors(
  errors: ValidationError[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];
    const property = error.property;
    const messages = error.constraints
      ? Object.values(error.constraints)
      : ['Validation failed'];

    result[property] = messages;
  }
  return result;
}
