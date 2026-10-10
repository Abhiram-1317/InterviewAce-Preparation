@echo off
title InterviewAce AI Platform
cls
echo ======================================================================
echo    INTERVIEWACE: AI-POWERED SMART INTERVIEW PLATFORM
echo ======================================================================
echo.
echo Launching FastAPI Backend (Port 8000) and React Frontend (Port 3000)...
echo.
if exist ".\backend\venv\Scripts\python.exe" (
    .\backend\venv\Scripts\python.exe scripts\run_all.py
) else (
    python scripts\run_all.py
)
pause
