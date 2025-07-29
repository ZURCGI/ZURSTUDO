# 🚀 部屬前安全檢查清單

## 📋 必須完成的項目

### 1. **環境變數設定** ⚠️ 重要
```bash
# 後端 .env 檔案
JWT_SECRET=your_very_strong_jwt_secret_here_min_32_chars
DATABASE_URL=your_production_database_url
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
DEFAULT_ADMIN_PASSWORD=your_strong_default_password

# 前端 .env 檔案
NUXT_PUBLIC_API_BASE=https://your-api-domain.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
HUGGINGFACE_API_KEY=your_hf_key
GEMINI_API_KEY=your_gemini_key
```

### 2. **移除開發環境設定**
- [ ] 移除 `set-env.ps1` 中的明文金鑰
- [ ] 確保 `.env` 檔案在 `.gitignore` 中
- [ ] 檢查所有 `console.log` 已清理
- [ ] 移除測試端點或加上認證

### 3. **生產環境配置**
- [ ] 設定 `NODE_ENV=production`
- [ ] 關閉 TypeORM `synchronize` 模式
- [ ] 設定正確的 CORS 域名
- [ ] 啟用 HTTPS
- [ ] 設定強密碼策略

### 4. **資料庫安全**
- [ ] 使用生產環境資料庫
- [ ] 設定資料庫連線池
- [ ] 啟用 SSL 連線
- [ ] 備份策略

### 5. **API 安全**
- [ ] 檢查 Rate Limiting 設定
- [ ] 確認 JWT 過期時間合理
- [ ] 測試認證端點
- [ ] 檢查檔案上傳限制

## 🔧 部屬前修改腳本

### 1. 更新 CORS 設定
```typescript
// backend/src/main.ts
const allowedOrigins = config.get<string>('NODE_ENV') === 'production' 
  ? [config.get<string>('FRONTEND_URL')] // 只允許生產域名
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];
```

### 2. 強化 JWT 設定
```typescript
// backend/src/auth/auth.service.ts
return {
  access_token: this.jwtService.sign(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
    issuer: 'zur-api',
    audience: 'zur-frontend',
  }),
};
```

### 3. 環境變數檢查
```typescript
// backend/src/main.ts
const requiredEnvVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## 🛡️ 安全測試清單

### 1. **認證測試**
```bash
# 測試登入
curl -X POST https://your-api.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'

# 測試未授權存取
curl https://your-api.com/media/list
```

### 2. **Rate Limiting 測試**
```bash
# 測試限制
for i in {1..110}; do 
  curl https://your-api.com/
done
```

### 3. **檔案上傳測試**
```bash
# 測試檔案大小限制
curl -X POST https://your-api.com/media/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@large_file.jpg"
```

## 📊 部屬檢查清單

### 環境設定
- [ ] 所有環境變數已設定
- [ ] 資料庫連線正常
- [ ] Cloudinary 設定正確
- [ ] 域名和 SSL 證書

### 安全設定
- [ ] JWT Secret 已設定且足夠強
- [ ] 預設管理員密碼已更改
- [ ] CORS 域名限制正確
- [ ] Rate Limiting 啟用

### 功能測試
- [ ] 登入功能正常
- [ ] 檔案上傳正常
- [ ] API 端點正常
- [ ] 前端連線正常

### 監控設定
- [ ] 錯誤日誌記錄
- [ ] 效能監控
- [ ] 安全警報
- [ ] 備份策略

## 🚨 緊急修復項目

如果發現安全問題，立即修復：

1. **JWT Secret 洩露**
   ```bash
   # 立即更換 JWT Secret
   export JWT_SECRET=new_very_strong_secret
   # 重啟服務
   ```

2. **API 金鑰洩露**
   ```bash
   # 立即更換 Cloudinary 金鑰
   # 重新生成 API 金鑰
   ```

3. **資料庫連線問題**
   ```bash
   # 檢查連線字串
   # 確認 SSL 設定
   ```

## 📝 部屬後檢查

### 24小時內
- [ ] 監控錯誤日誌
- [ ] 檢查效能指標
- [ ] 測試所有功能
- [ ] 確認安全設定

### 一週內
- [ ] 安全掃描
- [ ] 效能優化
- [ ] 用戶回饋收集
- [ ] 備份測試

---

**記住：安全是持續過程，不是一次性設定！** 