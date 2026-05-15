# 운동 도메인 규칙

## 1. DB 스키마

```sql
-- 운동 세션 (날짜별)
CREATE TABLE public.workout_sessions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_date date       NOT NULL,
  memo        text        DEFAULT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  deleted_at  timestamptz DEFAULT NULL,
  UNIQUE (user_id, session_date)
);

-- 운동 항목 (세션 내 종목)
CREATE TABLE public.workout_entries (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  uuid        REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name text      NOT NULL,
  order_index integer     NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  deleted_at  timestamptz DEFAULT NULL
);

-- 세트 기록
CREATE TABLE public.workout_sets (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id    uuid        REFERENCES public.workout_entries(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  set_number  integer     NOT NULL,
  weight_kg   numeric(5,1) NOT NULL CHECK (weight_kg >= 0),
  reps        integer     NOT NULL CHECK (reps >= 1),
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  deleted_at  timestamptz DEFAULT NULL
);

-- RLS 활성화
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets     ENABLE ROW LEVEL SECURITY;

-- workout_sessions 정책
CREATE POLICY "workout_sessions: view own"   ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workout_sessions: insert own" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_sessions: update own" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workout_sessions: delete own" ON public.workout_sessions FOR DELETE USING (auth.uid() = user_id);

-- workout_entries 정책
CREATE POLICY "workout_entries: view own"   ON public.workout_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workout_entries: insert own" ON public.workout_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_entries: update own" ON public.workout_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workout_entries: delete own" ON public.workout_entries FOR DELETE USING (auth.uid() = user_id);

-- workout_sets 정책
CREATE POLICY "workout_sets: view own"   ON public.workout_sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workout_sets: insert own" ON public.workout_sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_sets: update own" ON public.workout_sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workout_sets: delete own" ON public.workout_sets FOR DELETE USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_workout_sessions_user_date ON public.workout_sessions (user_id, session_date DESC);
CREATE INDEX idx_workout_entries_session    ON public.workout_entries (session_id);
CREATE INDEX idx_workout_sets_entry         ON public.workout_sets (entry_id);
```

## 2. 타입 정의

```typescript
// types/workout.types.ts

export interface WorkoutSession {
  id: string;
  user_id: string;
  session_date: string;       // YYYY-MM-DD
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutEntry {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  order_index: number;
  sets?: WorkoutSet[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  id: string;
  entry_id: string;
  user_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  created_at: string;
  updated_at: string;
}

// 입력 타입
export interface CreateSessionInput {
  session_date: string;
  memo?: string;
}

export interface CreateEntryInput {
  session_id: string;
  exercise_name: string;
  order_index?: number;
}

export interface CreateSetInput {
  entry_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface UpdateSetInput {
  weight_kg?: number;
  reps?: number;
}
```

## 3. 서비스 함수 목록

```typescript
// lib/services/workout.service.ts

// 세션
getOrCreateSession(userId: string, date: string): Promise<ServiceResult<WorkoutSession>>
getSessionsByMonth(userId: string, year: number, month: number): Promise<ServiceResult<WorkoutSession[]>>
getSessionByDate(userId: string, date: string): Promise<ServiceResult<WorkoutSession | null>>
updateSessionMemo(sessionId: string, memo: string): Promise<ServiceResult<WorkoutSession>>
deleteSession(sessionId: string): Promise<ServiceResult<null>>

// 운동 항목
getEntriesBySession(sessionId: string): Promise<ServiceResult<WorkoutEntry[]>>
createEntry(input: CreateEntryInput): Promise<ServiceResult<WorkoutEntry>>
updateEntryName(entryId: string, name: string): Promise<ServiceResult<WorkoutEntry>>
deleteEntry(entryId: string): Promise<ServiceResult<null>>

// 세트
createSet(input: CreateSetInput): Promise<ServiceResult<WorkoutSet>>
updateSet(setId: string, input: UpdateSetInput): Promise<ServiceResult<WorkoutSet>>
deleteSet(setId: string): Promise<ServiceResult<null>>

// 자동완성
getRecentExerciseNames(userId: string, query: string): Promise<ServiceResult<string[]>>
```

## 4. 유효성 검사 규칙
- `session_date`: `YYYY-MM-DD` 형식, 유효한 날짜 검사
- `exercise_name`: 1~50자, 공백만으로 구성 불가
- `weight_kg`: 0 이상 999.9 이하 숫자
- `reps`: 1 이상 999 이하 정수
- `set_number`: 1 이상 정수, 동일 entry 내 중복 불가

## 5. 라우트 구조
| 경로 | 설명 | 인증 필요 |
|------|------|-----------|
| `/dashboard` | 최근 운동 요약, 달력 | 예 |
| `/workout` | 운동 기록 목록 | 예 |
| `/workout/[date]` | 날짜별 운동 기록 상세/편집 | 예 |

## 6. UI 동작 규칙
- 날짜 기본값은 오늘 날짜로 설정한다
- 세션이 없는 날짜로 접근 시 빈 세션을 표시하고 첫 운동 추가 시 자동 생성한다
- 세트 추가 시 직전 세트의 무게/횟수를 기본값으로 복사한다
- 운동 항목 삭제 시 해당 항목의 모든 세트도 함께 삭제된다 (ON DELETE CASCADE)
