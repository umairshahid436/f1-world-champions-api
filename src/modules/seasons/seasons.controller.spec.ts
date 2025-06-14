import { Test, TestingModule } from '@nestjs/testing';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './services/seasons.service';
import { SeasonQueryDto } from './dtos/season-query.dto';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import * as request from 'supertest';

const MOCK_SEASONS = [
  {
    year: 2021,
    points: '395.5',
    championDriver: {
      driverId: 'max_verstappen',
      givenName: 'Max',
      familyName: 'Verstappen',
    },
    championConstructor: {
      constructorId: 'red_bull',
      name: 'Red Bull Racing',
    },
  },
];

const MOCK_SERIALIZED_RESPONSE = [
  {
    season: '2021',
    points: '395.5',
    championDriver: {
      driverId: 'max_verstappen',
      name: 'Max Verstappen',
    },
    championConstructor: {
      constructorId: 'red_bull',
      name: 'Red Bull Racing',
    },
  },
];

describe('SeasonsController', () => {
  let app: INestApplication;
  let seasonsService: SeasonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonsController],
      providers: [
        {
          provide: SeasonsService,
          useValue: {
            getSeasonsChampions: jest.fn().mockResolvedValue(MOCK_SEASONS),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    seasonsService = module.get<SeasonsService>(SeasonsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /seasons', () => {
    it('should call getSeasonsChampions with correct query parameters and return the result', async () => {
      const query: SeasonQueryDto = { fromYear: 2020, toYear: 2021 };

      await request(app.getHttpServer())
        .get('/seasons')
        .query(query)
        .expect(200)
        .expect(MOCK_SERIALIZED_RESPONSE);

      expect(seasonsService.getSeasonsChampions).toHaveBeenCalledWith(query);
    });

    it('should return a 400 Bad Request if fromYear is missing', async () => {
      await request(app.getHttpServer())
        .get('/seasons')
        .query({ toYear: 2021 })
        .expect(400);
    });

    it('should return a 400 Bad Request if toYear is missing', async () => {
      await request(app.getHttpServer())
        .get('/seasons')
        .query({ fromYear: 2020 })
        .expect(400);
    });

    it('should return a 400 Bad Request if fromYear is not an integer', async () => {
      await request(app.getHttpServer())
        .get('/seasons')
        .query({ fromYear: 'abc', toYear: 2021 })
        .expect(400);
    });

    it('should return a 400 Bad Request if toYear is out of range', async () => {
      await request(app.getHttpServer())
        .get('/seasons')
        .query({ fromYear: 2020, toYear: 1940 })
        .expect(400);
    });

    it('should handle service errors gracefully', async () => {
      const errorMessage = 'Internal Server Error';
      jest
        .spyOn(seasonsService, 'getSeasonsChampions')
        .mockRejectedValue(new Error(errorMessage));

      await request(app.getHttpServer())
        .get('/seasons')
        .query({ fromYear: 2020, toYear: 2021 })
        .expect(500);
    });
  });
});
