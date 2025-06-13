import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealthStatus', () => {
    it('should return health status with correct structure', () => {
      const result = service.getHealthStatus();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');

      expect(result.status).toBe('ok');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.version).toBe('string');
    });

    it('should return correct version', () => {
      const result = service.getHealthStatus();
      expect(result.version).toBe(process.env.npm_package_version || '1.0.0');
    });

    it('should return increasing uptime', () => {
      const firstResult = service.getHealthStatus();
      const secondResult = service.getHealthStatus();
      expect(secondResult.uptime).toBeGreaterThanOrEqual(firstResult.uptime);
    });
  });
});
