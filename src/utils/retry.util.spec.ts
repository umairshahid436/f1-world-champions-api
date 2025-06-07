import { retryWithBackoff, retryWithBackoffSafe } from './retry.util';

describe('utils', () => {
  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn, 'test operation');

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry and eventually succeed', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn, 'test operation', {
        maxRetries: 3,
        baseDelayMs: 10, // Short delay for testing
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('persistent error'));

      await expect(
        retryWithBackoff(mockFn, 'test operation', {
          maxRetries: 2,
          baseDelayMs: 10,
        }),
      ).rejects.toThrow('persistent error');

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 404 errors', async () => {
      const mockError = {
        response: { status: 404 },
        message: 'Not found',
      };
      const mockFn = jest.fn().mockRejectedValue(mockError);

      await expect(
        retryWithBackoff(mockFn, 'test operation', {
          maxRetries: 3,
          skipRetryOnStatusCodes: [404],
        }),
      ).rejects.toEqual(mockError);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on 500 errors', async () => {
      const mockError = {
        response: { status: 500 },
        message: 'Server error',
      };
      const mockFn = jest.fn().mockRejectedValue(mockError);

      await expect(
        retryWithBackoff(mockFn, 'test operation', {
          maxRetries: 2,
          baseDelayMs: 10,
          skipRetryOnStatusCodes: [404],
        }),
      ).rejects.toEqual(mockError);

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('retryWithBackoffSafe', () => {
    it('should return success result', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await retryWithBackoffSafe(mockFn, 'test operation');

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
    });

    it('should return failure result', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('fail'));

      const result = await retryWithBackoffSafe(mockFn, 'test operation', {
        maxRetries: 2,
        baseDelayMs: 10,
      });

      expect(result.success).toBe(false);
      expect(result.lastError).toEqual(new Error('fail'));
      expect(result.attempts).toBe(2);
    });
  });
});
