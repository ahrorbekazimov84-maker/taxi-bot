@echo off
title TaxiCRM - EXE Yasash
color 0A

echo ==========================================
echo   TaxiCRM - WINDOWS EXE YASASH
echo ==========================================
echo.

:: Node.js tekshirish
node --version > nul 2>&1
if errorlevel 1 (
    echo [XATO] Node.js topilmadi!
    echo https://nodejs.org dan yuklab o'rnating
    pause & exit
)
echo [OK] Node.js: 
node --version

:: taxi-crm-electron papkasiga o'tish
cd /d "%~dp0taxi-crm-electron"

echo.
echo [1/3] Kutubxonalar o'rnatilmoqda...
call npm install
if errorlevel 1 (
    echo [XATO] npm install bajarilmadi
    pause & exit
)
echo [OK] Kutubxonalar tayyor

echo.
echo [2/3] EXE yasalmoqda... (3-5 daqiqa)
call npm run build-win

echo.
echo [3/3] Tayyor!
echo.
echo ==========================================
echo  EXE fayl: taxi-crm-electron\dist\ papkasida
echo  - TaxiCRM Setup.exe    (o'rnatuvchi)
echo  - TaxiCRM Portable.exe (o'rnatishsiz)
echo ==========================================
echo.
pause
