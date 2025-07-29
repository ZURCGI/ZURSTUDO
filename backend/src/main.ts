// src/main.ts
import { config } from 'dotenv'
config({ path: '.env' })

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import helmet from 'helmet'
import { ValidationPipe, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { ConfigValidator } from './common/utils/config-validator.util'
import rateLimit from 'express-rate-limit'
import * as cookieParser from 'cookie-parser'
import * as compression from 'compression'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')

  // 驗證配置
  ConfigValidator.validateAllConfig(config)

  // 中間件配置
  app.use(compression())
  app.use(helmet())
  app.use(cookieParser())
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

  // CORS 配置
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:5173')
  const isProd = config.get<string>('NODE_ENV') === 'production'
  const origins = isProd ? [frontendUrl] : [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173']
  
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // 全域管道和過濾器
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  app.useGlobalFilters(new AllExceptionsFilter(logger))
  app.useGlobalInterceptors(new LoggingInterceptor())

  // Swagger 配置 (僅開發環境)
  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ZUR API')
      .setDescription('ZUR 效果圖與光雕視覺化專家 API 文檔')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    
    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api', app, document)
  }

  const port = config.get<number>('PORT', 3000)
  await app.listen(port)
  logger.log(`🚀 應用程式已啟動在 http://localhost:${port}`)
}

bootstrap().catch(err => {
  console.error('啟動失敗:', err)
  process.exit(1)
})
