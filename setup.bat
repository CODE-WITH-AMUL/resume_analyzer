@echo off
echo ========================================
echo Resume Analyzer - Setup Script
echo ========================================
echo.

echo Installing Python dependencies...
pip install -r requirements.txt
echo.

echo Running Django migrations...
python manage.py makemigrations
python manage.py migrate
echo.

echo Creating superuser (optional)...
python manage.py createsuperuser
echo.

echo Installing Node.js dependencies...
call npm install
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure Ollama is running with qwen3:4b model
echo 2. Run start-backend.bat to start Django server
echo 3. Run start-frontend.bat to start React app
echo.
pause
