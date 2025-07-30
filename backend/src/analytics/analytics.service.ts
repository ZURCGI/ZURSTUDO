// src/analytics/analytics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './entities/visit.entity';
import { MoreThanOrEqual } from 'typeorm';

// 手動建立一個從 ISO alpha-2 到 alpha-3 的轉換器
function convertCountryCode(alpha2: string): string {
  const conversionMap: { [key: string]: string } = {
    AF: 'AFG', AL: 'ALB', DZ: 'DZA', AS: 'ASM', AD: 'AND', AO: 'AGO',
    AR: 'ARG', AM: 'ARM', AU: 'AUS', AT: 'AUT', AZ: 'AZE', BS: 'BHS',
    BH: 'BHR', BD: 'BGD', BB: 'BRB', BY: 'BLR', BE: 'BEL', BZ: 'BLZ',
    BJ: 'BEN', BT: 'BTN', BO: 'BOL', BA: 'BIH', BW: 'BWA', BR: 'BRA',
    BN: 'BRN', BG: 'BGR', BF: 'BFA', BI: 'BDI', KH: 'KHM', CM: 'CMR',
    CA: 'CAN', CF: 'CAF', TD: 'TCD', CL: 'CHL', CN: 'CHN', CO: 'COL',
    KM: 'COM', CG: 'COG', CD: 'COD', CR: 'CRI', CI: 'CIV', HR: 'HRV',
    CU: 'CUB', CY: 'CYP', CZ: 'CZE', DK: 'DNK', DJ: 'DJI', DM: 'DMA',
    DO: 'DOM', EC: 'ECU', EG: 'EGY', SV: 'SLV', GQ: 'GNQ', ER: 'ERI',
    EE: 'EST', ET: 'ETH', FJ: 'FJI', FI: 'FIN', FR: 'FRA', GA: 'GAB',
    GM: 'GMB', GE: 'GEO', DE: 'DEU', GH: 'GHA', GR: 'GRC', GD: 'GRD',
    GT: 'GTM', GN: 'GIN', GW: 'GNB', GY: 'GUY', HT: 'HTI', HN: 'HND',
    HU: 'HUN', IS: 'ISL', IN: 'IND', ID: 'IDN', IR: 'IRN', IQ: 'IRQ',
    IE: 'IRL', IL: 'ISR', IT: 'ITA', JM: 'JAM', JP: 'JPN', JO: 'JOR',
    KZ: 'KAZ', KE: 'KEN', KW: 'KWT', KG: 'KGZ', LA: 'LAO', LV: 'LVA',
    LB: 'LBN', LS: 'LSO', LR: 'LBR', LY: 'LBY', LI: 'LIE', LT: 'LTU',
    LU: 'LUX', MK: 'MKD', MG: 'MDG', MW: 'MWI', MY: 'MYS', MV: 'MDV',
    ML: 'MLI', MT: 'MLT', MR: 'MRT', MU: 'MUS', MX: 'MEX', MD: 'MDA',
    MC: 'MCO', MN: 'MNG', ME: 'MNE', MA: 'MAR', MZ: 'MOZ', MM: 'MMR',
    NA: 'NAM', NP: 'NPL', NL: 'NLD', NZ: 'NZL', NI: 'NIC', NE: 'NER',
    NG: 'NGA', KP: 'PRK', NO: 'NOR', OM: 'OMN', PK: 'PAK', PA: 'PAN',
    PG: 'PNG', PY: 'PRY', PE: 'PER', PH: 'PHL', PL: 'POL', PT: 'PRT',
    QA: 'QAT', RO: 'ROU', RU: 'RUS', RW: 'RWA', KN: 'KNA', LC: 'LCA',
    VC: 'VCT', WS: 'WSM', SM: 'SMR', ST: 'STP', SA: 'SAU', SN: 'SEN',
    RS: 'SRB', SC: 'SYC', SL: 'SLE', SG: 'SGP', SK: 'SVK', SI: 'SVN',
    SB: 'SLB', SO: 'SOM', ZA: 'ZAF', KR: 'KOR', SS: 'SSD', ES: 'ESP',
    LK: 'LKA', SD: 'SDN', SR: 'SUR', SE: 'SWE', CH: 'CHE', SY: 'SYR',
    TW: 'TWN', TJ: 'TJK', TZ: 'TZA', TH: 'THA', TL: 'TLS', TG: 'TGO',
    TO: 'TON', TT: 'TTO', TN: 'TUN', TR: 'TUR', TM: 'TKM', UG: 'UGA',
    UA: 'UKR', AE: 'ARE', GB: 'GBR', US: 'USA', UY: 'URY', UZ: 'UZB',
    VU: 'VUT', VE: 'VEN', VN: 'VNM', YE: 'YEM', ZM: 'ZMB', ZW: 'ZWE',
    // 根據需要添加更多國家...
  };
  // 如果找不到匹配，返回原始的 alpha-2 碼，避免錯誤
  return conversionMap[alpha2] || alpha2;
}

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
    
    // 在這裡進行轉換
    return raw.map((r) => ({
      country: convertCountryCode(r.country), // 轉換為 alpha-3 代碼
      count: parseInt(r.count, 10)
    }));
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
