@echo off
REM ============================================================
REM HRM Development — Startup Script
REM ============================================================
REM NOTE: Vite dev server (vite --host) hangs on this project (Vite 7 bug + pnpm on Windows).
REM Using preview mode instead. Run "pnpm run build" after making changes.
REM ============================================================

echo Starting HRM Development...

REM 1. Build frontend if dist is missing
if not exist "dist\index.html" (
    echo Building frontend for the first time...
    call pnpm run build
    if errorlevel 1 (
        echo Build failed. Check for errors above.
        pause
        exit /b 1
    )
)

REM 2. Start backend (Express + tsx watch)
start "HRM Server" cmd /c "pnpm run dev:server"

REM 3. Start frontend (Vite preview — serves dist/)
start "HRM Client" cmd /c "pnpm run serve"

timeout /t 5 /nobreak >nul

REM 4. Open browser
start "" "http://localhost:8081/"

echo.
echo ============================================================
echo  Backend : http://localhost:8080/
echo  Frontend: http://localhost:8081/
echo ============================================================
echo  NOTE: Frontend uses preview mode (no HMR).
echo  After code changes, run: pnpm run build
echo  Or for auto-rebuild: pnpm run dev:watch
echo.
