# ZUR 專案 Render 部署指南

## 概述

這個專案包含三個主要服務：
1. **後端服務** (NestJS) - 提供 API 服務
2. **前端服務** (Nuxt.js) - 提供使用者介面
3. **資料庫服務** (PostgreSQL) - 儲存資料

## 部署前準備

### 1. 環境變數設定

#### 後端環境變數 (在 Render Dashboard 中設定)
- `NODE_ENV`: production
- `DATABASE_URL`: 自動從 PostgreSQL 服務取得
- `JWT_SECRET`: 自動生成
- `PORT`: 10000
- `FRONTEND_URL`: 自動從前端服務取得
- `CLOUDINARY_CLOUD_NAME`: 需要手動設定
- `CLOUDINARY_API_KEY`: 需要手動設定
- `CLOUDINARY_API_SECRET`: 需要手動設定
- `DEFAULT_ADMIN_PASSWORD`: admin123 (可修改)
- `REDIS_URL`: redis://localhost:6379

#### 前端環境變數 (在 Render Dashboard 中設定)
- `NODE_ENV`: production
- `NUXT_PUBLIC_API_BASE`: 自動從後端服務取得
- `CLOUDINARY_CLOUD_NAME`: 需要手動設定
- `CLOUDINARY_DEFAULT_IMAGE`: 預設圖片 URL
- `GEMINI_API_KEY`: 需要手動設定 (AI 功能)
- `HUGGINGFACE_API_KEY`: 需要手動設定 (AI 功能)

### 2. 必要的外部服務設定

#### Cloudinary 設定
1. 註冊 [Cloudinary](https://cloudinary.com/) 帳號
2. 取得以下資訊：
   - Cloud Name
   - API Key
   - API Secret
3. 在 Render Dashboard 中設定對應的環境變數

#### AI API 金鑰 (可選)
- **Gemini API Key**: 用於 AI 建議功能
- **Hugging Face API Key**: 用於 AI 建議功能

## 部署步驟

### 1. 連接到 GitHub
1. 在 Render Dashboard 中點擊 "New +"
2. 選擇 "Blueprint"
3. 連接你的 GitHub 倉庫
4. 選擇包含 `render.yaml` 的倉庫

### 2. 設定環境變數
在每個服務部署前，需要在 Render Dashboard 中設定以下環境變數：

#### 後端服務 (zur-backend)
```
CLOUDINARY_CLOUD_NAME=你的cloudinary_cloud_name
CLOUDINARY_API_KEY=你的cloudinary_api_key
CLOUDINARY_API_SECRET=你的cloudinary_api_secret
```

#### 前端服務 (zur-frontend)
```
CLOUDINARY_CLOUD_NAME=你的cloudinary_cloud_name
GEMINI_API_KEY=你的gemini_api_key (可選)
HUGGINGFACE_API_KEY=你的huggingface_api_key (可選)
```

### 3. 部署順序
1. **PostgreSQL 資料庫** 會首先部署
2. **後端服務** 會自動部署並連接到資料庫
3. **前端服務** 會最後部署並連接到後端

## 部署後檢查

### 1. 健康檢查
- 後端健康檢查: `https://your-backend-url.onrender.com/health`
- 前端健康檢查: `https://your-frontend-url.onrender.com`

### 2. 功能測試
1. 訪問前端 URL
2. 測試管理員登入 (預設帳號: admin, 密碼: admin123)
3. 測試檔案上傳功能
4. 測試 AI 建議功能 (如果設定了 API 金鑰)

### 3. 資料庫檢查
1. 在 Render Dashboard 中檢查 PostgreSQL 服務狀態
2. 確認資料庫連接正常

## 常見問題

### 1. 部署失敗
- 檢查環境變數是否正確設定
- 確認 GitHub 倉庫權限
- 檢查 build 日誌中的錯誤訊息

### 2. 服務無法啟動
- 檢查 PORT 設定是否正確
- 確認資料庫連接字串
- 檢查 JWT_SECRET 是否生成

### 3. 前端無法連接後端
- 確認 `NUXT_PUBLIC_API_BASE` 環境變數
- 檢查 CORS 設定
- 確認後端服務 URL 是否正確

### 4. 檔案上傳失敗
- 確認 Cloudinary 設定是否正確
- 檢查 API 金鑰權限
- 確認檔案大小限制

## 安全注意事項

1. **環境變數安全**
   - 不要在程式碼中硬編碼敏感資訊
   - 使用 Render 的環境變數功能
   - 定期更換 API 金鑰

2. **資料庫安全**
   - 定期備份資料庫
   - 監控資料庫連接數
   - 使用強密碼

3. **應用程式安全**
   - 啟用 HTTPS
   - 設定適當的 CORS 政策
   - 監控應用程式日誌

## 監控和維護

### 1. 日誌監控
- 在 Render Dashboard 中查看服務日誌
- 設定日誌警報
- 定期檢查錯誤日誌

### 2. 效能監控
- 監控服務回應時間
- 檢查記憶體使用量
- 監控資料庫效能

### 3. 備份策略
- 定期備份資料庫
- 備份重要設定檔案
- 測試恢復程序

## 更新部署

### 1. 自動部署
- 推送到 GitHub 主分支會觸發自動部署
- 確保測試通過後再合併到主分支

### 2. 手動部署
- 在 Render Dashboard 中手動觸發部署
- 檢查部署日誌
- 測試新功能

## 聯絡支援

如果遇到部署問題：
1. 檢查 Render 官方文件
2. 查看服務日誌
3. 聯繫 Render 支援團隊

---

**注意**: 這個部署指南會根據專案需求進行更新。請定期檢查最新版本。