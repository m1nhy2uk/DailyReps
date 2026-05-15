# 주요 사건 및 의사결정

---

## 2026-05-13 — Next.js 16 채택

### 발견: Next.js 16 주요 변경사항
- **내용**: `create-next-app`이 Next.js 16.2.6을 설치함. 아키텍처 문서는 Next.js 14 기준으로 작성되었으나 16에서도 App Router 구조는 동일
- **주요 변경점**:
  - `params`가 Promise로 변경 → 동적 라우트 페이지에서 반드시 `await params` 사용
  - `refresh()` from `next/cache` 추가 (클라이언트 라우터 새로고침)
  - Turbopack이 기본 번들러
  - `next build`가 더 이상 lint를 자동 실행하지 않음
- **영향**: `ARCHITECTURE-STATUTE.md`의 동적 라우트 예시에 `await params` 패턴 적용 필요

---

## 2026-05-13 — 프로젝트 설계 시작

### 결정: 기술 스택 확정
- **내용**: Next.js (App Router) + Supabase (Auth/DB/Storage) + TypeScript
- **이유**: 사용자가 직접 지정한 스택. Supabase는 Auth, RLS, Realtime을 통합 제공하여 운동 기록 앱 수준의 서비스에 적합
- **영향**: 상태 관리 라이브러리 불필요, 별도 백엔드 서버 불필요

### 결정: 데이터 모델 3-계층 구조 채택
- **내용**: WorkoutSession → WorkoutEntry → WorkoutSet 계층 구조
- **이유**: 날짜별 세션 단위 관리가 사용자 경험에 자연스러움. 종목별 세트 관리의 확장성 확보
- **영향**: 3개 테이블 (`workout_sessions`, `workout_entries`, `workout_sets`)

### 결정: 운동 종목 마스터 테이블 미도입
- **내용**: 종목명을 자유 텍스트로 저장, 별도 종목 마스터 테이블 없음
- **이유**: 초기 버전 범위 최소화. 사용자마다 종목 이름이 다름 (한/영, 표기 차이)
- **영향**: 자동완성은 사용자 기존 기록 기반으로 구현

### 결정: 소프트 삭제 방식 채택
- **내용**: `deleted_at` 컬럼으로 소프트 삭제 적용
- **이유**: 실수로 삭제한 기록 복구 가능성 확보
- **영향**: 모든 조회 쿼리에 `WHERE deleted_at IS NULL` 조건 필요
