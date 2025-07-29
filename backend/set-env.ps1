# 設定環境變數腳本
# 請根據您的實際配置修改這些值

Write-Host "設定環境變數..." -ForegroundColor Green

# 1. 基本配置
$env:NODE_ENV = "development"
$env:PORT = "3000"

# 2. 資料庫配置
$env:DATABASE_URL = "postgresql://username:password@localhost:5432/zur_db"

# 3. JWT 配置
$env:JWT_SECRET = "your_very_strong_jwt_secret_here_min_32_chars"

# 4. Cloudinary 配置
$env:CLOUDINARY_CLOUD_NAME = "your_cloud_name"
$env:CLOUDINARY_API_KEY = "your_api_key"
$env:CLOUDINARY_API_SECRET = "your_api_secret"

Write-Host "環境變數已設定完成！" -ForegroundColor Green
Write-Host "請確保已正確設定所有敏感資訊" -ForegroundColor Yellow 