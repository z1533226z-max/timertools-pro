@echo off
echo =================================
echo   TimerTools Pro 로컬 서버 시작
echo =================================
echo.
echo 브라우저에서 다음 주소로 접속하세요:
echo http://localhost:8000
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요.
echo.

cd /d "%~dp0"
python -m http.server 8000 2>nul || python3 -m http.server 8000 2>nul || (
    echo Python이 설치되지 않았습니다.
    echo 대신 index.html 파일을 직접 브라우저에서 열어주세요.
    pause
    exit /b 1
)