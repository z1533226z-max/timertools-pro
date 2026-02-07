@echo off
echo ============================================
echo TimerTools Pro 개발 자동화 스크립트
echo ============================================
echo.

echo [1/5] 요리 타이머 개발 시작...
echo --- 설계문서 확인 ---
type ..\design\wireframes\cooking-timer-wireframe.md
echo.
echo --- 요리 타이머 구현 ---
echo /sc:implement 위 설계문서의 모든 요구사항을 100%% 준수하여 요리 타이머 구현 - 단계별 요리 프로세스, 온도 알림, 다중 요리 관리, 레시피 연동 기능 포함
echo.

echo [2/5] 운동 타이머 개발 시작...
echo --- 설계문서 확인 ---
type ..\design\wireframes\workout-timer-wireframe.md
echo.
echo --- 운동 타이머 구현 ---
echo /sc:implement 위 설계문서의 모든 요구사항을 100%% 준수하여 운동 타이머 구현 - 세트/휴식 관리, 운동 프로그램 템플릿, 진행률 추적 기능 포함
echo.

echo [3/5] 통계 대시보드 개발 시작...
echo --- 설계문서 확인 ---
type ..\design\wireframes\statistics-dashboard-wireframe.md
echo.
echo --- 통계 대시보드 구현 ---
echo /sc:implement 위 설계문서의 모든 요구사항을 100%% 준수하여 통계 대시보드 구현 - KPI 카드, 시간대별 차트, 목표 추적, 리포트 생성 기능 포함
echo.

echo [4/5] PWA 기능 개발 시작...
echo --- PWA 명세서 확인 ---
type ..\design\pwa-specifications.md
echo.
echo --- PWA 기능 구현 ---
echo /sc:implement 위 명세서의 모든 요구사항을 100%% 준수하여 PWA 기능 구현 - 서비스 워커, 매니페스트, 오프라인 기능, 푸시 알림 포함
echo.

echo [5/5] 멀티 타이머 UI 수정...
echo --- 멀티 타이머 설계문서 확인 ---
type ..\design\wireframes\multi-timer-wireframe.md
type ..\design\wireframes\multi-timer-implementation-checklist.md
echo.
echo --- 멀티 타이머 재구현 ---
echo /sc:improve 멀티 타이머를 와이어프레임 설계문서에 따라 중앙 3-column 그리드 레이아웃으로 완전 재구현 - 320px 고정 카드, 카테고리별 색상, 원형 타이머 포함
echo.

echo ============================================
echo 모든 개발 작업 완료!
echo 각 단계별로 위의 명령어를 Claude Code에서 실행하세요.
echo ============================================
pause
