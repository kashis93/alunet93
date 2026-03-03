@echo off
echo 🚀 FIXING ALL ISSUES - Alumni Platform
echo.

echo 1️⃣ Checking server status...
cd /d "c:\Users\Lenovo\Downloads\connect-verse-20-main\connect-verse-20-main"

echo.
echo 2️⃣ Starting development server...
start /B npm run dev

echo.
echo 3️⃣ Opening browser to test page...
timeout /t 3 >nul
start http://localhost:8081/test-cloudinary

echo.
echo 4️⃣ MANUAL FIXES NEEDED:
echo.
echo 🔧 CLOUDINARY:
echo    - Go to: https://cloudinary.com/console
echo    - Settings ^> Upload ^> Upload presets
echo    - Create "alumni_uploads" preset (Unsigned)
echo    - Add http://localhost:* to CORS settings
echo.
echo 🔧 FIREBASE INDEXES:
echo    - Click: https://console.firebase.google.com/v1/r/project/aluverse93/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9hbHV2ZXJzZTkzL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9hY3Rpdml0aWVzL2luZGV4ZXMvXxABGgwKCGF1dGhvcklkEAEaDQoJdGltZXN0YW1wEAIaDAoIX19uYW1lX18QAg
echo    - Click: https://console.firebase.google.com/v1/r/project/aluverse93/firestore/indexes?create_composite=ClJwcm9qZWN0cy9hbHV2ZXJzZTkzL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9hbHVtbmlfY29tbWVudHMvaW5kZXhlcy9fEAEaCgoGcG9zdElkEAEaDQoJdGltZVN0YW1wEAIaDAoIX19uYW1lX18QAg
echo.
echo 🔧 FIREBASE CORS (if gsutil installed):
echo    - Run: gsutil cors set firebase-cors.json gs://aluverse93.appspot.com
echo.

echo 5️⃣ TESTING:
echo    - Navigate to: http://localhost:8081/profile
echo    - Click profile photo to upload
echo    - Check browser console (F12) for errors
echo.

echo ✅ After manual fixes, photo upload should work!
echo.
pause
