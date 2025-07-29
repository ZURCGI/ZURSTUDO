# 環境變數配置

## 必需的環境變數

### API 配置
```bash
# API 基礎 URL
NUXT_PUBLIC_API_BASE=http://localhost:3000
```

### Cloudinary 配置
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 開發配置
```bash
NODE_ENV=development
```

## 設置步驟

1. 在 `frontend` 目錄下創建 `.env` 文件
2. 複製上述環境變數並填入正確的值
3. 重新啟動開發伺服器

## 注意事項

- `NUXT_PUBLIC_API_BASE` 必須設置為後端 API 的正確 URL
- 在生產環境中，請使用 HTTPS URL
- 確保後端服務正在運行