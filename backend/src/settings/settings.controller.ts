import { Controller, Get, Put, Body, Logger, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SiteSetting } from './entities/site-setting.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);
  
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({
    summary: '取得網站設定',
    description: '取得當前網站的所有設定',
  })
  @ApiResponse({ status: 200, description: '網站設定', type: SiteSetting })
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSetting(): Promise<SiteSetting> {
    this.logger.debug('GET /settings called');
    return this.settingsService.getSetting();
  }

  @ApiOperation({ summary: '更新網站設定', description: '更新網站設定' })
  @ApiResponse({
    status: 200,
    description: '更新後的網站設定',
    type: SiteSetting,
  })
  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateSetting(
    @Body() data: Partial<SiteSetting>,
  ): Promise<SiteSetting> {
    this.logger.debug('PUT /settings called', { data });
    return this.settingsService.updateSetting(data);
  }
}
