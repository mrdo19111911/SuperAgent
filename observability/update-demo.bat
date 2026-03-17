@echo off
REM Demo script - Auto-update data.js to test dashboard auto-refresh

echo ========================================
echo Nash Dashboard Auto-Refresh Demo
echo ========================================
echo.
echo This script will update data.js every 5 seconds
echo Watch the dashboard refresh automatically!
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

:loop

REM Get current timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set mytime=%%a:%%b)

echo [%mydate% %mytime%] Updating data.js...

REM Update last_updated timestamp in data.js
powershell -Command "(Get-Content data.js) -replace 'last_updated: \".*\"', 'last_updated: \"%date:~-4%-%date:~3,2%-%date:~0,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z\"' | Set-Content data.js"

echo [%mydate% %mytime%] Updated! Dashboard should refresh in 3s...
echo.

REM Wait 5 seconds
timeout /t 5 /nobreak > nul

goto loop
