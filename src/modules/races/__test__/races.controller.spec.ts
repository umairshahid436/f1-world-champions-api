import { Test, TestingModule } from '@nestjs/testing';
import { RacesController } from '../races.controller';
import { RacesService } from '../services/races.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

// Mock data that matches the structure after serialization by RaceDto
const MOCK_SERIALIZED_RACES = [
  {
    name: 'Bahrain Grand Prix',
    circuitName: 'Bahrain International Circuit',
    date: '2023-03-05',
    time: '15:00:00Z',
    winnerDriver: {
      driverId: 'max_verstappen',
      name: 'Max Verstappen',
    },
  },
];

describe('RacesController', () => {
  let app: INestApplication;
  let racesService: RacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RacesController],
      providers: [
        {
          provide: RacesService,
          useValue: {
            getSeasonRaces: jest.fn().mockResolvedValue(MOCK_SERIALIZED_RACES),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    racesService = module.get<RacesService>(RacesService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /season/:year/races', () => {
    it('should call getSeasonRaces with the correct year and return serialized data', async () => {
      const year = 2023;

      await request(app.getHttpServer())
        .get(`/season/${year}/races`)
        .expect(200)
        .expect(MOCK_SERIALIZED_RACES);

      expect(racesService.getSeasonRaces).toHaveBeenCalledWith(year);
    });

    it('should return a 400 Bad Request if the year is not a valid integer', async () => {
      await request(app.getHttpServer()).get('/season/abc/races').expect(400);
    });

    it('should handle service errors gracefully', async () => {
      const year = 2023;
      const errorMessage = 'Internal Server Error';
      (racesService.getSeasonRaces as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await request(app.getHttpServer())
        .get(`/season/${year}/races`)
        .expect(500);
    });
  });
});
