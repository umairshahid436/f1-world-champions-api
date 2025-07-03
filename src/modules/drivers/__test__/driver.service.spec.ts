import { Test, TestingModule } from '@nestjs/testing';
import { DriversService } from '../drivers.service';
import { Driver } from '../../../database/entities/driver.entity';
import { EntityManager } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('DriversService', () => {
  let service: DriversService;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        {
          provide: getRepositoryToken(Driver),
          useValue: {
            // Mock repository methods if needed
          },
        },
        {
          provide: EntityManager,
          useValue: {
            upsert: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<DriversService>(DriversService);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertDriverWithTransaction', () => {
    it('should call manager.upsert with correct parameters', async () => {
      const mockDrivers: Partial<Driver>[] = [
        { driverId: '1', familyName: 'driver 1' },
        { driverId: '2', familyName: 'driver 2' },
      ];

      await service.upsertDriversWithTransaction(mockDrivers, entityManager);

      expect(entityManager.upsert).toHaveBeenCalledWith(Driver, mockDrivers, [
        'driverId',
      ]);
    });

    it('should handle empty array input', async () => {
      await service.upsertDriversWithTransaction([], entityManager);
      expect(entityManager.upsert).toHaveBeenCalledWith(
        Driver,
        [],
        ['driverId'],
      );
    });

    it('should propagate errors from manager.upsert', async () => {
      const error = new Error('Database error');

      (entityManager.upsert as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        service.upsertDriversWithTransaction(
          [{ driverId: '1' }],
          entityManager,
        ),
      ).rejects.toThrow(error);
    });
  });
});
