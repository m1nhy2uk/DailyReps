# 아키텍처 구현 규칙

## 1. 디렉토리 구조

```
dailyreps/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # 인증 관련 라우트 그룹
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (protected)/            # 인증 필요 라우트 그룹
│   │   ├── dashboard/page.tsx
│   │   └── workout/
│   │       ├── page.tsx        # 운동 기록 목록
│   │       └── [date]/page.tsx # 날짜별 운동 기록
│   ├── layout.tsx
│   └── page.tsx                # 랜딩/리다이렉트
├── components/
│   ├── ui/                     # 범용 UI 컴포넌트 (Button, Input 등)
│   └── workout/                # 운동 도메인 전용 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저 클라이언트
│   │   ├── server.ts           # 서버 클라이언트
│   │   └── middleware.ts       # 미들웨어용 클라이언트
│   ├── services/               # 비즈니스 로직
│   │   ├── auth.service.ts
│   │   └── workout.service.ts
│   └── repositories/           # DB 쿼리
│       ├── member.repository.ts
│       └── workout.repository.ts
├── types/
│   ├── database.types.ts       # Supabase 자동 생성 타입
│   ├── member.types.ts
│   └── workout.types.ts
├── middleware.ts               # 인증 미들웨어
└── ...config files
```

## 2. 파일 네이밍 규칙
- 컴포넌트: PascalCase (`WorkoutCard.tsx`)
- 유틸/서비스/레포지토리: camelCase + 역할 suffix (`workout.service.ts`)
- 라우트 파일: Next.js 컨벤션 (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- 타입 파일: camelCase + `.types.ts`

## 3. 컴포넌트 규칙
- 서버 컴포넌트를 기본으로 사용한다
- 인터랙션이 필요한 경우에만 `'use client'`를 추가한다
- 컴포넌트 파일 하나에 컴포넌트 하나를 원칙으로 한다
- props 타입은 `interface`로 정의하고 컴포넌트 파일 내에 선언한다

## 4. Supabase 클라이언트 사용 규칙
- `lib/supabase/server.ts`: Server Components, Route Handlers, Server Actions
- `lib/supabase/client.ts`: Client Components
- `lib/supabase/middleware.ts`: `middleware.ts`에서만 사용
- 클라이언트를 직접 import하지 않고 반드시 래퍼 함수를 통해 사용한다

## 5. 데이터 페칭 규칙
- 목록 조회는 서버 컴포넌트에서 수행한다
- 실시간 업데이트가 필요한 경우 Supabase Realtime을 사용한다
- `revalidatePath` / `revalidateTag`로 캐시를 관리한다
- Server Actions를 mutation(생성/수정/삭제)에 사용한다

## 6. 환경 변수 규칙
- `NEXT_PUBLIC_SUPABASE_URL`: 공개 (클라이언트 접근 허용)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 공개 (클라이언트 접근 허용)
- `SUPABASE_SERVICE_ROLE_KEY`: 비공개 (서버에서만 사용, 절대 클라이언트 노출 금지)

## 7. 타입 규칙
- `any` 사용 금지. 불가피한 경우 `unknown` 사용 후 타입 가드 적용
- Supabase 타입은 `supabase gen types` CLI로 자동 생성하여 `database.types.ts`에 저장
- 도메인 타입은 DB 타입을 기반으로 필요한 경우에만 별도 정의

## 8. 에러 처리 규칙
- 서비스 레이어: `try/catch`로 에러를 잡아 `{ data: null, error: Error }` 반환
- Server Actions: `{ success: boolean, error?: string }` 형태로 반환
- UI: 에러 상태를 항상 화면에 표시 (toast 또는 인라인 메시지)
