// src/common/interceptors/monitoring.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

interface MonitoringMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowRequests: number;
}

@Injectable()
export class MonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MonitoringInterceptor.name);
  private metrics: MonitoringMetrics = {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    slowRequests: 0,
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const startTime = Date.now();

    this.metrics.requestCount++;

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        
        // 更新平均響應時間
        this.updateAverageResponseTime(duration);
        
        // 檢查慢請求
        if (duration > 2000) {
          this.metrics.slowRequests++;
          this.logger.warn(`慢請求警告: ${method} ${url} - ${duration}ms`);
        }
        
        // 記錄成功請求
        this.logger.log(`${method} ${url} - ${statusCode} - ${duration}ms`);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.metrics.errorCount++;
        
        // 記錄錯誤
        this.logger.error(`${method} ${url} - ERROR - ${duration}ms - ${error.message}`);
        
        // 檢查是否為安全相關錯誤
        if (error.status === 401 || error.status === 403) {
          this.logger.warn(`安全警告: 未授權訪問 ${method} ${url} from ${request.ip}`);
        }
        
        throw error;
      }),
    );
  }

  private updateAverageResponseTime(duration: number): void {
    const { requestCount, averageResponseTime } = this.metrics;
    this.metrics.averageResponseTime = 
      (averageResponseTime * (requestCount - 1) + duration) / requestCount;
  }

  getMetrics(): MonitoringMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      slowRequests: 0,
    };
  }
} 