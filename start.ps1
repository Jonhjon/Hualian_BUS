# Hualien Bus Booking System - Start Script
# Right-click -> Run with PowerShell

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host '=== 花蓮縣復康巴士預約系統啟動中 ===' -ForegroundColor Cyan

# Check .env
$EnvFile = Join-Path $ProjectDir '.env'
if (Test-Path $EnvFile) {
    $EnvContent = Get-Content $EnvFile -Raw
    if ($EnvContent -notmatch 'JWT_SECRET=\S') {
        Write-Host ''
        Write-Host '[錯誤] 請先設定 JWT_SECRET！' -ForegroundColor Red
        Write-Host '請編輯此檔案並填入隨機密鑰：' -ForegroundColor Yellow
        Write-Host "  $EnvFile" -ForegroundColor Yellow
        Write-Host ''
        Read-Host '設定完成後按 Enter 繼續'
    }
} else {
    Write-Host '[錯誤] 找不到 .env 檔案，請先建立 .env' -ForegroundColor Red
    Read-Host '按 Enter 結束'
    exit 1
}

# Install npm packages if node_modules missing
$NodeModules = Join-Path $ProjectDir 'node_modules'
if (-not (Test-Path $NodeModules)) {
    Write-Host ''
    Write-Host '[1/3] 安裝 npm 套件...' -ForegroundColor Yellow
    Set-Location $ProjectDir
    npm.cmd install
    if ($LASTEXITCODE -ne 0) {
        Write-Host '[錯誤] npm install 失敗' -ForegroundColor Red
        Read-Host '按 Enter 結束'
        exit 1
    }
} else {
    Write-Host '[1/3] npm 套件已安裝' -ForegroundColor Green
}

# Generate Prisma Client
Write-Host ''
Write-Host '[2/3] 產生 Prisma Client...' -ForegroundColor Yellow
Set-Location $ProjectDir
npm.cmd run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host '      [警告] Prisma 產生失敗，繼續啟動' -ForegroundColor Yellow
} else {
    Write-Host '      Prisma Client 就緒' -ForegroundColor Green
}

# Start Next.js dev server in new window
Write-Host ''
Write-Host '[3/3] 啟動 Next.js 開發伺服器...' -ForegroundColor Yellow

$devScript = "Set-Location '$ProjectDir'; npm.cmd run dev"
$devProc = Start-Process powershell -ArgumentList '-NoExit', '-Command', $devScript -PassThru

# Save PID for stop.ps1
$pidFile = Join-Path $ProjectDir '.running_pids'
@{ DevPID = $devProc.Id } | ConvertTo-Json | Set-Content $pidFile

Write-Host '      等待伺服器啟動（5 秒）...'
Start-Sleep -Seconds 5

$listening = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
    Write-Host ''
    Write-Host '[錯誤] 伺服器未成功啟動，請查看剛開啟的 PowerShell 視窗錯誤訊息。' -ForegroundColor Red
    Write-Host '也可以手動執行：npm.cmd run dev' -ForegroundColor Yellow
    exit 1
}

Write-Host ''
Write-Host '=== 系統啟動完成！===' -ForegroundColor Green
Write-Host ''
Write-Host '請在瀏覽器開啟：' -ForegroundColor White
Write-Host '  系統首頁：http://localhost:3000' -ForegroundColor Cyan
Write-Host '  登入頁面：http://localhost:3000/login' -ForegroundColor Cyan
Write-Host '  申請頁面：http://localhost:3000/register' -ForegroundColor Cyan
Write-Host ''
Write-Host '測試帳號：testuser / Password123' -ForegroundColor Yellow
Write-Host '關閉系統：執行 .\stop.ps1' -ForegroundColor Gray
Write-Host ''

Start-Process 'http://localhost:3000'
