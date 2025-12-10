@echo off
echo ========================================
echo Starting Resume Analyzer Application
echo ========================================
echo.
echo Starting Django Backend and Expo React Native App...
echo.
echo Backend: http://localhost:8000
echo Expo App: will show QR code and options
echo.

start "Django Backend" cmd /k "python manage.py runserver"
timeout /t 3 /nobreak >nul
start "Expo App" cmd /k "npx expo start"

echo.
echo Both are starting in separate windows...
echo.
pause
