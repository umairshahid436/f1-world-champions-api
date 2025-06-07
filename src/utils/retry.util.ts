import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  skipRetryOnStatusCodes?: number[];
  logger?: Logger;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  attempts: number;
  lastError?: any;
}

/**
 * Retry function with exponential backoff
 * @param fn - The async function to retry
 * @param context - Context for logging (e.g., "API call for user 123")
 * @param options - Retry configuration options
 * @returns Promise<T>
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  context: string,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    skipRetryOnStatusCodes = [404],
    logger,
  } = options;

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();

      return result;
    } catch (error) {
      lastError = error;

      // Check if we should skip retry for specific status codes
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (skipRetryOnStatusCodes.includes(axiosError.response.status)) {
          if (logger) {
            logger.warn(
              `${context} failed with status ${axiosError.response.status} - not retrying`,
            );
          }
          throw error;
        }
      }

      if (attempt === maxRetries) {
        if (logger) {
          logger.error(`Failed ${context} after ${maxRetries} attempts`);
        }
        break;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
      if (logger) {
        logger.warn(
          `Attempt ${attempt}/${maxRetries} failed for ${context}, retrying in ${delayMs}ms...`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

/**
 * Retry function that returns a result object instead of throwing
 * Useful for batch operations where you want to track partial failures
 */
export async function retryWithBackoffSafe<T>(
  fn: () => Promise<T>,
  context: string,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  try {
    const data = await retryWithBackoff(fn, context, options);
    return {
      success: true,
      data,
      attempts: 1,
    };
  } catch (error) {
    return {
      success: false,
      lastError: error,
      attempts: options.maxRetries || 3,
    };
  }
}
