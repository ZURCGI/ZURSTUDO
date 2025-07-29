import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export class ConfigValidator {
  private static readonly logger = new Logger(ConfigValidator.name);

  static validateJwtConfig(configService: ConfigService): void {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    const nodeEnv = configService.get<string>('NODE_ENV');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is required');
    }

    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    // 檢查是否為默認值
    if (jwtSecret.includes('zur_studio_secure_jwt_secret')) {
      this.logger.warn('⚠️ 警告: 使用默認 JWT_SECRET，建議在生產環境中更改');
    }

    this.logger.log('✅ JWT 配置驗證通過');
  }

  static validateDatabaseConfig(configService: ConfigService): void {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    const nodeEnv = configService.get<string>('NODE_ENV');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }

    // 檢查資料庫 URL 格式
    if (!databaseUrl.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    this.logger.log('✅ 資料庫配置驗證通過');
  }

  static validateCloudinaryConfig(configService: ConfigService): void {
    const cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required');
    }

    this.logger.log('✅ Cloudinary 配置驗證通過');
  }

  static validateEnvironmentConfig(configService: ConfigService): void {
    const nodeEnv = configService.get<string>('NODE_ENV');
    const frontendUrl = configService.get<string>('FRONTEND_URL');

    if (!nodeEnv) {
      throw new Error('NODE_ENV is required');
    }

    if (!['development', 'production', 'test'].includes(nodeEnv)) {
      throw new Error('NODE_ENV must be one of: development, production, test');
    }

    if (!frontendUrl) {
      this.logger.warn('⚠️ 警告: FRONTEND_URL not set, using default');
    }

    this.logger.log(`✅ 環境配置驗證通過 - NODE_ENV: ${nodeEnv}`);
  }

  static validateAllConfig(configService: ConfigService): void {
    this.logger.log('🔍 開始配置驗證...');

    try {
      this.validateJwtConfig(configService);
      this.validateDatabaseConfig(configService);
      this.validateCloudinaryConfig(configService);
      this.validateEnvironmentConfig(configService);

      this.logger.log('🎉 所有配置驗證通過！');
    } catch (error) {
      this.logger.error('❌ 配置驗證失敗:', error.message);
      throw error;
    }
  }
} 