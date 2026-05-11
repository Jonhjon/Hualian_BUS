# Hualien Bus Booking System - Stop Script
# Can run standalone or called by start.ps1

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $ProjectDir '.running_pids'

Write-Host '正在關閉系統...' -ForegroundColor Yellow

# Kill by saved PID
if (Test-Path $pidFile) {
    $pids = Get-Content $pidFile | ConvertFrom-Json
    if ($pids.DevPID) {
        $proc = Get-Process -Id $pids.DevPID -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  終止開發伺服器視窗 (PID $($pids.DevPID))..." -ForegroundColor DarkGray
            Stop-Process -Id $pids.DevPID -Force -ErrorAction SilentlyContinue
        }
    }
    Remove-Item $pidFile -Force
}

# Kill remaining process on port 3000
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $conn | ForEach-Object {
        Write-Host "  清除殘留程序 PID $($_.OwningProcess)..." -ForegroundColor DarkGray
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Write-Host '系統已關閉。' -ForegroundColor Green
Start-Sleep -Seconds 2
