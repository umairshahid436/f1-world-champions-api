import { Injectable } from '@nestjs/common';
import { Constructor } from '@src/database/entities/constructor.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ConstructorsService {
  constructor(
    @InjectRepository(Constructor)
    private readonly repository: Repository<Constructor>,
  ) {}

  async upsertConstructorsWithTransaction(
    constructors: Partial<Constructor>[],
    manager: EntityManager,
  ) {
    await manager.upsert(Constructor, constructors, ['constructorId']);
  }
}
