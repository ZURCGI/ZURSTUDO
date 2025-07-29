# 登入測試指南

## 問題診斷

### 1. 後端服務狀態
✅ 後端服務正在運行 (http://localhost:3000)
✅ API 端點正常響應
❌ 登入憑證問題

### 2. API 測試結果
```bash
# 測試登入端點
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### 3. 預期響應
- **成功**: `{"access_token": "..."}`
- **失敗**: `{"statusCode": 401, "message": "使用者或密碼錯誤"}`

## 解決方案

### 方案 1: 檢查後端用戶數據庫
1. 確認後端數據庫中有用戶記錄
2. 檢查用戶名和密碼是否正確
3. 確認密碼是否已正確加密

### 方案 2: 創建測試用戶
如果後端支持用戶註冊，可以創建測試用戶：

```bash
# 註冊新用戶（如果後端支持）
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 方案 3: 檢查環境變數
確保後端有正確的環境變數：
- 數據庫連接
- JWT 密鑰
- 用戶認證配置

## 前端修復

已修復前端錯誤處理：
- ✅ 添加了 401 錯誤的專門處理
- ✅ 改善了錯誤訊息顯示
- ✅ 添加了更詳細的日誌記錄

## 測試步驟

1. **檢查後端服務**:
   ```bash
   curl -I http://localhost:3000
   ```

2. **測試登入端點**:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'
   ```

3. **檢查前端錯誤處理**:
   - 打開瀏覽器開發者工具
   - 嘗試登入
   - 查看控制台錯誤訊息

## 常見問題

### Q: 為什麼顯示 "Failed to fetch"？
A: 這通常是網絡連接問題，但現在已確認是 401 認證錯誤。

### Q: 如何重置密碼？
A: 需要檢查後端是否提供密碼重置功能。

### Q: 如何創建新用戶？
A: 需要檢查後端是否提供用戶註冊功能。