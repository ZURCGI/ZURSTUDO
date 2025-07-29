// src/analytics/analytics.module.ts
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Visit } from './entities/visit.entity';
import { GeoIpMiddleware } from './geoip.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Visit])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {
  configure(consumer: MiddlewareConsumer) {
    // 對所有 GET 請求套用 GeoIpMiddleware
    consumer
      .apply(GeoIpMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
