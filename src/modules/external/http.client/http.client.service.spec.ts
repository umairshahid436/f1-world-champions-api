import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpClientService } from './http.client.service';

describe('HttpClientService', () => {
  let service: HttpClientService;
  let httpService: HttpService;
  let httpServiceRequestSpy: jest.SpyInstance;

  // Mock timers to control retry delays
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpClientService,
        {
          provide: HttpService,
          useValue: {
            request: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HttpClientService>(HttpClientService);
    httpService = module.get<HttpService>(HttpService);
    httpServiceRequestSpy = jest.spyOn(httpService, 'request');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should make successful request', async () => {
    const mockResponse: AxiosResponse = {
      data: 'test',
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    httpServiceRequestSpy.mockReturnValue(of(mockResponse));

    const result = await service.makeRequest({
      url: '/test',
      method: 'GET',
      context: 'test',
    });

    expect(result).toEqual('test');
    expect(httpServiceRequestSpy).toHaveBeenCalledTimes(1);
  });

  // it('should retry on 429 status', async () => {
  //   const mockError: AxiosError = {
  //     name: 'AxiosError',
  //     message: 'Too Many Requests',
  //     code: '429',
  //     config: {} as InternalAxiosRequestConfig,
  //     response: {
  //       status: 429,
  //       statusText: 'Too Many Requests',
  //       headers: {},
  //       config: {} as InternalAxiosRequestConfig,
  //       data: null,
  //     },
  //     isAxiosError: true,
  //     toJSON: () => ({}),
  //   };

  //   const mockResponse: AxiosResponse = {
  //     data: 'success',
  //     status: 200,
  //     statusText: 'OK',
  //     headers: {},
  //     config: {} as InternalAxiosRequestConfig,
  //   };

  //   httpServiceRequestSpy
  //     .mockReturnValueOnce(throwError(() => mockError))
  //     .mockReturnValueOnce(of(mockResponse));

  //   const requestPromise = service.makeRequest({
  //     url: '/test',
  //     method: 'GET',
  //     context: 'test',
  //   });

  //   // Advance timers and wait for the promise to resolve
  //   await jest.runOnlyPendingTimersAsync();
  //   const result = await requestPromise;

  //   expect(result).toEqual('success');
  //   expect(httpServiceRequestSpy).toHaveBeenCalledTimes(2);
  // });

  // it('should retry on 500 status', async () => {
  //   const mockError: AxiosError = {
  //     name: 'AxiosError',
  //     message: 'Internal Server Error',
  //     code: '500',
  //     config: {} as InternalAxiosRequestConfig,
  //     response: {
  //       status: 500,
  //       statusText: 'Internal Server Error',
  //       headers: {},
  //       config: {} as InternalAxiosRequestConfig,
  //       data: null,
  //     },
  //     isAxiosError: true,
  //     toJSON: () => ({}),
  //   };

  //   const mockResponse: AxiosResponse = {
  //     data: 'success',
  //     status: 200,
  //     statusText: 'OK',
  //     headers: {},
  //     config: {} as InternalAxiosRequestConfig,
  //   };

  //   httpServiceRequestSpy
  //     .mockReturnValueOnce(throwError(() => mockError))
  //     .mockReturnValueOnce(of(mockResponse));

  //   const requestPromise = service.makeRequest({
  //     url: '/test',
  //     method: 'GET',
  //     context: 'test',
  //   });

  //   // Advance timers and wait for the promise to resolve
  //   await jest.runOnlyPendingTimersAsync();
  //   const result = await requestPromise;

  //   expect(result).toEqual('success');
  //   expect(httpServiceRequestSpy).toHaveBeenCalledTimes(2);
  // });

  it('should not retry on 400 status', async () => {
    const mockError: AxiosError = {
      name: 'AxiosError',
      message: 'Bad Request',
      code: '400',
      config: {} as InternalAxiosRequestConfig,
      response: {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        data: null,
      },
      isAxiosError: true,
      toJSON: () => ({}),
    };

    httpServiceRequestSpy.mockReturnValue(throwError(() => mockError));

    await expect(
      service.makeRequest({
        url: '/test',
        method: 'GET',
        context: 'test',
      }),
    ).rejects.toThrow();

    expect(httpServiceRequestSpy).toHaveBeenCalledTimes(1);
  });

  // it('should handle network errors with retries', async () => {
  //   const networkError: AxiosError = {
  //     name: 'AxiosError',
  //     message: 'Network Error',
  //     code: 'ECONNABORTED',
  //     config: {} as InternalAxiosRequestConfig,
  //     response: undefined, // Network errors don't have response
  //     isAxiosError: true,
  //     toJSON: () => ({}),
  //   };

  //   const mockResponse: AxiosResponse = {
  //     data: 'success after retry',
  //     status: 200,
  //     statusText: 'OK',
  //     headers: {},
  //     config: {} as InternalAxiosRequestConfig,
  //   };

  //   httpServiceRequestSpy
  //     .mockReturnValueOnce(throwError(() => networkError))
  //     .mockReturnValueOnce(of(mockResponse));

  //   const requestPromise = service.makeRequest({
  //     url: '/test',
  //     method: 'GET',
  //     context: 'test',
  //   });

  //   // Advance timers and wait for the promise to resolve
  //   await jest.runOnlyPendingTimersAsync();
  //   const result = await requestPromise;

  //   expect(result).toEqual('success after retry');
  //   expect(httpServiceRequestSpy).toHaveBeenCalledTimes(2);
  // });

  // it('should exhaust retries and throw error', async () => {
  //   const mockError: AxiosError = {
  //     name: 'AxiosError',
  //     message: 'Internal Server Error',
  //     code: '500',
  //     config: {} as InternalAxiosRequestConfig,
  //     response: {
  //       status: 500,
  //       statusText: 'Internal Server Error',
  //       headers: {},
  //       config: {} as InternalAxiosRequestConfig,
  //       data: null,
  //     },
  //     isAxiosError: true,
  //     toJSON: () => ({}),
  //   };

  //   // Mock multiple failed attempts
  //   httpServiceRequestSpy.mockReturnValue(throwError(() => mockError));

  //   const requestPromise = service.makeRequest({
  //     url: '/test',
  //     method: 'GET',
  //     context: 'test',
  //   });

  //   // Advance all timers to let retries complete
  //   await jest.runAllTimersAsync();

  //   await expect(requestPromise).rejects.toThrow();

  //   // Should attempt initial request + max retries (assuming default is 3)
  //   expect(httpServiceRequestSpy).toHaveBeenCalledTimes(4);
  // });

  it('should pass request data correctly', async () => {
    const mockResponse: AxiosResponse = {
      data: 'test',
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    const requestData = { name: 'test' };
    httpServiceRequestSpy.mockReturnValue(of(mockResponse));

    await service.makeRequest({
      url: '/test',
      method: 'POST',
      data: requestData,
      context: 'test',
    });

    expect(httpServiceRequestSpy).toHaveBeenCalledWith({
      method: 'POST',
      url: '/test',
      data: requestData,
    });
  });

  it('should pass query parameters correctly', async () => {
    const mockResponse: AxiosResponse = {
      data: 'test',
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    const params = { page: 1, limit: 10 };
    httpServiceRequestSpy.mockReturnValue(of(mockResponse));

    await service.makeRequest({
      url: '/test',
      method: 'GET',
      params,
      context: 'test',
    });

    expect(httpServiceRequestSpy).toHaveBeenCalledWith({
      method: 'GET',
      url: '/test',
      params,
    });
  });

  it('should pass headers correctly', async () => {
    const mockResponse: AxiosResponse = {
      data: 'test',
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    const headers = { 'Content-Type': 'application/json' };
    httpServiceRequestSpy.mockReturnValue(of(mockResponse));

    await service.makeRequest({
      url: '/test',
      method: 'GET',
      headers,
      context: 'test',
    });

    expect(httpServiceRequestSpy).toHaveBeenCalledWith({
      method: 'GET',
      url: '/test',
      headers,
    });
  });

  // it('should allow child classes to override retry configuration', () => {
  //   class CustomHttpClientService extends HttpClientService {
  //     protected createRetryConfig = () => {
  //       return {
  //         maxRetries: 5,
  //         baseDelayMs: 2000,
  //         maxDelay: 60000,
  //         retryOnStatus: [429, 500, 503],
  //       };
  //     };
  //   }

  //   const customService = new CustomHttpClientService(httpService);
  //   const config = customService.retryConfig;

  //   expect(config).toEqual({
  //     maxRetries: 5,
  //     baseDelayMs: 2000,
  //     maxDelay: 60000,
  //     retryOnStatus: [429, 500, 503],
  //   });
  // });

  // it('should respect retry configuration for specific status codes', async () => {
  //   const mockError503: AxiosError = {
  //     name: 'AxiosError',
  //     message: 'Service Unavailable',
  //     code: '503',
  //     config: {} as InternalAxiosRequestConfig,
  //     response: {
  //       status: 503,
  //       statusText: 'Service Unavailable',
  //       headers: {},
  //       config: {} as InternalAxiosRequestConfig,
  //       data: null,
  //     },
  //     isAxiosError: true,
  //     toJSON: () => ({}),
  //   };

  //   const mockResponse: AxiosResponse = {
  //     data: 'success',
  //     status: 200,
  //     statusText: 'OK',
  //     headers: {},
  //     config: {} as InternalAxiosRequestConfig,
  //   };

  //   httpServiceRequestSpy
  //     .mockReturnValueOnce(throwError(() => mockError503))
  //     .mockReturnValueOnce(of(mockResponse));

  //   const requestPromise = service.makeRequest({
  //     url: '/test',
  //     method: 'GET',
  //     context: 'test',
  //   });

  //   await jest.runOnlyPendingTimersAsync();
  //   const result = await requestPromise;

  //   expect(result).toEqual('success');
  //   expect(httpServiceRequestSpy).toHaveBeenCalledTimes(2);
  // });
});
