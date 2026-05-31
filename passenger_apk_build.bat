@echo off
title Passenger App - APK Yasash
color 0B
echo ==========================================
echo   TAXIGO (PASSENGER) - APK BUILD (EAS)
echo ==========================================
echo.

node --version > nul 2>&1
if errorlevel 1 (
    echo [XATO] Node.js topilmadi! https://nodejs.org dan o'rnating
    pause & exit
)

eas --version > nul 2>&1
if errorlevel 1 (
    echo EAS CLI o'rnatilmoqda...
    npm install -g eas-cli
)

echo.
echo [1/4] passenger-app papkasiga o'tilmoqda...
cd /d "%~dp0taxi-app\passenger-app"

echo [2/4] Kutubxonalar o'rnatilmoqda...
call npm install

echo.
echo [3/4] Expo ga kirish...
eas login

echo.
echo [4/4] APK build boshlanmoqda...
echo (5-15 daqiqa davom etadi)
echo.
eas init
eas build --platform android --profile preview

echo.
echo ==========================================
echo Build tugadi! expo.dev/builds dan yuklab oling
echo ==========================================
pause
