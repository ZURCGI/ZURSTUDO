# Fix Deployment Script for ZUR Project
# This script addresses cache corruption issues and provides deployment alternatives

param(
    [string]$Action = "clean",
    [switch]$SkipCache = $false,
    [switch]$ForceRebuild = $false
)

Write-Host "🚀 ZUR Project Deployment Fix Script" -ForegroundColor Cyan
Write-Host "Action: $Action" -ForegroundColor Yellow

switch ($Action) {
    "clean" {
        Write-Host "🧹 Step 1: Cleaning cache directories..." -ForegroundColor Yellow
        
        # Clear frontend cache
        $frontendCacheDirs = @(".nuxt", ".output", "node_modules\.cache")
        foreach ($dir in $frontendCacheDirs) {
            $path = "frontend\$dir"
            if (Test-Path $path) {
                Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
                Write-Host "✅ Removed $path" -ForegroundColor Green
            }
        }
        
        # Clear backend cache
        $backendCacheDirs = @("node_modules", "dist")
        foreach ($dir in $backendCacheDirs) {
            $path = "backend\$dir"
            if (Test-Path $path) {
                Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
                Write-Host "✅ Removed $path" -ForegroundColor Green
            }
        }
        
        # Clear npm cache
        Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
        npm cache clean --force
        
        Write-Host "✅ Cache cleaning completed!" -ForegroundColor Green
    }
    
    "install" {
        Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
        
        # Install backend dependencies
        Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
        Set-Location backend
        npm install --no-cache
        Set-Location ..
        
        # Install frontend dependencies
        Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
        Set-Location frontend
        npm install --no-cache
        Set-Location ..
        
        Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    }
    
    "build" {
        Write-Host "🔨 Step 3: Building project..." -ForegroundColor Yellow
        
        # Build backend
        Write-Host "Building backend..." -ForegroundColor Cyan
        Set-Location backend
        npm run build
        Set-Location ..
        
        # Build frontend
        Write-Host "Building frontend..." -ForegroundColor Cyan
        Set-Location frontend
        npm run build
        Set-Location ..
        
        Write-Host "✅ Build completed!" -ForegroundColor Green
    }
    
    "deploy" {
        Write-Host "🚀 Step 4: Deployment preparation..." -ForegroundColor Yellow
        
        # Create deployment-specific configurations
        Write-Host "Creating deployment configurations..." -ForegroundColor Cyan
        
        # Create a simplified render.yaml for deployment
        $renderConfig = @"
# Simplified render.yaml for deployment
services:
  - type: web
    name: zur-backend
    env: node
    rootDir: backend
    plan: free
    buildCommand: npm install --no-cache && npm run build
    startCommand: npm run start:prod
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000

  - type: web
    name: zur-frontend
    env: static
    rootDir: frontend
    plan: free
    buildCommand: npm install --no-cache && npm run build
    staticPublishPath: .output/public
    envVars:
      - key: NODE_ENV
        value: production

  - type: pserv
    name: zur-db
    plan: free
    ipAllowList: []
"@
        
        $renderConfig | Out-File -FilePath "render-simple.yaml" -Encoding UTF8
        Write-Host "✅ Created simplified render.yaml" -ForegroundColor Green
        
        Write-Host "📝 Deployment Instructions:" -ForegroundColor Cyan
        Write-Host "1. Use the simplified render.yaml for deployment" -ForegroundColor White
        Write-Host "2. Set environment variables in your deployment platform" -ForegroundColor White
        Write-Host "3. Consider using --no-cache flag in build commands" -ForegroundColor White
    }
    
    "full" {
        Write-Host "🔄 Running full deployment fix..." -ForegroundColor Yellow
        & $PSCommandPath -Action clean
        & $PSCommandPath -Action install
        & $PSCommandPath -Action build
        & $PSCommandPath -Action deploy
    }
    
    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Write-Host "Available actions: clean, install, build, deploy, full" -ForegroundColor Yellow
    }
}

Write-Host "✅ Script completed!" -ForegroundColor Green