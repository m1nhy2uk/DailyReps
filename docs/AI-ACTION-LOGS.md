# AI 작업 로그

최대 100개 유지. 오래된 항목은 삭제한다.

---

## 2026-05-13

### [LOG-012] [INF-003] Toast 알림 시스템
- **작업**: ToastProvider 생성 + 레이아웃 연동 + EntryCard/SetRow 실사용
- **주요 결정**:
  - `onDone` 대신 `item.id + removeToast(stable)` 전달 → useEffect 재실행 없음
  - setTimeout 내부 setState → 동기 호출 아님 → ESLint 규칙 통과
  - 종목명 편집 에러는 인라인 유지 (컨텍스트 필요), 삭제/추가 에러/성공은 토스트로 전환
  - EntryCard: "세트가 추가됐습니다" 성공 토스트 추가 (삭제는 카드 소멸로 명확)
  - SetRow: 기존 error state 완전 제거, 토스트로 통일
- **결과**: TypeScript/ESLint 통과

### [LOG-011] [INF-002] 로딩 상태 처리
- **작업**: 데이터 fetch 3개 페이지에 loading.tsx 스켈레톤 생성
- **주요 결정**:
  - animate-pulse 부모 div에만 적용 — CSS opacity 상속으로 자식 전체 통일 적용
  - workout/[date] 스켈레톤: EntryCardSkeleton + SetRowSkeleton 서브 함수로 분리 (반복 구조 명확화)
  - 달력 그리드: 5줄 × 7칸 — 대부분의 달 커버 (6줄 필요한 달에는 약간 짧게 보이나 허용)
  - 스켈레톤 너비를 실제 콘텐츠 예상 너비에 맞게 설정 (CLS 최소화)
- **결과**: TypeScript/ESLint 통과

### [LOG-010] [INF-001] 에러 페이지 처리
- **작업**: not-found·error·global-error 4개 파일 생성
- **주요 결정**:
  - Next.js 16에서 error.tsx retry prop은 `reset` → `unstable_retry` 변경 (docs 확인)
  - `(protected)/not-found.tsx` 별도 생성: notFound() 호출 위치가 모두 protected 라우트 → 헤더 있는 404 표시
  - global-error.tsx에 globals.css import: html/body 직접 렌더링하므로 root layout CSS 없음
  - digest 코드 표시: 운영 환경 디버깅을 위해 error.digest를 UI에 노출
- **결과**: TypeScript/ESLint 통과

### [LOG-009] [WKT-004] 운동 기록 목록 페이지
- **작업**: /workout 페이지 + 레이아웃 네비게이션
- **주요 결정**:
  - 레이아웃 네비게이션을 WKT-004에서 함께 추가 — 목록 페이지 진입 경로가 없었음
  - NavLinks Client Component: usePathname으로 /workout/* 하위 경로 모두 "운동 기록" 활성 처리
  - SessionCard에 종목·세트 통계 표시: "3종목 · 12세트"
  - 빈 달: 이모지 + "오늘 운동 시작하기" 링크 표시
- **결과**: TypeScript/ESLint 통과

### [LOG-008] [WKT-003] 운동 종목 자동완성
- **작업**: 기존 기록 기반 자동완성 구현
- **주요 결정**:
  - `ilike` + JS 중복 제거: PostgREST에서 GROUP BY 미지원 → 최근 30개 fetch 후 JS에서 dedup
  - `%` `_` 이스케이프: 사용자 입력에 LIKE 특수문자 포함 시 의도치 않은 와일드카드 방지
  - `showDropdown` 파생 값: `open && query.trim() && suggestions.length > 0` — useEffect 내 동기 setState 없이 빈 쿼리 시 드롭다운 닫힘 처리
  - `onMouseDown`으로 suggestion 선택: blur가 click보다 먼저 발생하는 문제 방지
- **결과**: TypeScript/ESLint 통과

### [LOG-007] [WKT-002] 대시보드 페이지
- **작업**: 달력 + 최근 운동 카드 구현
- **주요 결정**:
  - 달력 월 이동: URL search params(?year=&month=) + Link 컴포넌트 → 순수 Server Component 유지
  - KST 오늘 날짜: `Date + 9h offset` (서버는 UTC 기준)
  - 달력+최근기록 `Promise.all` 병렬 fetch
  - 달력 셀: 이번달 날짜만 클릭 가능(Link), 인접달은 회색 빈칸
- **결과**: TypeScript/ESLint 통과

### [LOG-006] [WKT-001] 운동 기록 CRUD UI
- **작업**: /workout/[date] 전체 구현 — Repository/Service/Components/Page
- **주요 결정**:
  - SetRow의 서버 re-render 후 input 동기화: useEffect setState 대신 key prop (`id-weight-reps`) 패턴 사용
  - AddEntryForm: FormData 기반 useActionState 사용, 다른 mutations는 이벤트 핸들러에서 직접 Server Action 호출
  - 세트 추가 시 직전 세트의 weight/reps를 기본값으로 복사
  - getOrCreateSession: INSERT → 실패 시 SELECT 대신 SELECT first → INSERT 방식으로 구현 (UNIQUE 충돌 방지)
- **결과**: TypeScript/ESLint 통과

### [LOG-005] [WRK-004] 인증 미들웨어 구현
- **작업**: middleware.ts + auth.service.ts + 로그인/회원가입 페이지 전체 구현
- **주요 결정**:
  - 미들웨어에서 `getUser()` (Auth 서버 검증) 사용 — `getSession()` 대비 보안 강화
  - Server Actions에서 `redirect()` 호출 전에 try/catch 종료 → redirect가 catch에 잡히지 않는 구조
  - 로그아웃은 protected layout의 form action={signOut}으로 JS 없이도 동작
  - React 19 `useActionState` from `react` 사용 (이전 `react-dom/useFormState` 아님)
- **결과**: TypeScript/ESLint 통과

### [LOG-004] [WRK-003] Supabase DB 스키마 적용
- **작업**: SQL 마이그레이션 파일 + database.types.ts 수동 작성
- **주요 내용**:
  - `supabase gen types` 사용 불가 (개인 액세스 토큰 미설정) → gen types 포맷 그대로 수동 작성
  - SQL 파일 위치: `supabase/migrations/001_initial_schema.sql` (대시보드에서 수동 실행 필요)
  - 4개 테이블, 14개 RLS 정책, 4개 updated_at 트리거, 3개 인덱스, 1개 handle_new_user 트리거
- **결과**: TypeScript/ESLint 통과

### [LOG-003] [WRK-002] Supabase 프로젝트 연결 설정
- **작업**: `@supabase/ssr@0.10.3` API 확인 후 3개 클라이언트 파일 생성
- **주요 결정**:
  - `server.ts`: `setAll`의 `headers` 파라미터(캐시방지헤더)는 Server Component에서 의미 없으므로 무시
  - `middleware.ts`: `setAll` 호출 시 `supabaseResponse` 재생성 → `getResponse()` getter 패턴으로 최신 응답 반환
  - `database.types.ts` placeholder 생성 (WRK-003 `gen types` 후 교체)
- **결과**: TypeScript/ESLint 통과

### [LOG-002] [WRK-001] Next.js 프로젝트 초기화
- **작업**: Next.js 16.2.6 App Router 프로젝트 생성 및 구조 셋업
- **주요 내용**:
  - `create-next-app` 으로 프로젝트 생성 (Next.js 16.2.6, React 19, Tailwind CSS v4)
  - Next.js 16 문서 확인: `params`는 Promise (`await params` 필수), `refresh()` API 추가, Turbopack 기본
  - 라우트 구조: `(auth)/login`, `(auth)/signup`, `(protected)/dashboard`, `(protected)/workout/[date]`
  - 타입 파일 3종 생성, 디렉토리 스캐폴딩, `.env.local.example` 생성
  - TypeScript/ESLint 통과 확인
- **결과**: 완료

---


### [LOG-001] 프로젝트 문서 초기화
- **작업**: 운동 기록 앱 프로젝트 문서 구조 전체 생성
- **생성 파일**:
  - docs/CONTEXT.md
  - docs/ARCHITECTURE-CONSTITUTION.md
  - docs/ARCHITECTURE-STATUTE.md
  - docs/DOMAIN-COMMON-CONSTITUTION.md
  - docs/DOMAIN-COMMON-STATUTE.md
  - docs/DOMAIN-MEMBER-CONSTITUTION.md
  - docs/DOMAIN-MEMBER-STATUTE.md
  - docs/DOMAIN-WORKOUT-CONSTITUTION.md
  - docs/DOMAIN-WORKOUT-STATUTE.md
  - docs/TODO-READY.md
  - docs/TODO-DOING.md
  - docs/TODO-BACKLOG.md
  - docs/TODO-DONE.md
  - docs/AI-ACTION-LOGS.md
  - docs/AI-MAJOR-EVENT.md
  - docs/AI-MAJOR-EVENT-RECAP.md
- **결과**: 완료
