# 🔧 配置文檔

## 📋 環境變數配置

### 必要環境變數

| 變數名稱 | 類型 | 必填 | 說明 | 範例 |
|---------|------|------|------|------|
| `NODE_ENV` | string | ✅ | 運行環境 | `development`, `production`, `test` |
| `DATABASE_URL` | string | ✅ | PostgreSQL 連接字串 | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | string | ✅ | JWT 簽名密鑰（至少32字符） | `your_very_long_secret_key_here` |
| `CLOUDINARY_CLOUD_NAME` | string | ✅ | Cloudinary 雲端名稱 | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | string | ✅ | Cloudinary API 金鑰 | `your_api_key` |
| `CLOUDINARY_API_SECRET` | string | ✅ | Cloudinary API 密鑰 | `your_api_secret` |

### 可選環境變數

| 變數名稱 | 類型 | 預設值 | 說明 |
|---------|------|--------|------|
| `FRONTEND_URL` | string | `http://localhost:5173` | 前端 URL |
| `DEFAULT_ADMIN_PASSWORD` | string | `Roguery@099` | 預設管理員密碼 |
| `PORT` | number | `3000` | 後端服務端口 |

## 🔐 JWT 配置一致性

### 統一配置
```typescript
// auth.module.ts
JwtModule.registerAsync({
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { 
      expiresIn: '7d',        // 統一為 7 天
      issuer: 'zur-api',      // 統一 issuer
      audience: 'zur-frontend', // 統一 audience
      algorithm: 'HS256',      // 統一算法
    },
  }),
}),
```

### 安全要求
- JWT Secret 必須至少 32 字符
- 生產環境必須使用強密鑰
- 不允許使用默認密鑰

## 🌐 CORS 配置

### 開發環境
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];
```

### 生產環境
```typescript
const allowedOrigins = [
  config.get<string>('FRONTEND_URL')
];
```

## 📊 日誌配置

### 安全日誌
- 認證事件記錄
- 敏感操作記錄
- API 請求記錄（不包含敏感資訊）
- 錯誤日誌記錄

### 日誌級別
- `development`: 詳細日誌
- `production`: 僅錯誤和警告
- `test`: 最小日誌

## 🔒 安全配置

### Rate Limiting
```typescript
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 每個 IP 15 分鐘最多 100 次請求
  standardHeaders: true,
  legacyHeaders: false,
})
```

### Cookie 安全
```typescript
res.cookie('auth-token', access_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
});
```

## 🚀 部署檢查清單

### 環境變數
- [ ] 所有必要環境變數已設定
- [ ] JWT_SECRET 符合安全要求
- [ ] 資料庫連接字串正確
- [ ] Cloudinary 配置正確

### 安全設定
- [ ] NODE_ENV 設為 production
- [ ] CORS 域名限制正確
- [ ] Rate Limiting 啟用
- [ ] HTTPS 啟用（生產環境）

### 配置驗證
- [ ] 運行配置驗證工具
- [ ] 檢查所有配置一致性
- [ ] 確認日誌配置正確

## 🔍 配置驗證

### 自動驗證
應用程序啟動時會自動驗證：
- JWT 配置
- 資料庫配置
- Cloudinary 配置
- 環境配置

### 手動驗證
```bash
# 運行配置驗證
node -e "
const { ConfigValidator } = require('./dist/common/utils/config-validator.util');
const { ConfigService } = require('@nestjs/config');
const config = new ConfigService();
ConfigValidator.validateAllConfig(config);
"
```

## 📝 配置範例

### 開發環境 (.env)
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/zur_dev
JWT_SECRET=your_development_jwt_secret_here_min_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
DEFAULT_ADMIN_PASSWORD=dev_password_123
```

### 生產環境 (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/zur_prod
JWT_SECRET=your_production_jwt_secret_here_min_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://your-domain.com
DEFAULT_ADMIN_PASSWORD=your_strong_production_password
``` 