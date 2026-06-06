@echo off
echo ============================================
echo   LostLink AI - Hackathon Startup Script
echo ============================================

:: Start Backend
echo.
echo [1/2] Starting FastAPI backend on port 8000...
cd /d "%~dp0backend"
start "LostLink Backend" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Wait for backend to start
timeout /t 3 /nobreak > nul

:: Start Frontend
echo [2/2] Starting React frontend on port 5173...
cd /d "%~dp0frontend"
start "LostLink Frontend" cmd /k "npm run dev"

echo.
echo ============================================
echo   Application Running!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:8000/docs
echo ============================================

timeout /t 3 /nobreak > nul
start http://localhost:5173
