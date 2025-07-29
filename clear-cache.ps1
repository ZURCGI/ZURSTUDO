# Clear Cache Script for ZUR Project
# This script removes all cache directories that might be corrupted

Write-Host "🧹 Clearing cache directories..." -ForegroundColor Yellow

# Clear frontend cache
if (Test-Path "frontend\.nuxt") {
    Remove-Item -Recurse -Force "frontend\.nuxt"
    Write-Host "✅ Removed frontend\.nuxt" -ForegroundColor Green
}

if (Test-Path "frontend\.output") {
    Remove-Item -Recurse -Force "frontend\.output"
    Write-Host "✅ Removed frontend\.output" -ForegroundColor Green
}

if (Test-Path "frontend\node_modules\.cache") {
    Remove-Item -Recurse -Force "frontend\node_modules\.cache"
    Write-Host "✅ Removed frontend\node_modules\.cache" -ForegroundColor Green
}

# Clear backend cache
if (Test-Path "backend\node_modules") {
    Remove-Item -Recurse -Force "backend\node_modules"
    Write-Host "✅ Removed backend\node_modules" -ForegroundColor Green
}

if (Test-Path "backend\dist") {
    Remove-Item -Recurse -Force "backend\dist"
    Write-Host "✅ Removed backend\dist" -ForegroundColor Green
}

# Clear npm cache globally
Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "✅ Cache clearing completed!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm install (in both frontend and backend directories)" -ForegroundColor White
Write-Host "2. Run: npm run build (in both directories)" -ForegroundColor White
Write-Host "3. Try your deployment again" -ForegroundColor White