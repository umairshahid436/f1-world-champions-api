import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import { HealthService, HealthStatus } from '../health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getHealthStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status', () => {
      const mockHealthStatus: HealthStatus = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 0,
        version: '1.0.0',
      };

      (service.getHealthStatus as jest.Mock).mockReturnValue(mockHealthStatus);
      const result = controller.checkHealth();

      expect(result).toEqual(mockHealthStatus);
    });
  });
});
