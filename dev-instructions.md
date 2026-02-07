# TimerTools Pro 개발 가이드

## 🚀 프로젝트 시작하기

### 로컬 서버 실행
1. `start-server.bat` 더블클릭 또는 명령어 실행:
```bash
start-server.bat
```
2. 브라우저에서 `http://localhost:8000` 접속

### 직접 파일 열기
- `index.html` 파일을 브라우저에서 직접 열기

## ✅ 최근 수정 완료 사항

### 홈 네비게이션 문제 해결 (2024-01-XX)
- ✅ 모든 페이지의 홈 링크 경로 통일 (`../index.html`)
- ✅ 브레드크럼 네비게이션 수정
- ✅ 로고 클릭 시 홈으로 이동 기능 수정

## 📋 개발 명령어 (SuperClaude 사용법)

### 1. 요리 타이머 개발
```bash
cat ../design/wireframes/cooking-timer-wireframe.md
```
```bash
/sc:implement 위 설계문서의 모든 요구사항을 100% 준수하여 요리 타이머 구현 - 단계별 요리 프로세스, 온도 알림, 다중 요리 관리, 레시피 연동 기능 포함
```

### 2. 운동 타이머 개발  
```bash
cat ../design/wireframes/workout-timer-wireframe.md
```
```bash
/sc:implement 위 설계문서의 모든 요구사항을 100% 준수하여 운동 타이머 구현 - 세트/휴식 관리, 운동 프로그램 템플릿, 진행률 추적 기능 포함
```

### 3. 통계 대시보드 개발
```bash
cat ../design/wireframes/statistics-dashboard-wireframe.md
```
```bash
/sc:implement 위 설계문서의 모든 요구사항을 100% 준수하여 통계 대시보드 구현 - KPI 카드, 시간대별 차트, 목표 추적, 리포트 생성 기능 포함
```

### 4. PWA 기능 개발
```bash
cat ../design/pwa-specifications.md
```
```bash
/sc:implement 위 명세서의 모든 요구사항을 100% 준수하여 PWA 기능 구현 - 서비스 워커, 매니페스트, 오프라인 기능, 푸시 알림 포함
```

### 5. 멀티 타이머 UI 수정
```bash
cat ../design/wireframes/multi-timer-wireframe.md
```
```bash
cat ../design/wireframes/multi-timer-implementation-checklist.md
```
```bash
/sc:improve 멀티 타이머를 와이어프레임 설계문서에 따라 중앙 3-column 그리드 레이아웃으로 완전 재구현 - 320px 고정 카드, 카테고리별 색상, 원형 타이머 포함
```

## 주의사항
- 각 단계별로 설계문서 확인 후 구현 명령어 실행
- SuperClaude 명령어(/sc:) 사용으로 토큰 70% 절약
- 구현 완료 후 테스트 및 검증 필요

## 완료 체크리스트
- [ ] 요리 타이머 구현 완료
- [ ] 운동 타이머 구현 완료  
- [ ] 통계 대시보드 구현 완료
- [ ] PWA 기능 구현 완료
- [ ] 멀티 타이머 UI 수정 완료
