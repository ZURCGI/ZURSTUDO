// src/analytics/analytics.controller.ts
import { Controller, Get, UseGuards, Req, Body, Post, Logger } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/dto/user-payload.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);
  
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiOperation({
    summary: '取得訪客統計',
    description: '取得各國訪客統計資料',
  })
  @ApiResponse({ status: 200, description: '訪客統計資料' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('visit-stats')
  async getVisitStats(@Req() req: AuthenticatedRequest) {
    this.logger.debug(
      'VisitStats Authorization header:',
      req.headers['authorization'],
    );
    this.logger.debug('VisitStats Cookies:', req.cookies);
    this.logger.debug('VisitStats User:', req.user);
    return this.analyticsService.getVisitStats();
  }

  @ApiOperation({
    summary: '取得儀表板統計',
    description: '取得儀表板完整統計資料',
  })
  @ApiResponse({ status: 200, description: '儀表板統計資料' })
  @ApiResponse({ status: 401, description: '未授權' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboardStats() {
    return this.analyticsService.getFullStats();
  }

  // GET /analytics/total-visits - 總訪問量
  @UseGuards(JwtAuthGuard)
  @Get('total-visits')
  async getTotalVisits() {
    return { totalVisits: await this.analyticsService.getTotalVisits() };
  }

  // GET /analytics/today-visits - 今日訪問量
  @UseGuards(JwtAuthGuard)
  @Get('today-visits')
  async getTodayVisits() {
    return { todayVisits: await this.analyticsService.getTodayVisits() };
  }

  // GET /analytics/weekly-visits - 本週訪問量
  @UseGuards(JwtAuthGuard)
  @Get('weekly-visits')
  async getWeeklyVisits() {
    return { weeklyVisits: await this.analyticsService.getWeeklyVisits() };
  }

  // GET /analytics/visit-trend - 訪問趨勢
  @UseGuards(JwtAuthGuard)
  @Get('visit-trend')
  async getVisitTrend() {
    return this.analyticsService.getVisitTrend();
  }

  // GET /analytics/top-countries - 熱門國家
  @UseGuards(JwtAuthGuard)
  @Get('top-countries')
  async getTopCountries() {
    return this.analyticsService.getTopCountries();
  }

  // 新增：前端上報停留時間
  @Post('visit-duration')
  async reportVisitDuration(@Body() body: { ip: string; country: string; duration: number }) {
    await this.analyticsService.logVisitDuration(body.ip, body.country, body.duration);
    return { success: true };
  }
}
