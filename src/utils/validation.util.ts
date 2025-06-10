import { ValidationError } from 'class-validator';

// Formats validation errors into a structured object
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
