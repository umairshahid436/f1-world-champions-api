import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response: ApiResponse<T> = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data,
          message: 'Success',
        };
        if (Array.isArray(data)) {
          response.count = data.length;
        }

        return response;
      }),
    );
  }
}
