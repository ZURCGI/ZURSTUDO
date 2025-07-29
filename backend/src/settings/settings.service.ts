import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from './entities/site-setting.entity';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  
  constructor(
    @InjectRepository(SiteSetting)
    private readonly repo: Repository<SiteSetting>,
  ) {}

  async getSetting(): Promise<SiteSetting> {
    let setting = await this.repo.findOne({ where: {} });
    if (!setting) {
      setting = this.repo.create();
      await this.repo.save(setting);
    }
    this.logger.debug('GetSetting return', { setting });
    return setting;
  }

  async updateSetting(data: Partial<SiteSetting>): Promise<SiteSetting> {
    let setting = await this.repo.findOne({ where: {} });
    if (!setting) {
      setting = this.repo.create();
    }
    Object.assign(setting, data);
    const saved = await this.repo.save(setting);
    this.logger.debug('UpdateSetting saved', { saved });
    return saved;
  }
}
