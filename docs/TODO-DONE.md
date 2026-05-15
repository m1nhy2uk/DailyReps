# TODO - DONE (완료된 작업)

## 2026-05-14

### [WKT-002 추가] 달력 고도화
- `lib/utils/exercise-category.ts` — 7개 카테고리 정의 + 키워드 기반 감지 함수 (가슴/어깨/등/하체/팔/복근/유산소)
- `lib/repositories/workout.repository.ts` — `getSessionCategoriesByMonth` 추가 (세션별 종목명 조회)
- `app/(protected)/dashboard/page.tsx` — `getSessionDatesByMonth` → `getSessionCategoriesByMonth` 교체
- `app/(protected)/dashboard/_components/WorkoutCalendar.tsx` — 진행률 바 (운동일수/전체일수·%) + 카테고리 컬러 점 + 사용 카테고리 범례
- `app/(protected)/dashboard/loading.tsx` — 진행률 바 스켈레톤 추가, 날짜 셀 h-9→h-10
- TypeScript 오류 없음

### [MBR-002] 회원 탈퇴
- `lib/services/member.service.ts` — `deleteAccountAction` 추가 (Supabase admin API로 auth.users 삭제 → profiles/workout 데이터 CASCADE 삭제)
- `app/(protected)/profile/_components/DeleteAccountSection.tsx` — 인라인 2단계 확인 UI (탈퇴하기 → 확인/취소)
- `app/(protected)/profile/page.tsx` — `DeleteAccountSection` 추가
- TypeScript 오류 없음
- 데이터 처리 정책: auth.users 하드 삭제 → FK ON DELETE CASCADE로 profiles·workout_sessions·entries·sets 전체 삭제

### [MBR-001] 프로필 수정 페이지
- `lib/repositories/member.repository.ts` — getProfile, updateProfile (ServiceResult 패턴)
- `lib/services/member.service.ts` — updateProfileAction Server Action (닉네임 유효성 검사 + Supabase Storage 이미지 업로드, 최대 2MB)
- `next.config.ts` — Supabase Storage 이미지 도메인 허용 (*.supabase.co)
- `app/(protected)/profile/page.tsx` — Server Component, 프로필 fetch → ProfileForm 전달
- `app/(protected)/profile/_components/ProfileForm.tsx` — Client Component, 아바타 미리보기 + 닉네임 수정, useActionState
- `app/(protected)/profile/loading.tsx` — 스켈레톤
- `NavLinks.tsx`, `BottomNav.tsx` — "프로필" 링크 추가
- TypeScript 오류 없음
- Supabase Storage: "avatars" 버킷 생성 및 RLS 설정 필요 (아래 참고)

### [INF-004] 반응형 디자인
- `app/(protected)/_components/BottomNav.tsx` — 모바일 하단 탭 바 (sm:hidden, fixed bottom)
- `app/(protected)/layout.tsx` — 모바일에서 헤더 NavLinks 숨김(hidden sm:block), main에 pb-20 sm:pb-6 추가, BottomNav 렌더링
- `app/(protected)/workout/[date]/_components/SetRow.tsx` — 입력 필드 반응형 너비 (w-14 sm:w-20, w-12 sm:w-16), py-1.5로 터치 타겟 개선
- `app/(protected)/workout/[date]/_components/AddEntryForm.tsx` — py-2.5 터치 타겟 향상, shrink-0 추가
- `app/(protected)/workout/[date]/loading.tsx` — skeleton 너비 SetRow와 동기화 (w-14 sm:w-20, w-12 sm:w-16)
- TypeScript 오류 없음

## 2026-05-13

### [INF-003] Toast 알림 시스템
- `components/ui/ToastProvider.tsx` — ToastContext + useToast + ToastProvider + ToastBubble 한 파일
  - success(검정) / error(빨강) / info(zinc) 3종 타입
  - 3초 자동 소멸 + 300ms fade-out, translate-y 슬라이드인 애니메이션
  - 컨테이너 `pointer-events-none` + 개별 토스트 `pointer-events-auto`
  - `aria-live="polite"` 접근성 대응
- `app/(protected)/layout.tsx` — ToastProvider로 감싸기
- `EntryCard`: 세트 추가 성공 토스트, 삭제/추가 에러 토스트, 종목명 편집 에러는 인라인 유지
- `SetRow`: 삭제/수정 에러 토스트, 기존 `error` state 제거
- TypeScript 오류 없음, ESLint 통과

### [INF-002] 로딩 상태 처리
- `app/(protected)/dashboard/loading.tsx` — 헤더 + 달력 그리드(5줄 × 7) + 최근 기록 카드 3개
- `app/(protected)/workout/loading.tsx` — 헤더 + 월네비 + 세션 카드 5개
- `app/(protected)/workout/[date]/loading.tsx` — 날짜 헤더 + 종목 카드 2개(세트 rows 포함) + 추가 폼
- animate-pulse 부모 div에 적용 → 하위 모든 요소 함께 페이드
- TypeScript 오류 없음, ESLint 통과

### [INF-001] 에러 페이지 처리
- `app/not-found.tsx` — 루트 404, 레이아웃 없이 독립 렌더링
- `app/(protected)/not-found.tsx` — 보호 라우트 404, protected layout(헤더) 포함
- `app/(protected)/error.tsx` — 에러 바운더리 Client Component, `unstable_retry` (Next.js 16), digest 코드 표시
- `app/global-error.tsx` — 루트 레이아웃 에러 최후 방어선, globals.css import + html/body 포함
- TypeScript 오류 없음, ESLint 통과

### [WKT-004] 운동 기록 목록 페이지
- `getSessionsWithSummaryByMonth` (repository) — 월별 세션 + 종목명·세트 수 집계
- `SessionSummary` 타입 추가 (id, session_date, exercise_names, total_entries, total_sets)
- `app/(protected)/_components/NavLinks.tsx` — usePathname 기반 활성 탭 표시
- `app/(protected)/layout.tsx` — 헤더에 대시보드/운동 기록 네비게이션 추가
- `app/(protected)/workout/_components/MonthNav.tsx` — URL search params 월 이동
- `app/(protected)/workout/_components/SessionCard.tsx` — 날짜·종목·세트 수 카드
- `app/(protected)/workout/page.tsx` — searchParams(year/month), 빈 상태 처리
- TypeScript 오류 없음, ESLint 통과

### [WKT-003] 운동 종목 자동완성
- `findExerciseNames` (repository) — ilike 검색, `%_` 이스케이프, 최근순 중복 제거, 최대 5개
- `searchExerciseNames` (service) — Server Action, 클라이언트에서 직접 호출
- `AddEntryForm` 개선 — controlled input + 300ms debounce + 드롭다운 + 일치 텍스트 굵게 표시
- ESLint `set-state-in-effect` 규칙 → `showDropdown`을 파생 값으로 계산해 해결
- TypeScript 오류 없음, ESLint 통과

### [WKT-002] 대시보드 페이지
- `getSessionDatesByMonth`, `getRecentSessionsWithEntries` repository 함수 추가
- `WorkoutCalendar` — URL search params 기반 월 이동, 운동한 날 점 표시, 날짜 클릭 → 운동 페이지 이동
- `RecentWorkouts` — 최근 5개 세션 카드, 종목 3개 이상이면 "외 N개" 표시
- `dashboard/page.tsx` — searchParams(year/month), KST 기준 오늘 날짜, 달력+최근기록 병렬 fetch
- TypeScript 오류 없음, ESLint 통과

### [WKT-001] 운동 기록 CRUD UI
- `lib/repositories/workout.repository.ts` — getSessionWithEntries, getOrCreateSession, insert/patch/softDelete 함수
- `lib/services/workout.service.ts` — createEntryAction(FormData), deleteEntry, updateEntryName, addSet, updateSet, deleteSet Server Actions
- `app/(protected)/workout/[date]/_components/` — WorkoutEditor, EntryCard, SetRow, AddEntryForm
- `app/(protected)/workout/[date]/page.tsx` — Server Component, 데이터 fetch → WorkoutEditor 전달
- `app/(protected)/dashboard/page.tsx` — 오늘 날짜 운동 기록 링크 추가
- `types/workout.types.ts` — WorkoutSetView, WorkoutEntryWithSets, WorkoutSessionWithEntries 추가
- TypeScript 오류 없음, ESLint 통과
- useEffect setState 룰 → key prop 패턴으로 해결 (서버 re-render 시 SetRow 리셋)

### [WRK-004] 인증 미들웨어 구현
- `middleware.ts` — getUser() 세션 갱신 + 보호 라우트 리다이렉트 + 인증 페이지 리다이렉트
- `lib/services/auth.service.ts` — signIn / signUp / signOut Server Actions (유효성 검사 포함)
- `app/(auth)/login/_components/LoginForm.tsx` — useActionState, pending 상태, 에러 표시
- `app/(auth)/signup/_components/SignupForm.tsx` — useActionState, pending 상태, 에러 표시
- `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx` — 실제 UI로 교체
- `app/(protected)/layout.tsx` — 로그아웃 버튼 추가 (form action={signOut})
- TypeScript 오류 없음, ESLint 통과

### [WRK-003] Supabase DB 스키마 적용
- `supabase/migrations/001_initial_schema.sql` 생성 (Supabase SQL Editor에서 실행 필요)
- 포함 내용: `update_updated_at` 공통 트리거, `profiles` + `handle_new_user` 트리거, `workout_sessions/entries/sets` + RLS 4종 정책 + 인덱스
- `types/database.types.ts` 수동 작성 (gen types 포맷 그대로, 4개 테이블 Row/Insert/Update/Relationships)
- TypeScript/ESLint 통과
- 타입 재생성 명령: `SUPABASE_ACCESS_TOKEN=<token> npx supabase gen types typescript --project-id umwtajzvqnerwxtydqba > types/database.types.ts`

### [WRK-002] Supabase 프로젝트 연결 설정
- `@supabase/supabase-js@2.105.4`, `@supabase/ssr@0.10.3` 설치
- `lib/supabase/client.ts` — `createBrowserClient` (Client Components)
- `lib/supabase/server.ts` — `createServerClient` + `await cookies()` (Server Components)
- `lib/supabase/middleware.ts` — `createClient(request)` + `getResponse()` getter 패턴 (Middleware)
- `types/database.types.ts` placeholder 생성 (WRK-003에서 교체)
- `.env.local` 생성 (키 입력 대기), `.gitignore`에 `.env*` 확인
- TypeScript 오류 없음, ESLint 통과

### [WRK-001] Next.js 프로젝트 초기화
- Next.js 16.2.6 + React 19 + TypeScript + Tailwind CSS v4 설치
- App Router 기반 라우트 구조 생성: `(auth)`, `(protected)`, `workout/[date]`
- 타입 파일 생성: `types/common.types.ts`, `types/member.types.ts`, `types/workout.types.ts`
- 디렉토리 스캐폴딩: `components/ui`, `components/workout`, `lib/supabase`, `lib/services`, `lib/repositories`
- `.env.local.example` 생성
- TypeScript 오류 없음, ESLint 통과 확인
- Next.js 16 주요 변경사항 반영: `params`는 Promise로 `await params` 사용

### [DOC-001] 프로젝트 문서 구조 초기화
- docs/ 폴더 생성
- CONTEXT.md, ARCHITECTURE-CONSTITUTION.md, ARCHITECTURE-STATUTE.md 작성
- DOMAIN-COMMON-CONSTITUTION.md, DOMAIN-COMMON-STATUTE.md 작성
- DOMAIN-MEMBER-CONSTITUTION.md, DOMAIN-MEMBER-STATUTE.md 작성
- DOMAIN-WORKOUT-CONSTITUTION.md, DOMAIN-WORKOUT-STATUTE.md 작성
- TODO-READY.md, TODO-DOING.md, TODO-BACKLOG.md, TODO-DONE.md 작성
- AI-ACTION-LOGS.md, AI-MAJOR-EVENT.md, AI-MAJOR-EVENT-RECAP.md 작성
