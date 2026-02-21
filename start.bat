@echo off
setlocal enableextensions
title STARTING APPAREL SITE

REM Always run from this script's folder
pushd "%~dp0"

echo ========================================
echo    STARTING APPAREL SITE
echo ========================================
echo.

REM --- Ports we use ---
set "API_PORT=4242"
set "WEB_PORT=3000"

REM --- Kill anything using our ports (plus old Vite ports) ---
call :killPort %API_PORT%
call :killPort %WEB_PORT%
call :killPort 5173
call :killPort 5174

echo.
echo Starting API server on http://localhost:%API_PORT% ...
pushd "server"
if not exist "node_modules" (
  echo Installing server dependencies...
  call npm install
)
start "API Server (%API_PORT%)" cmd /k "node index.js"
popd

echo.
echo Starting frontend on http://localhost:%WEB_PORT% ...
pushd "client"
if not exist "node_modules" (
  echo Installing client dependencies...
  call npm install --legacy-peer-deps
)
start "Frontend (%WEB_PORT%)" cmd /k "npm run dev -- --port %WEB_PORT% --strictPort"
popd

echo.
echo ========================================
echo    Services are starting...
echo ========================================
echo.
echo API Server: http://localhost:%API_PORT%
echo Frontend:   http://localhost:%WEB_PORT%
echo.

REM Wait for ports to actually be ready before opening the browser
call :waitPort %API_PORT% 25
call :waitPort %WEB_PORT% 35
start "" "http://localhost:%WEB_PORT%"

REM Debug/CI mode: if START_NO_PAUSE is set, exit without stopping services
if defined START_NO_PAUSE (
  echo.
  echo START_NO_PAUSE is set - leaving services running and exiting launcher.
  popd
  exit /b 0
)

echo.
echo Press any key to stop the services and exit...
pause >nul

echo.
echo Stopping services...
call :killPort %API_PORT%
call :killPort %WEB_PORT%
call :killPort 5173
call :killPort 5174

echo Services stopped.
popd
exit /b 0

:killPort
set "P=%~1"
REM Prefer PowerShell (more reliable than parsing netstat)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p=%P%; " ^
  "Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | " ^
  "Select-Object -ExpandProperty OwningProcess -Unique | " ^
  "ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {} }" ^
  >nul 2>nul

REM Fallback: netstat parsing
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R /C:":%P% .*LISTENING"') do (
  taskkill /F /PID %%a >nul 2>nul
)
exit /b 0

:waitPort
set "WP_PORT=%~1"
set "WP_SECS=%~2"
if "%WP_SECS%"=="" set "WP_SECS=20"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port=%WP_PORT%; $timeout=%WP_SECS%; " ^
  "$sw=[Diagnostics.Stopwatch]::StartNew(); " ^
  "while($sw.Elapsed.TotalSeconds -lt $timeout) { " ^
  "  try { $c=Test-NetConnection -ComputerName '127.0.0.1' -Port $port -WarningAction SilentlyContinue; if($c.TcpTestSucceeded){ exit 0 } } catch {} " ^
  "  Start-Sleep -Milliseconds 300 " ^
  "} " ^
  "exit 1" >nul 2>nul
exit /b 0


