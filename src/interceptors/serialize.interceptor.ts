import { CallHandler, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class SerializeInterceptor<T> implements NestInterceptor<any, T> {
  constructor(private readonly dto: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<T> {
    return handler.handle().pipe(
      map((data: any) => {
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true, // exclude the properties that are not in the Dto
        });
      }),
    );
  }
}
