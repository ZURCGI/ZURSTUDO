# Render 快取清理指南

## 問題描述
Render 部署時出現以下錯誤：
```
gzip: stdin: invalid compressed data--format violated
tar: Unexpected EOF in archive
tar: Unexpected EOF in archive
tar: Error is not recoverable: exiting now
```

這表示 Render 的快取檔案已損壞。

## 解決方案

### 方法 1: 在 Render Dashboard 中清理快取
1. 登入 Render Dashboard
2. 找到你的專案 (ZURSTUDO)
3. 點擊 "Settings" 標籤
4. 找到 "Build & Deploy" 區塊
5. 點擊 "Clear build cache" 按鈕
6. 重新部署

### 方法 2: 強制重新部署
1. 在 Render Dashboard 中
2. 點擊 "Manual Deploy" 
3. 選擇 "Clear cache & deploy"

### 方法 3: 如果上述方法無效
1. 暫時重命名專案
2. 創建新的 Render 服務
3. 重新連接 GitHub 倉庫

## 預防措施
- 定期清理快取
- 避免在部署過程中中斷
- 使用穩定的網路連接

## 當前修復
已改進錯誤處理機制：
- 更好的 429 錯誤處理
- 改進的 LOAD MORE 功能
- 更詳細的錯誤日誌