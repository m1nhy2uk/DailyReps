# DailyReps

날짜별 운동 종목, 세트, 무게를 기록하는 개인 운동 기록 앱입니다.

## 기술 스택

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, ShadCN UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)

## 주요 기능

- 회원가입 / 로그인 / 로그아웃 / 회원 탈퇴
- 날짜별 운동 기록 (종목 추가, 세트·무게 입력, 수정, 삭제)
- 종목 자동완성
- 대시보드 — 월별 달력 (카테고리 컬러 점, 진행률 바), 최근 운동 기록
- 월별 운동 목록
- 프로필 수정 (닉네임, 아바타 이미지)
- 반응형 디자인 (모바일 하단 탭 바)
- 다크모드 지원

## 로컬 실행

1. 패키지 설치

```bash
cd dailyreps
npm install
```

2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`에 Supabase 프로젝트 URL과 anon key를 입력합니다.

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 프로젝트 구조

```
dailyreps/
├── app/
│   ├── (auth)/          # 로그인, 회원가입
│   └── (protected)/     # 인증 필요 페이지
│       ├── dashboard/   # 대시보드
│       ├── workout/     # 운동 기록 목록 및 날짜별 편집
│       └── profile/     # 프로필
├── components/ui/       # ShadCN UI 컴포넌트
├── lib/
│   ├── repositories/    # DB 쿼리
│   ├── services/        # 비즈니스 로직
│   └── supabase/        # Supabase 클라이언트
└── types/               # TypeScript 타입 정의
```
