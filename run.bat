@echo off
title Laddu Kadai - Full Stack Launcher
color 0A
cls
echo ====================================================================
echo 🟡                      LADDU KADAI                                
echo          Handcrafted Organic Sweets & Subscription System           
echo ====================================================================
echo.
echo Starting Backend & Frontend services...
echo.

:: 1. Start Backend in a new window
echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "Laddu Kadai Backend (Spring Boot)" cmd /k "cd /d %~dp0laddukadai-backend && mvnw.cmd spring-boot:run"

:: 2. Wait 3 seconds for backend initialization
timeout /t 3 /nobreak >nul

:: 3. Start Frontend in a new window
echo [2/2] Starting Angular Frontend (Port 4200)...
start "Laddu Kadai Frontend (Angular)" cmd /k "cd /d %~dp0laddukadai-frontend && npx ng serve --open"

echo.
echo ====================================================================
echo ✅ BOTH SERVICES ARE LAUNCHING IN SEPARATE WINDOWS!
echo.
echo 🌐 Backend Base API : http://localhost:8080/api
echo 🌐 Frontend Web UI  : http://localhost:4200
echo.
echo 🔑 SAMPLE LOGIN CREDENTIALS:
echo    • Customer     : customer1@laddukadai.com / password123
echo    • Owner        : owner1@laddukadai.com    / password123
echo    • Delivery Man : delivery@laddukadai.com  / password123
echo ====================================================================
echo.
echo Press any key to exit this launcher window (services will keep running).
pause >nul
