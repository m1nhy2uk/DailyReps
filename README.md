# DailyReps

날짜별 운동 종목, 세트, 무게를 기록하는 개인 운동 기록 앱입니다.

## 기술 스택

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, ShadCN UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)

## 주요 기능

- 회원가입 / 로그인 / 로그아웃 / 회원 탈퇴
- 날짜별 운동 기록 (종목 추가, 세트·무게 입력, 수정, 삭제)
- 종목 자동완성 및 카테고리별 프리셋 선택 (다중 선택 지원)
- 운동 종목 카테고리 자동 분류 (가슴·어깨·등·하체·팔·복근·유산소)
- 대시보드 — 월별 달력 (카테고리 컬러 점, 진행률 바), 최근 운동 기록
- 월별 운동 목록
- 프로필 통계 대시보드 (총 운동 횟수, 이번 달, 연속 운동 일수, 총 세트 수, 자주 한 종목)
- 3대 기록 (벤치프레스·스쿼트·데드리프트) 입력 및 합계 표시
- 프로필 수정 (닉네임, 아바타 이미지)
- 반응형 디자인 (모바일 하단 탭 바)
- 다크모드 지원

## 에이전트 활용 방식

| **단계**      | **방식**                                            |
| ------------- | --------------------------------------------------- |
| **문서 작성** | CLAUDE.md 기반으로 docs 폴더 구조 및 TODO 자동 생성 |
| **기능 개발** | TODO-READY.md 작업 단위로 하나씩 지시               |
| **코드 검토** | 생성된 코드 직접 읽고 이해 후 다음 작업 진행        |

## 프로젝트 구조

**데이터 모델 (3계층)**

| **테이블**           | **역할**              | **주요 컬럼**                            |
| -------------------- | --------------------- | ---------------------------------------- |
| **profiles**         | 사용자 프로필         | id, nickname, avatar_url, bench_press_kg, squat_kg, deadlift_kg |
| **workout_sessions** | 운동 세션 (날짜 단위) | id, user_id, session_date                |
| **workout_entries**  | 세션 내 운동 종목     | id, session_id, exercise_name            |
| **workout_sets**     | 종목별 세트 기록      | id, entry_id, weight_kg, reps, set_number |

- **Member 도메인** → 회원가입, 로그인, 프로필
- **Workout 도메인** → 운동 세션, 종목, 세트 기록
- **Common 도메인** → 공통으로 쓰이는 것들 (DB 컬럼 규칙, 소프트 삭제 등)

```
dailyreps/
├── app/
│   ├── (auth)/          # 로그인, 회원가입
│   └── (protected)/     # 인증 필요 페이지
│       ├── dashboard/   # 대시보드
│       ├── workout/     # 운동 기록 목록 및 날짜별 편집
│       └── profile/     # 프로필 통계 / edit/ 수정
├── components/ui/       # ShadCN UI 컴포넌트
├── lib/
│   ├── repositories/    # DB 쿼리
│   ├── services/        # 비즈니스 로직
│   └── supabase/        # Supabase 클라이언트
└── types/               # TypeScript 타입 정의
```
