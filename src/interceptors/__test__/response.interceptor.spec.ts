import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor } from '../response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockHandle: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseInterceptor],
    }).compile();

    interceptor = module.get<ResponseInterceptor<unknown>>(ResponseInterceptor);

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;

    mockHandle = jest.fn();
    mockCallHandler = {
      handle: mockHandle,
    } as CallHandler;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should be defined', () => {
      expect(interceptor).toBeDefined();
    });

    it('should transform single object response correctly', (done) => {
      const mockData = { id: 1, name: 'Test User' };
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: mockData,
          message: 'Success',
        });
        expect(result.count).toBeUndefined();
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should transform array response with count property', (done) => {
      const mockData = [
        { id: 1, name: 'User 1' },
        { id: 2, name: 'User 2' },
        { id: 3, name: 'User 3' },
      ];
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: mockData,
          message: 'Success',
          count: 3,
        });
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle empty array response', (done) => {
      const mockData: [] = [];
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: mockData,
          message: 'Success',
          count: 0,
        });
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle null response', (done) => {
      const mockData = null;
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: null,
          message: 'Success',
        });
        expect(result.count).toBeUndefined();
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle undefined response', (done) => {
      const mockData = undefined;
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: undefined,
          message: 'Success',
        });
        expect(result.count).toBeUndefined();
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle string response', (done) => {
      const mockData = 'Hello World';
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: 'Hello World',
          message: 'Success',
        });
        expect(result.count).toBeUndefined();
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle number response', (done) => {
      const mockData = 42;
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: 42,
          message: 'Success',
        });
        expect(result.count).toBeUndefined();
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle boolean response', (done) => {
      const mockData = true;
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: true,
          message: 'Success',
        });
        expect(result.count).toBeUndefined();
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle nested object response', (done) => {
      const mockData = {
        user: {
          id: 1,
          profile: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: mockData,
          message: 'Success',
        });
        expect(result.count).toBeUndefined();
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should handle array of different data types', (done) => {
      const mockData = [1, 'string', { key: 'value' }, null, true];
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result).toEqual({
          data: mockData,
          message: 'Success',
          count: 5,
        });
        expect(mockHandle).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should not modify the original data', (done) => {
      const originalData = { id: 1, name: 'Test' };
      const mockData = { ...originalData };
      mockHandle.mockReturnValue(of(mockData));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe((result) => {
        expect(result.data).toEqual(originalData);
        expect(result.data).not.toBe(originalData); // Should not be the same reference
        expect(mockData).toEqual(originalData); // Original mock data unchanged
        done();
      });
    });
  });
});
