@echo off
cd /d "%~dp0"
start "" "http://localhost:5173"
node scripts/serve.mjs
pause
