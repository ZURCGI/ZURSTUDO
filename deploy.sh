#!/bin/bash

# 🚀 ZUR 專案部屬腳本
# 執行: ./deploy.sh

set -e  # 遇到錯誤立即停止

echo "🚀 開始部屬 ZUR 專案..."

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查函數
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ 錯誤: $1 未安裝${NC}"
        exit 1
    fi
}

# 檢查必要工具
echo "📋 檢查必要工具..."
check_command "node"
check_command "npm"
check_command "git"

# 1. 安全檢查
echo -e "\n${YELLOW}🔒 執行安全檢查...${NC}"
if [ -f "backend/pre-deploy-security.js" ]; then
    cd backend
    node pre-deploy-security.js
    cd ..
else
    echo -e "${YELLOW}⚠️  警告: 找不到安全檢查腳本${NC}"
fi

# 2. 環境變數檢查
echo -e "\n${YELLOW}📋 檢查環境變數...${NC}"
required_vars=("JWT_SECRET" "DATABASE_URL" "CLOUDINARY_API_KEY" "CLOUDINARY_API_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ 缺少環境變數:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo -e "${YELLOW}請設定這些環境變數後再部屬${NC}"
    exit 1
else
    echo -e "${GREEN}✅ 所有環境變數已設定${NC}"
fi

# 3. 後端部屬
echo -e "\n${YELLOW}🔧 部屬後端...${NC}"
cd backend

# 安裝依賴
echo "📦 安裝依賴..."
npm install

# 建置
echo "🔨 建置專案..."
npm run build

# 測試
echo "🧪 執行測試..."
npm test

cd ..

# 4. 前端部屬
echo -e "\n${YELLOW}🎨 部屬前端...${NC}"
cd frontend

# 安裝依賴
echo "📦 安裝依賴..."
npm install

# 建置
echo "🔨 建置專案..."
npm run build

cd ..

# 5. 最終檢查
echo -e "\n${YELLOW}✅ 最終檢查...${NC}"

# 檢查建置檔案
if [ -d "backend/dist" ]; then
    echo -e "${GREEN}✅ 後端建置成功${NC}"
else
    echo -e "${RED}❌ 後端建置失敗${NC}"
    exit 1
fi

if [ -d "frontend/.output" ]; then
    echo -e "${GREEN}✅ 前端建置成功${NC}"
else
    echo -e "${RED}❌ 前端建置失敗${NC}"
    exit 1
fi

# 6. 部屬完成
echo -e "\n${GREEN}🎉 部屬完成！${NC}"
echo -e "${YELLOW}下一步:${NC}"
echo "1. 設定生產環境伺服器"
echo "2. 配置域名和 SSL"
echo "3. 設定資料庫"
echo "4. 啟動服務"

# 7. 啟動指令
echo -e "\n${YELLOW}啟動指令:${NC}"
echo "後端: cd backend && npm run start:prod"
echo "前端: cd frontend && npm run preview"

echo -e "\n${GREEN}🚀 部屬腳本執行完成！${NC}" 