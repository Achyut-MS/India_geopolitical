@echo off
echo ================================================
echo BHARAT LENS - Installation and Setup Script
echo ================================================
echo.

echo [1/4] Installing required dependencies...
call npm install @turf/bbox
if %errorlevel% neq 0 (
    echo ERROR: Failed to install @turf/bbox
    pause
    exit /b 1
)
echo.

echo [2/4] Checking for TypeScript errors...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: TypeScript compilation failed
    echo Please check the error messages above
    pause
    exit /b 1
)
echo.

echo [3/4] Starting development server...
echo NOTE: The dev server will start on http://localhost:5173
echo.
echo Press Ctrl+C to stop the server when you're done testing
echo.

call npm run dev

pause
