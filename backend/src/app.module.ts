import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MulterModule } from '@nestjs/platform-express'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { MediaModule } from './media/media.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { CloudinaryModule } from './upload/cloudinary.module'
import { SettingsModule } from './settings/settings.module'
import { RedisCacheModule } from './cache/cache.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('DATABASE_URL')
        if (!url) {
          throw new Error('無法取得 DATABASE_URL，請檢查 .env 是否正確')
        }

        return {
          type: 'postgres',
          url,
          synchronize: false,
          autoLoadEntities: true,
          ssl: { rejectUnauthorized: false },
          extra: {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            acquireTimeoutMillis: 60000,
          },
        }
      },
    }),

    MulterModule.register(),
    RedisCacheModule,
    UsersModule,
    AuthModule,
    MediaModule,
    AnalyticsModule,
    CloudinaryModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
