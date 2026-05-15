-- ============================================================
-- FitLog 초기 스키마
-- Supabase SQL Editor에서 전체 실행
-- ============================================================


-- ============================================================
-- 공통: updated_at 자동 갱신 트리거 함수
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 회원 도메인: profiles
-- ============================================================

CREATE TABLE public.profiles (
  id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname    text        NOT NULL,
  avatar_url  text        DEFAULT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  deleted_at  timestamptz DEFAULT NULL
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: view own"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- updated_at 트리거
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 회원가입 시 자동 프로필 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 운동 도메인: workout_sessions
-- ============================================================

CREATE TABLE public.workout_sessions (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_date date        NOT NULL,
  memo         text        DEFAULT NULL,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL,
  deleted_at   timestamptz DEFAULT NULL,
  UNIQUE (user_id, session_date)
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_sessions: view own"
ON public.workout_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "workout_sessions: insert own"
ON public.workout_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_sessions: update own"
ON public.workout_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "workout_sessions: delete own"
ON public.workout_sessions FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER trg_workout_sessions_updated_at
BEFORE UPDATE ON public.workout_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_workout_sessions_user_date
ON public.workout_sessions (user_id, session_date DESC);


-- ============================================================
-- 운동 도메인: workout_entries
-- ============================================================

CREATE TABLE public.workout_entries (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    uuid        REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name text        NOT NULL,
  order_index   integer     NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL,
  deleted_at    timestamptz DEFAULT NULL
);

ALTER TABLE public.workout_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_entries: view own"
ON public.workout_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "workout_entries: insert own"
ON public.workout_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_entries: update own"
ON public.workout_entries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "workout_entries: delete own"
ON public.workout_entries FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER trg_workout_entries_updated_at
BEFORE UPDATE ON public.workout_entries
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_workout_entries_session
ON public.workout_entries (session_id);


-- ============================================================
-- 운동 도메인: workout_sets
-- ============================================================

CREATE TABLE public.workout_sets (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id    uuid          REFERENCES public.workout_entries(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid          REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  set_number  integer       NOT NULL,
  weight_kg   numeric(5,1)  NOT NULL CHECK (weight_kg >= 0),
  reps        integer       NOT NULL CHECK (reps >= 1),
  created_at  timestamptz   DEFAULT now() NOT NULL,
  updated_at  timestamptz   DEFAULT now() NOT NULL,
  deleted_at  timestamptz   DEFAULT NULL
);

ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_sets: view own"
ON public.workout_sets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "workout_sets: insert own"
ON public.workout_sets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_sets: update own"
ON public.workout_sets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "workout_sets: delete own"
ON public.workout_sets FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER trg_workout_sets_updated_at
BEFORE UPDATE ON public.workout_sets
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_workout_sets_entry
ON public.workout_sets (entry_id);
