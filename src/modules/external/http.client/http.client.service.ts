import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosError } from 'axios';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
  url: string;
  method: HttpMethod;
  data?: unknown;
  params?: Record<string, string | number>;
  headers?: Record<string, string>;
  context: string;
}

/**
 * Configuration for retry mechanism
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay between retries in milliseconds */
  baseDelayMs: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** HTTP status codes that should trigger a retry */
  retryOnStatus: number[];
}

/**
 * Extended request configuration that includes context and optional retry config
 */
export interface RequestConfig extends AxiosRequestConfig {
  /** Context for logging and error messages */
  context: string;
  /** Optional retry configuration override */
  retryConfig?: RetryConfig;
}

/**
 * Service for making HTTP requests with retry mechanism
 */
@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(
    `external-api-${HttpClientService.name}`,
  );

  /**
   * Default retry configuration
   */
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelay: 30000,
    retryOnStatus: [],
  };

  constructor(private readonly httpService: HttpService) {}

  /**
   * Updates the retry configuration
   * @param config - Partial retry configuration to update
   */
  setRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = {
      ...this.retryConfig,
      ...config,
    };
    this.logger.log(
      `Retry config updated: ${JSON.stringify(this.retryConfig)}`,
    );
  }

  /**
   * Gets the current retry configuration
   */
  createRetryConfig(): RetryConfig {
    return this.retryConfig;
  }

  /**
   * Makes an HTTP request with retry mechanism
   * @param config - Request configuration
   * @returns Promise with the response data
   * @throws Error if all retry attempts fail
   */
  async makeRequest<T>(config: RequestConfig): Promise<T> {
    const { context, retryConfig, ...requestConfig } = config;
    const retrySettings = retryConfig || this.createRetryConfig();
    let lastError: Error | null = null;

    this.logger.log(`[${context}] Making request to ${requestConfig.url}`);

    for (let attempt = 0; attempt <= retrySettings.maxRetries; attempt++) {
      try {
        const response = await firstValueFrom(
          this.httpService.request<T>(requestConfig),
        );
        this.logger.log(
          `[${context}] Request successful on attempt ${attempt + 1}`,
        );
        return response.data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const status =
          error instanceof AxiosError ? error.response?.status : undefined;

        if (
          attempt < retrySettings.maxRetries &&
          status !== undefined &&
          retrySettings.retryOnStatus.includes(status)
        ) {
          const delay = this.calculateDelay(attempt, retrySettings);
          this.logger.warn(
            `[${context}] Request failed (attempt ${
              attempt + 1
            }/${retrySettings.maxRetries}). Retrying in ${delay}ms...`,
          );
          await this.delay(delay);
          continue;
        }

        this.logger.error(
          `[${context}] Request failed after ${attempt + 1} attempts: ${
            lastError.message
          }`,
        );
        throw lastError;
      }
    }

    throw lastError || new Error(`[${context}] Request failed`);
  }

  /**
   * Calculates delay for next retry attempt using exponential backoff
   * @param attempt - Current attempt number
   * @param config - Retry configuration
   * @returns Delay in milliseconds
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const delay = Math.min(
      config.baseDelayMs * Math.pow(2, attempt),
      config.maxDelay,
    );
    return Math.floor(delay);
  }

  /**
   * Delays execution for specified milliseconds
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
