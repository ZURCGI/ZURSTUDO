# 媒體編輯者帳號設置指南

## 概述

本系統新增了專門的媒體編輯者角色 (`media_editor`)，這個角色只能進行媒體相關的操作，無法修改密碼，確保了系統的安全性。

## 功能特點

### 媒體編輯者權限
- ✅ 上傳圖片、影片、360度全景圖
- ✅ 編輯媒體描述和分類
- ✅ 刪除媒體檔案
- ✅ 批次操作（刪除、更新分類、更新描述、移動到資料夾、標籤）
- ✅ 搜尋和同步 Cloudinary 資源
- ❌ 修改密碼（被限制）
- ❌ 創建其他帳號
- ❌ 訪問 SEO 設定
- ❌ 訪問用戶管理

### 管理員權限
- ✅ 所有媒體編輯者權限
- ✅ 創建媒體編輯者帳號
- ✅ 創建管理員帳號
- ✅ 修改密碼
- ✅ 訪問所有後台功能

## 設置步驟

### 1. 後端設置

#### 1.1 運行資料庫遷移
```bash
cd backend
npm run migration:run
```

#### 1.2 重啟後端服務
```bash
npm run start:dev
```

### 2. 創建媒體編輯者帳號

#### 2.1 使用管理員帳號登入
- 訪問 `/admin/login`
- 使用管理員帳號登入

#### 2.2 創建媒體編輯者帳號
- 訪問 `/admin/user-management`
- 填寫媒體編輯者資訊：
  - 用戶名：例如 `media_editor_001`
  - 密碼：至少8個字符
  - 電子郵件（可選）

#### 2.3 創建管理員帳號（可選）
- 在同一頁面可以創建額外的管理員帳號
- 用於分權管理

### 3. 媒體編輯者使用

#### 3.1 登入
- 使用創建的媒體編輯者帳號登入 `/admin/login`

#### 3.2 可用功能
- **媒體庫** (`/admin/media-library`)：查看和管理所有媒體
- **上傳媒體** (`/admin/upload-media`)：上傳新的媒體檔案
- **修改密碼**：無法使用（會顯示錯誤訊息）

## API 端點

### 創建帳號端點
```
POST /users/create-media-editor
POST /users/create-admin
PATCH /users/change-password
```

### 媒體操作端點（需要 admin 或 media_editor 角色）
```
POST /media/upload-image
POST /media/upload-video
POST /media/upload-view360
PATCH /media/update/:type/:publicId
DELETE /media/:type/:publicId
POST /media/batch/delete
POST /media/batch/update-category
POST /media/batch/update-description
POST /media/batch/move-to-folder
POST /media/batch/tag
POST /media/sync
POST /media/sync-all
POST /media/search-sync
GET /media/search
```

## 安全考量

### 1. 角色權限分離
- 媒體編輯者無法修改密碼，防止帳號被濫用
- 管理員可以創建和管理所有帳號

### 2. API 權限控制
- 所有媒體操作都需要適當的角色權限
- 使用 JWT 和角色守衛進行雙重驗證

### 3. 密碼安全
- 所有密碼都使用 bcrypt 加密
- 密碼最小長度為8個字符

## 故障排除

### 1. 遷移失敗
如果資料庫遷移失敗，可能需要手動更新 enum：
```sql
ALTER TYPE "public"."users_role_enum" ADD VALUE 'media_editor';
```

### 2. 權限錯誤
確保用戶角色正確設置：
```sql
UPDATE users SET role = 'media_editor' WHERE username = 'your_username';
```

### 3. 前端路由問題
確保所有管理頁面都正確設置了 `requiresAuth: true`

## 最佳實踐

1. **定期更換密碼**：建議管理員定期更換媒體編輯者的密碼
2. **監控使用**：定期檢查媒體編輯者的操作記錄
3. **備份重要資料**：定期備份重要的媒體檔案
4. **權限最小化**：只給予必要的權限，避免過度授權

## 技術實現

### 後端架構
- **角色系統**：使用 TypeORM enum 和守衛
- **權限控制**：JWT + RolesGuard 雙重驗證
- **API 設計**：RESTful API 設計

### 前端架構
- **路由保護**：使用 Nuxt 中間件保護管理頁面
- **表單驗證**：前端和後端雙重驗證
- **用戶體驗**：即時反饋和錯誤處理

## 更新日誌

- **v1.0.0**：初始版本，支援基本的媒體編輯者角色
- 未來版本將支援更多角色和權限細分 