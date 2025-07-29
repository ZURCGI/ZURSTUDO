import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

// Regex to check for private and reserved IP ranges
const isPrivateIP = (ip: string): boolean => {
  const privateRanges = [
    /^(::f{4}:)?10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 10.0.0.0/8
    /^(::f{4}:)?127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, // 127.0.0.0/8 (localhost)
    /^(::f{4}:)?172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/, // 172.16.0.0/12
    /^(::f{4}:)?192\.168\.\d{1,3}\.\d{1,3}$/, // 192.168.0.0/16
    /^fe80::/, // Link-local
    /^::1$/, // Localhost IPv6
  ];
  return privateRanges.some((range) => range.test(ip));
};

@Injectable()
export class GeoIpMiddleware implements NestMiddleware {
  private readonly logger = new Logger(GeoIpMiddleware.name);
  private geoip;

  constructor(private readonly analyticsService: AnalyticsService) {
    this.initializeGeoIp();
  }

  private initializeGeoIp() {
    try {
      this.geoip = require('geoip-lite');
      this.logger.log('geoip-lite module loaded successfully.');
    } catch (error) {
      this.logger.error('Failed to load geoip-lite module. Geolocation will be disabled.', error.stack);
      this.geoip = null;
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0]
        : req.socket.remoteAddress || '';

    if (!ip || isPrivateIP(ip)) {
      return next();
    }

    let country = 'Unknown';
    if (this.geoip) {
      try {
        const geo = this.geoip.lookup(ip);
        country = geo?.country || 'Unknown';
      } catch (error) {
        this.logger.warn(`Failed to lookup IP ${ip}. Defaulting to Unknown.`, error.stack);
      }
    }

    this.analyticsService.logVisit(ip, country).catch(error => {
      this.logger.error(`Failed to log visit for IP ${ip}`, error.stack);
    });

    next();
  }
}
