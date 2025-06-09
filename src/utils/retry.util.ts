import { Logger } from '@nestjs/common';
import { timer, throwError } from 'rxjs';
import { AxiosError } from 'axios';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelay: number;
  retryOnStatus: number[];
  logger?: Logger;
}

/**
 * Modern retry configuration for RxJS retry operator
 */
export const createRetryConfig = (config: RetryConfig) => ({
  count: config.maxRetries,
  delay: (error: AxiosError, retryCount: number) => {
    const status = error.response?.status;

    config.logger?.warn(
      `Request failed with status ${status}: ${error.message}`,
    );

    // Check if we should retry based on status code
    if (status && !config.retryOnStatus?.includes(status)) {
      config.logger?.error(`Non retryable error: ${status}`);
      return throwError(() => error);
    }

    const delayMs = calculateBackoffDelay(retryCount - 1, config);
    config.logger?.log(
      `Retry attempt ${retryCount}/${config.maxRetries} in ${delayMs}ms`,
    );

    return timer(delayMs);
  },
  resetOnSuccess: true,
});

const calculateBackoffDelay = (
  attempt: number,
  config: RetryConfig,
): number => {
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
  const delay = exponentialDelay * (0.5 + Math.random());
  return Math.min(delay, config.maxDelay);
};
