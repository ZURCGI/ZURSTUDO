// src/analytics/analytics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './entities/visit.entity';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Visit) private readonly visitRepo: Repository<Visit>,
  ) {}

  // Wrap individual stat functions to handle errors gracefully
  private async _getStat<T>(fetcher: () => Promise<T>, defaultValue: T, name: string): Promise<T> {
    try {
      return await fetcher();
    } catch (error) {
      this.logger.error(`Failed to fetch statistic: ${name}`, error.stack);
      return defaultValue;
    }
  }

  // Original methods remain the same
  async logVisit(ip: string, country: string) {
    const v = this.visitRepo.create({ ip, country });
    await this.visitRepo.save(v);
  }

  async logVisitDuration(ip: string, country: string, duration: number) {
    const v = this.visitRepo.create({ ip, country, duration });
    await this.visitRepo.save(v);
  }

  async getVisitStats() {
    const raw = await this.visitRepo
      .createQueryBuilder('v')
      .select('v.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .groupBy('v.country')
      .orderBy('count', 'DESC')
      .getRawMany<{ country: string; count: string }>();
    return raw.map((r) => ({ country: r.country, count: parseInt(r.count, 10) }));
  }

  async getTotalVisits() {
    return this.visitRepo.count();
  }

  async getTodayVisits() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.visitRepo.count({ where: { visitedAt: MoreThanOrEqual(today) } });
  }

  async getWeeklyVisits() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.visitRepo.count({ where: { visitedAt: MoreThanOrEqual(weekAgo) } });
  }

  async getVisitTrend() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    // Reverting to the original query as per user feedback that reverting fixes it.
    // The underlying issue is likely environmental or config-related, not the query logic itself.
    const raw = await this.visitRepo
      .createQueryBuilder('v')
      .select('DATE(v.visitedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('v.visitedAt >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('DATE(v.visitedAt)')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string }>();
    return raw.map((r) => ({ date: r.date, count: parseInt(r.count, 10) }));
  }

  async getTopCountries(limit: number = 10) {
    const raw = await this.visitRepo
      .createQueryBuilder('v')
      .select('v.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .groupBy('v.country')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany<{ country: string; count: string }>();
    return raw.map((r) => ({ country: r.country, count: parseInt(r.count, 10) }));
  }

  async getAverageDuration() {
    const result = await this.visitRepo
      .createQueryBuilder('v')
      .select('AVG(v.duration)', 'avg')
      .where('v.duration IS NOT NULL')
      .getRawOne<{ avg: string }>();
    const avg = result && result.avg ? Number(result.avg) : 0;
    return Math.round(avg);
  }

  // This is the new, resilient function
  async getFullStats() {
    const [ totalVisits, todayVisits, weeklyVisits, visitTrend, topCountries, countryStats, avgDuration ] = await Promise.all([
      this._getStat(() => this.getTotalVisits(), 0, 'getTotalVisits'),
      this._getStat(() => this.getTodayVisits(), 0, 'getTodayVisits'),
      this._getStat(() => this.getWeeklyVisits(), 0, 'getWeeklyVisits'),
      this._getStat(() => this.getVisitTrend(), [], 'getVisitTrend'),
      this._getStat(() => this.getTopCountries(), [], 'getTopCountries'),
      this._getStat(() => this.getVisitStats(), [], 'getVisitStats'),
      this._getStat(() => this.getAverageDuration(), 0, 'getAverageDuration'),
    ]);

    return {
      totalVisits,
      todayVisits,
      weeklyVisits,
      visitTrend,
      topCountries,
      countryStats,
      avgDuration,
    };
  }
}
