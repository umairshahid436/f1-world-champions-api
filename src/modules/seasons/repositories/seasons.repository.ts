import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Season } from '@entities/season.entity';
import { Driver } from '@entities/driver.entity';
import { Constructor } from '@entities/constructor.entity';

@Injectable()
export class SeasonsRepository {
  private readonly logger = new Logger(SeasonsRepository.name);

  constructor(
    @InjectRepository(Season)
    private readonly repository: Repository<Season>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByYearRange(fromYear: number, toYear: number): Promise<Season[]> {
    return this.repository
      .createQueryBuilder('season')
      .leftJoinAndSelect('season.champion_driver', 'driver')
      .leftJoinAndSelect('season.champion_constructor', 'constructor')
      .where('season.year BETWEEN :fromYear AND :toYear', { fromYear, toYear })
      .orderBy('season.year', 'DESC')
      .getMany();
  }

  async batchUpsertSeasonData(
    drivers: Partial<Driver>[],
    constructors: Partial<Constructor>[],
    seasons: Partial<Season>[],
  ): Promise<void> {
    const chunkSize = 1000;
    this.logger.log(
      `Starting batch upsert: ${drivers.length} drivers, ${constructors.length} constructors, ${seasons.length} seasons`,
    );

    try {
      await this.dataSource.transaction(async (manager) => {
        // Batch upsert drivers
        if (drivers.length > 0) {
          await this.batchUpsertDrivers(manager, drivers, chunkSize);
        }

        // Batch upsert constructors
        if (constructors.length > 0) {
          await this.batchUpsertConstructors(manager, constructors, chunkSize);
        }

        // Batch upsert seasons (must be last due to FK dependencies)
        if (seasons.length > 0) {
          await this.batchUpsertSeasons(manager, seasons, chunkSize);
        }
        return {
          drivers,
          constructors,
          seasons,
        };
      });

      this.logger.log(`Batch upsert completed)`);
    } catch (error) {
      this.logger.error('Batch upsert failed:', error);
      throw new Error(
        `Batch operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Private batch operation methods
  private async batchUpsertDrivers(
    manager: EntityManager,
    drivers: Partial<Driver>[],
    chunkSize: number,
  ): Promise<void> {
    for (let i = 0; i < drivers.length; i += chunkSize) {
      const chunk = drivers.slice(i, i + chunkSize);

      await manager
        .createQueryBuilder()
        .insert()
        .into(Driver)
        .values(chunk)
        .orUpdate(
          [
            'given_name',
            'family_name',
            'nationality',
            'permanent_number',
            'code',
            'url',
          ],
          ['id'],
        )
        .execute();
    }

    this.logger.debug(
      `Processed ${drivers.length} drivers in chunks of ${chunkSize}`,
    );
  }

  private async batchUpsertConstructors(
    manager: EntityManager,
    constructors: Partial<Constructor>[],
    chunkSize: number,
  ): Promise<void> {
    for (let i = 0; i < constructors.length; i += chunkSize) {
      const chunk = constructors.slice(i, i + chunkSize);

      await manager
        .createQueryBuilder()
        .insert()
        .into(Constructor)
        .values(chunk)
        .orUpdate(['name', 'nationality', 'url'], ['constructorId'])
        .execute();
    }

    this.logger.debug(
      `Processed ${constructors.length} constructors in chunks of ${chunkSize}`,
    );
  }

  private async batchUpsertSeasons(
    manager: EntityManager,
    seasons: Partial<Season>[],
    chunkSize: number,
  ): Promise<void> {
    for (let i = 0; i < seasons.length; i += chunkSize) {
      const chunk = seasons.slice(i, i + chunkSize);

      await manager
        .createQueryBuilder()
        .insert()
        .into(Season)
        .values(chunk)
        .orUpdate(
          [
            'round',
            'position',
            'positionText',
            'points',
            'wins',
            'champion_driver_id',
            'champion_constructor_id',
          ],
          ['year'],
        )
        .execute();
    }

    this.logger.debug(
      `Processed ${seasons.length} seasons in chunks of ${chunkSize}`,
    );
  }
}
