import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { HttpClientService } from './http.client.service';

describe('HttpClientService', () => {
  let service: HttpClientService;
  let httpService: HttpService;

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
    (httpService.request as jest.Mock).mockReturnValue(of(mockResponse));

    const result = await service.makeRequest({
      url: '/test',
      method: 'GET',
      context: 'test',
    });

    expect(result).toEqual('test');
    expect(httpService.request).toHaveBeenCalledTimes(1);
  });

  it('should not retry on non-retryable status code', async () => {
    const axiosError = new AxiosError('Bad Request');
    (httpService.request as jest.Mock).mockReturnValue(
      throwError(() => axiosError),
    );

    const config = {
      url: '/test',
      method: 'GET',
      context: 'test',
    };

    await expect(service.makeRequest(config)).rejects.toThrow('Bad Request');
    expect(httpService.request).toHaveBeenCalledTimes(1);
  });
});
