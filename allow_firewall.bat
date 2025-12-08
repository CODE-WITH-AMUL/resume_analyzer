@echo off
echo ================================================================
echo Django Development Server - Firewall Configuration
echo ================================================================
echo.
echo This will allow incoming connections on port 8000 for Django.
echo.
echo NOTE: Run this file as Administrator (Right-click > Run as Administrator)
echo.
pause

echo Adding firewall rule...
netsh advfirewall firewall add rule name="Django Dev Server" dir=in action=allow protocol=TCP localport=8000

echo.
if %errorlevel% equ 0 (
    echo SUCCESS! Firewall rule added.
    echo Port 8000 is now open for incoming connections.
) else (
    echo FAILED! You need to run this as Administrator.
    echo Right-click this file and select "Run as Administrator"
)
echo.
pause
