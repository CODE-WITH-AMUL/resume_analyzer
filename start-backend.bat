@echo off
echo ========================================
echo Starting Django Backend Server
echo ========================================
echo.
echo Server will run on http://0.0.0.0:8000 (accessible from network)
echo.

python manage.py runserver 0.0.0.0:8000
