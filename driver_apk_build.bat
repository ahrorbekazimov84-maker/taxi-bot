@echo off
title Driver App - APK Yasash
color 0A
echo ==========================================
echo   DRIVER APP - APK BUILD (EAS)
echo ==========================================
echo.

:: Node.js tekshirish
node --version > nul 2>&1
if errorlevel 1 (
    echo [XATO] Node.js topilmadi! https://nodejs.org dan o'rnating
    pause & exit
)

:: EAS CLI tekshirish
eas --version > nul 2>&1
if errorlevel 1 (
    echo EAS CLI o'rnatilmoqda...
    npm install -g eas-cli
)

echo.
echo [1/4] driver-app papkasiga o'tilmoqda...
cd /d "%~dp0taxi-app\driver-app"

echo [2/4] Kutubxonalar o'rnatilmoqda...
call npm install

echo.
echo [3/4] Expo ga kirish...
echo Expo hisobingiz bo'lmasa: https://expo.dev da ro'yxatdan o'ting
eas login

echo.
echo [4/4] APK build boshlanmoqda...
echo (5-15 daqiqa davom etadi, sabr qiling)
echo.
eas init
eas build --platform android --profile preview

echo.
echo ==========================================
echo Build tugadi! expo.dev/builds dan yuklab oling
echo ==========================================
pause
