@echo off
echo ==========================================
echo Railway Database Migration Script
echo ==========================================
echo.
echo This script will:
echo 1. Login to Railway (opens browser)
echo 2. Link to your project
echo 3. Run Prisma migration
echo 4. Generate Prisma client
echo.
echo Press any key to continue...
pause >nul

cd "C:\opencode projects\Rfid-Attendance"

echo.
echo Step 1: Logging into Railway...
echo (A browser window should open - please login there)
railway login

echo.
echo Step 2: Linking to project...
railway link

echo.
echo Step 3: Running database migration...
railway run npx prisma migrate deploy

echo.
echo Step 4: Generating Prisma client...
railway run npx prisma generate

echo.
echo ==========================================
echo Migration Complete!
echo ==========================================
echo.
pause
