import { Injectable, Logger } from '@nestjs/common';
import { Driver } from '@entities/driver.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(
    @InjectRepository(Driver)
    private readonly repository: Repository<Driver>,
  ) {}
  async upsertDriversWithTransaction(
    drivers: Partial<Driver>[],
    manager: EntityManager,
  ) {
    await manager.upsert(Driver, drivers, ['driverId']);
  }
}
