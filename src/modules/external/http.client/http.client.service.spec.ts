import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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
});
