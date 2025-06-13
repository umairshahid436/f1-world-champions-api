import { Test, TestingModule } from '@nestjs/testing';
import { ConstructorsService } from './constructors.service';
import { Constructor } from '../../database/entities/constructor.entity';
import { EntityManager } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ConstructorsService', () => {
  let service: ConstructorsService;
  let entityManager: EntityManager;
  let upsertSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstructorsService,
        {
          provide: getRepositoryToken(Constructor),
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

    service = module.get<ConstructorsService>(ConstructorsService);
    entityManager = module.get<EntityManager>(EntityManager);

    upsertSpy = jest.spyOn(entityManager, 'upsert');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertConstructorsWithTransaction', () => {
    it('should call manager.upsert with correct parameters', async () => {
      const mockConstructors: Partial<Constructor>[] = [
        { constructorId: '1', name: 'Constructor 1' },
        { constructorId: '2', name: 'Constructor 2' },
      ];

      await service.upsertConstructorsWithTransaction(
        mockConstructors,
        entityManager,
      );

      expect(upsertSpy).toHaveBeenCalledTimes(1);
      expect(upsertSpy).toHaveBeenCalledWith(Constructor, mockConstructors, [
        'constructorId',
      ]);
    });

    it('should handle empty array input', async () => {
      await service.upsertConstructorsWithTransaction([], entityManager);

      expect(upsertSpy).toHaveBeenCalledTimes(1);
      expect(upsertSpy).toHaveBeenCalledWith(
        Constructor,
        [],
        ['constructorId'],
      );
    });

    it('should propagate errors from manager.upsert', async () => {
      const error = new Error('Database error');
      upsertSpy.mockRejectedValueOnce(error);

      await expect(
        service.upsertConstructorsWithTransaction(
          [{ constructorId: '1' }],
          entityManager,
        ),
      ).rejects.toThrow(error);
    });
  });
});
