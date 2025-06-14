import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  getHealthStatus(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}
