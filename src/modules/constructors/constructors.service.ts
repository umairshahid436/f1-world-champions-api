import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Constructor } from '../../database/entities/constructor.entity';

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
