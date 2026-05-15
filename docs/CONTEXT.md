# CONTEXT

## 현재 작업
운동 기록 앱 초기 문서 구조 수립

## 프로젝트 개요
- **서비스명**: 운동 기록 앱 (가칭: FitLog)
- **목적**: 사용자가 날짜별로 운동 종목, 세트, 무게를 기록할 수 있는 서비스
- **기술 스택**: Next.js (프론트엔드), Supabase (백엔드/DB/Auth)

## 현재 디렉토리 구조
```
AIGENT-CODING/
├── dailyreps/      # Next.js 앱
├── backend/        # 추가 백엔드 로직 (미구현)
├── docs/           # 문서 (현재 구성 중)
└── CLAUDE.md
```

## 완료된 초기 설정
- WRK-001: Next.js 16 프로젝트 초기화, 라우트 구조 생성
- WRK-002: Supabase 클라이언트 3종 (browser/server/middleware)
- WRK-003: DB 스키마 SQL 생성 및 실행, database.types.ts 작성
- WRK-004: 미들웨어, 로그인/회원가입 페이지, auth.service.ts

## 다음 작업
- TODO-BACKLOG.md 참고: 운동 기록 CRUD UI ([WKT-001]), 대시보드 ([WKT-002]) 등
