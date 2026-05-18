# DailyReps

날짜별 운동 종목, 세트, 무게를 기록하고 달력으로 한눈에 확인하는 개인 운동 일지 앱입니다.

### 배포링크

https://dailyreps-rho.vercel.app/

---

# 프로젝트 개요

## 프로젝트 목적

운동 기록을 번거롭지 않게 남기고, 내가 어떤 날 어떤 운동을 했는지 한눈에 파악하기 위한 앱입니다.

## 주요 기능 설명

- 날짜별로 운동 종목과 세트·무게를 빠르게 입력
- 종목 자동완성으로 자주 하는 운동을 쉽게 불러오기
- 달력에서 운동한 날의 카테고리를 컬러 점으로 시각화
- 프로필에서 총 운동 횟수, 연속 일수, 자주 한 종목 등 통계 확인

## 어떤 문제를 해결하는지

- 기존 앱들은 메뉴가 복잡하거나, 원하는 종목을 찾기 어려움
- 종목을 자유 텍스트로 입력하되 이전 기록을 자동완성으로 재사용 가능하게 해 번거로움을 줄임
- 달력에서 카테고리 컬러를 통해 운동 밸런스를 시각적으로 확인

## 프로젝트 진행 배경

AIBE6 과정 중 AI 에이전트를 활용한 풀스택 앱 개발 실습 프로젝트입니다. Claude Code를 주 에이전트로 사용해 문서 주도 개발 방식으로 진행했습니다.

---

# 기술 스택

## Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- ShadCN UI (Radix 기반 컴포넌트)

## Backend

- Supabase (PostgreSQL, Auth, Storage)

## AI Agent

- Claude Code

---

# 주요 기능

- **회원 인증** — 이메일 회원가입 / 로그인 / 로그아웃 / 회원 탈퇴 (2단계 확인)
- **운동 기록 CRUD** — 날짜별 종목 추가, 세트·무게 입력·수정·삭제, 종목명 수정
- **종목 자동완성** — 이전 기록 기반 debounce 검색, 카테고리별 프리셋 다중 선택
- **달력 대시보드** — 월별 달력에 운동한 날 카테고리 컬러 점 + 월 진행률 바 + 범례
- **운동 목록** — 월별 세션 카드 (종목명·세트 수 요약)
- **프로필 통계** — 총 운동 횟수, 이번 달, 연속 일수, 총 세트 수, 자주 한 종목, 3대 기록
- **프로필 편집** — 닉네임 수정, 아바타 이미지 업로드 (Supabase Storage)
- **반응형 디자인** — 모바일 하단 탭 바 / 데스크탑 헤더 네비게이션
- **다크모드** — 시스템 설정 자동 감지

---

# 프로젝트 구조

```text
dailyreps/
├── app/
│   ├── (auth)/              # 로그인, 회원가입
│   └── (protected)/         # 인증 필요 페이지
│       ├── dashboard/       # 달력 대시보드 + 최근 운동
│       ├── workout/         # 월별 운동 목록
│       │   └── [date]/      # 날짜별 운동 기록 편집
│       └── profile/         # 프로필 통계
│           └── edit/        # 프로필 수정
├── components/ui/           # ShadCN UI 컴포넌트
├── lib/
│   ├── repositories/        # DB 쿼리
│   ├── services/            # 비즈니스 로직 + Server Actions
│   ├── supabase/            # Supabase 클라이언트 3종 (browser/server/middleware)
│   └── utils/               # 유틸 함수 (카테고리 분류 등)
└── types/                   # TypeScript 타입 정의
```

---

# 실행 방법

## 1. 프로젝트 설치

```bash
git clone https://github.com/m1nhy2uk/DailyReps.git
cd DailyReps/dailyreps
npm install
```

## 2. 환경변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 서버에서만 사용 (클라이언트에 절대 노출 금지)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. 실행

```bash
npm run dev
```

---

# Supabase 설정

## Authentication

Supabase Auth (이메일/패스워드)를 사용합니다. 회원가입 시 `handle_new_user` 트리거가 자동으로 `profiles` 테이블에 레코드를 생성합니다.

## 테이블 구조 (3계층)

| 테이블             | 역할                                     | 주요 컬럼                                                       |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------- |
| `profiles`         | 사용자 프로필                            | id, nickname, avatar_url, bench_press_kg, squat_kg, deadlift_kg |
| `workout_sessions` | 운동 세션 (날짜 단위, user당 날짜별 1개) | id, user_id, session_date                                       |
| `workout_entries`  | 세션 내 운동 종목                        | id, session_id, exercise_name, order_index                      |
| `workout_sets`     | 종목별 세트 기록                         | id, entry_id, weight_kg, reps, set_number                       |

스키마 SQL: `docs/001_initial_schema.sql` 을 Supabase SQL Editor에서 실행합니다.

## RLS (Row Level Security)

모든 테이블에 RLS가 활성화되어 있으며, `auth.uid() = user_id` 조건으로 본인 데이터만 접근 가능합니다.

## Storage

아바타 이미지 업로드를 위해 `avatars` 버킷이 필요합니다. 버킷 생성 후 아래 RLS 정책을 적용합니다.

```sql
-- 본인 아바타만 업로드/조회 허용
CREATE POLICY "avatars: upload own"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars: read own"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

# AI 에이전트 활용 방식

## 사용한 도구

- **Claude Code** (주 에이전트) — 전체 기능 구현, 리팩터링, 버그 수정

## 문서 기반 작업 방식

`docs/` 폴더에 아키텍처 원칙, 도메인 규칙, 작업 상태 문서를 유지하고, 에이전트는 문서를 기준으로만 코드를 작성하도록 했습니다.

```
docs/
├── ARCHITECTURE-CONSTITUTION.md  # 아키텍처 핵심 원칙
├── ARCHITECTURE-STATUTE.md       # 아키텍처 구현 규칙
├── DOMAIN-WORKOUT-STATUTE.md     # 운동 도메인 규칙
├── TODO-READY.md                 # 바로 작업 가능한 목록
└── TODO-DONE.md                  # 완료 기록
```

## 어떤 작업에 활용했는지

| 작업             | 내용                                           |
| ---------------- | ---------------------------------------------- |
| 프로젝트 초기화  | Next.js 16 + Supabase 클라이언트 3종 세팅      |
| DB 스키마 설계   | 3계층 데이터 모델 + RLS 정책 SQL 생성          |
| 기능 구현        | 운동 기록 CRUD, 자동완성, 달력, 프로필 전 기능 |
| UI 컴포넌트 교체 | 커스텀 컴포넌트 → ShadCN UI 마이그레이션       |
| 반응형 디자인    | 모바일 탭 바, 터치 타겟 개선                   |
| 버그 수정        | Next.js 16 breaking changes 대응               |

## 프롬프트 전략

- 작업 단위를 TODO-READY.md의 태스크 ID로 명확히 지정
- "문서 없이 추측하지 말고 보고하라" 원칙을 CLAUDE.md에 명시
- 한 번에 하나의 태스크만 지시해 범위 이탈 방지

## 코드 검증 방식

- TypeScript 오류, ESLint 통과를 완료 조건으로 설정
- 생성된 코드를 직접 읽고 이해한 후 다음 태스크 진행

---

# 트러블슈팅

## Next.js 16 — params가 Promise로 변경

**문제 상황**

`/workout/[date]` 페이지에서 `params.date`를 바로 읽으면 타입 오류 발생.

**원인**

Next.js 16부터 `params`와 `searchParams`가 Promise로 변경됨.

**해결 방법**

```ts
// 변경 전
export default function Page({ params }: { params: { date: string } }) {
  const date = params.date;
}

// 변경 후
export default async function Page({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
}
```

---

## ESLint — useEffect 내 setState 금지 규칙

**문제 상황**

`AddEntryForm`에서 검색어 입력에 따라 드롭다운을 표시/숨김 처리를 `useEffect` + `setState`로 구현하면 ESLint 오류 발생.

**원인**

Next.js 16 ESLint 규칙이 `useEffect` 내 파생 값 갱신을 금지.

**해결 방법**

`showDropdown`을 state가 아닌 파생 값으로 계산해 렌더 타임에 결정.

```ts
// 변경 전 — useEffect + setState
const [showDropdown, setShowDropdown] = useState(false);
useEffect(() => {
  setShowDropdown(suggestions.length > 0 && isFocused);
}, [suggestions, isFocused]);

// 변경 후 — 파생 값
const showDropdown = suggestions.length > 0 && isFocused;
```

---

# 회고

## 어려웠던 점

- Next.js 16이 출시 초기라 문서와 에이전트 학습 데이터 간 차이가 컸음. `params` Promise 변경, `unstable_retry` 등 breaking change를 직접 찾아야 했음.
- Supabase Storage RLS를 처음 설정할 때 정책 문법이 익숙하지 않아 시행착오가 있었음.

## 개선하고 싶은 점

- 운동 볼륨(무게 × 세트 수) 추이 차트 추가
- 종목별 최고 기록(PR) 트래킹
- PWA 지원으로 홈 화면 설치

## 새롭게 배운 점

- Next.js App Router의 Server Component / Client Component 경계 설계
- Supabase RLS로 서버 코드 없이 데이터 접근 제어하는 방식
- Repository → Service → Server Action 3계층 패턴

## AI 에이전트를 사용하며 느낀 점

문서를 명확하게 작성해두면 에이전트가 올바른 방향으로 작동하지만, 문서가 부실하면 에이전트가 추측하고 범위를 벗어나는 코드를 생성했습니다. 에이전트를 효과적으로 쓰려면 **명확한 작업 단위 분리**와 **원칙 문서 관리**가 핵심임을 배웠습니다.

---

# 참고 자료

- [Next.js 16 공식 문서](https://nextjs.org/docs)
- [Supabase 공식 문서](https://supabase.com/docs)
- [ShadCN UI](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [@supabase/ssr](https://www.npmjs.com/package/@supabase/ssr)
- [Sonner (Toast)](https://sonner.emilkowal.ski)
- [Radix UI](https://www.radix-ui.com)
