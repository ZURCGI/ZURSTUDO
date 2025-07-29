# 登入測試指南

## 問題診斷

### 1. 後端服務狀態
✅ 後端服務正在運行 (http://localhost:3000)
✅ API 端點正常響應
✅ 登入憑證已確認

### 2. 登入憑證
```bash
# 測試登入端點
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"[請查看後端測試文件或環境變數]"}'
```

### 3. 預期響應
- **成功**: `{"success": true, "access_token": "..."}`
- **失敗**: `{"statusCode": 401, "message": "使用者或密碼錯誤"}`

## 解決方案

### ✅ 已確認的登入憑證
- **用戶名**: `admin`
- **密碼**: 請查看後端測試文件或環境變數

### 前端修復

已修復前端錯誤處理：
- ✅ 添加了 401 錯誤的專門處理
- ✅ 改善了錯誤訊息顯示
- ✅ 添加了更詳細的日誌記錄
- ✅ 支持 `access_token` 和 `success` 響應格式

## 測試步驟

1. **檢查後端服務**:
   ```bash
   curl -I http://localhost:3000
   ```

2. **測試登入端點**:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"[正確密碼]"}'
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

### Q: 默認密碼是什麼？
A: 請查看後端測試文件或環境變數中的 `DEFAULT_ADMIN_PASSWORD`。