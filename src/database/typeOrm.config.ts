import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { config } from 'dotenv';
import { Constructor } from './entities/constructor.entity';
import { Driver } from './entities/driver.entity';
import { Race } from './entities/race.entity';
import { Season } from './entities/season.entity';

config({
  path: ['.env'],
});

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow('DB_HOST'),
  port: configService.getOrThrow('DB_PORT'),
  username: configService.getOrThrow('DB_USER'),
  password: configService.getOrThrow('DB_PASSWORD'),
  database: configService.getOrThrow('DB_NAME'),
  entities: [Season, Driver, Race, Constructor],
  synchronize: false,
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
