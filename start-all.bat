@echo off
echo ========================================
echo Starting Resume Analyzer Application
echo ========================================
echo.
echo Starting Django Backend and React Frontend...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.

start "Django Backend" cmd /k "python manage.py runserver"
timeout /t 3 /nobreak >nul
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows...
echo.
pause
