@echo off
title BookChain - Academic Book Exchange Chain
echo ===================================================
echo   BookChain: Peer-to-Peer Academic Book Exchange
echo   Course: 24CIE554 - Full Stack Development
echo   Authors: Ashwath G Hegde & Maulik Tondwal
echo ===================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js (version 18+) from https://nodejs.org
    pause
    exit /b
)

:: Install dependencies if node_modules are missing
if not exist "node_modules\" (
    echo [SETUP] Installing root dependencies...
    call npm install
)
if not exist "backend\node_modules\" (
    echo [SETUP] Installing backend dependencies...
    call npm install --prefix backend
)
if not exist "frontend\node_modules\" (
    echo [SETUP] Installing frontend dependencies...
    call npm install --prefix frontend
)

echo.
echo [START] Launching Backend (port 5000) and Frontend (port 5173)...
echo.

:: Open browser after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5173"

:: Run development servers
call npm run dev
pause

