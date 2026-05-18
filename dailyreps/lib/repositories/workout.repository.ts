import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ServiceResult } from "@/types/common.types";
import type { WorkoutSessionWithEntries } from "@/types/workout.types";

type SB = SupabaseClient<Database>;

// 중첩 쿼리 응답 형태
type RawSet = {
  id: string;
  entry_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  deleted_at: string | null;
};
type RawEntry = {
  id: string;
  session_id: string;
  exercise_name: string;
  order_index: number;
  deleted_at: string | null;
  workout_sets: RawSet[] | null;
};
type RawSession = {
  id: string;
  session_date: string;
  workout_entries: RawEntry[] | null;
};

export async function getSessionWithEntries(
  supabase: SB,
  userId: string,
  date: string
): Promise<ServiceResult<WorkoutSessionWithEntries | null>> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(
      `id, session_date,
       workout_entries (
         id, session_id, exercise_name, order_index, deleted_at,
         workout_sets ( id, entry_id, set_number, weight_kg, reps, deleted_at )
       )`
    )
    .eq("user_id", userId)
    .eq("session_date", date)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  const raw = data as unknown as RawSession;

  const entries = (raw.workout_entries ?? [])
    .filter((e) => e.deleted_at === null)
    .sort((a, b) => a.order_index - b.order_index)
    .map((e) => ({
      id: e.id,
      session_id: e.session_id,
      user_id: userId,
      exercise_name: e.exercise_name,
      order_index: e.order_index,
      created_at: "",
      updated_at: "",
      sets: (e.workout_sets ?? [])
        .filter((s) => s.deleted_at === null)
        .sort((a, b) => a.set_number - b.set_number)
        .map((s) => ({
          id: s.id,
          entry_id: s.entry_id,
          set_number: s.set_number,
          weight_kg: s.weight_kg,
          reps: s.reps,
        })),
    }));

  return {
    data: {
      id: raw.id,
      user_id: userId,
      session_date: raw.session_date,
      memo: null,
      created_at: "",
      updated_at: "",
      entries,
    },
    error: null,
  };
}

export async function getOrCreateSession(
  supabase: SB,
  userId: string,
  date: string
): Promise<ServiceResult<string>> {
  // 기존 세션 조회
  const { data: existing } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("session_date", date)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) return { data: existing.id, error: null };

  // 세션 생성
  const { data: created, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: userId, session_date: date })
    .select("id")
    .single();

  if (error || !created) return { data: null, error: error?.message ?? "세션 생성 실패" };
  return { data: created.id, error: null };
}

export async function insertEntry(
  supabase: SB,
  sessionId: string,
  userId: string,
  exerciseName: string,
  orderIndex: number
): Promise<ServiceResult<string>> {
  const { data, error } = await supabase
    .from("workout_entries")
    .insert({ session_id: sessionId, user_id: userId, exercise_name: exerciseName, order_index: orderIndex })
    .select("id")
    .single();

  if (error || !data) return { data: null, error: error?.message ?? "종목 추가 실패" };
  return { data: data.id, error: null };
}

export async function softDeleteEntry(
  supabase: SB,
  entryId: string
): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from("workout_entries")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", entryId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function patchEntryName(
  supabase: SB,
  entryId: string,
  name: string
): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from("workout_entries")
    .update({ exercise_name: name })
    .eq("id", entryId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function insertSet(
  supabase: SB,
  entryId: string,
  userId: string,
  setNumber: number,
  weightKg: number,
  reps: number
): Promise<ServiceResult<string>> {
  const { data, error } = await supabase
    .from("workout_sets")
    .insert({ entry_id: entryId, user_id: userId, set_number: setNumber, weight_kg: weightKg, reps })
    .select("id")
    .single();

  if (error || !data) return { data: null, error: error?.message ?? "세트 추가 실패" };
  return { data: data.id, error: null };
}

export async function patchSet(
  supabase: SB,
  setId: string,
  weightKg: number,
  reps: number
): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from("workout_sets")
    .update({ weight_kg: weightKg, reps })
    .eq("id", setId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function softDeleteSet(
  supabase: SB,
  setId: string
): Promise<ServiceResult<null>> {
  const { error } = await supabase
    .from("workout_sets")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", setId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export type SessionSummary = {
  id: string;
  session_date: string;
  exercise_names: string[];
  total_entries: number;
  total_sets: number;
};

/** 월별 세션 목록 + 종목·세트 수 요약 (운동 기록 목록 페이지용) */
export async function getSessionsWithSummaryByMonth(
  supabase: SB,
  userId: string,
  year: number,
  month: number
): Promise<ServiceResult<SessionSummary[]>> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("workout_sessions")
    .select(
      `id, session_date,
       workout_entries (
         exercise_name, deleted_at,
         workout_sets ( deleted_at )
       )`
    )
    .eq("user_id", userId)
    .gte("session_date", startDate)
    .lt("session_date", endDate)
    .is("deleted_at", null)
    .order("session_date", { ascending: false });

  if (error) return { data: null, error: error.message };

  type RawEntry = {
    exercise_name: string;
    deleted_at: string | null;
    workout_sets: Array<{ deleted_at: string | null }> | null;
  };
  type RawSession = {
    id: string;
    session_date: string;
    workout_entries: RawEntry[] | null;
  };

  const sessions: SessionSummary[] = (data as unknown as RawSession[]).map((s) => {
    const entries = (s.workout_entries ?? []).filter((e) => e.deleted_at === null);

    const seen = new Set<string>();
    const exerciseNames: string[] = [];
    let totalSets = 0;

    for (const e of entries) {
      if (!seen.has(e.exercise_name)) {
        seen.add(e.exercise_name);
        exerciseNames.push(e.exercise_name);
      }
      totalSets += (e.workout_sets ?? []).filter((ws) => ws.deleted_at === null).length;
    }

    return {
      id: s.id,
      session_date: s.session_date,
      exercise_names: exerciseNames,
      total_entries: entries.length,
      total_sets: totalSets,
    };
  });

  return { data: sessions, error: null };
}

/**
 * 종목명 자동완성 — 사용자의 기존 기록에서 query와 일치하는 이름을 최근순으로 반환
 * % _ 특수문자 이스케이프 처리
 */
export async function findExerciseNames(
  supabase: SB,
  userId: string,
  query: string
): Promise<ServiceResult<string[]>> {
  const q = query.trim();
  if (!q) return { data: [], error: null };

  // LIKE 특수문자 이스케이프
  const escaped = q.replace(/%/g, "\\%").replace(/_/g, "\\_");

  const { data, error } = await supabase
    .from("workout_entries")
    .select("exercise_name, created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .ilike("exercise_name", `%${escaped}%`)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return { data: null, error: error.message };

  // 중복 제거 (최근 사용 순서 유지, 대소문자 구분)
  const seen = new Set<string>();
  const names: string[] = [];
  for (const row of data ?? []) {
    if (!seen.has(row.exercise_name)) {
      seen.add(row.exercise_name);
      names.push(row.exercise_name);
      if (names.length >= 5) break;
    }
  }

  return { data: names, error: null };
}

export type SessionWithExercises = {
  date: string;
  exerciseNames: string[];
};

type RawSessionWithExerciseEntries = {
  session_date: string;
  workout_entries: { exercise_name: string; deleted_at: string | null }[] | null;
};

/** 월별 세션 + 종목명 목록 (달력 카테고리 표시용) */
export async function getSessionCategoriesByMonth(
  supabase: SB,
  userId: string,
  year: number,
  month: number
): Promise<ServiceResult<SessionWithExercises[]>> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const { data, error } = (await supabase
    .from("workout_sessions")
    .select("session_date, workout_entries(exercise_name, deleted_at)")
    .eq("user_id", userId)
    .gte("session_date", startDate)
    .lt("session_date", endDate)
    .is("deleted_at", null)) as unknown as {
    data: RawSessionWithExerciseEntries[] | null;
    error: unknown;
  };

  if (error) return { data: null, error: "달력 데이터 조회에 실패했습니다" };

  const result = (data ?? []).map((s) => ({
    date: s.session_date,
    exerciseNames: (s.workout_entries ?? [])
      .filter((e) => e.deleted_at === null)
      .map((e) => e.exercise_name),
  }));

  return { data: result, error: null };
}

/** 월별 운동 날짜 목록 (달력 표시용) */
export async function getSessionDatesByMonth(
  supabase: SB,
  userId: string,
  year: number,
  month: number
): Promise<ServiceResult<string[]>> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("session_date")
    .eq("user_id", userId)
    .gte("session_date", startDate)
    .lt("session_date", endDate)
    .is("deleted_at", null)
    .order("session_date");

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map((r) => r.session_date), error: null };
}

export type RecentSession = {
  id: string;
  session_date: string;
  exercise_names: string[];
};

/** 최근 세션 + 종목 이름 목록 (요약 카드용) */
export async function getRecentSessionsWithEntries(
  supabase: SB,
  userId: string,
  limit = 5
): Promise<ServiceResult<RecentSession[]>> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(
      `id, session_date,
       workout_entries ( exercise_name, deleted_at )`
    )
    .eq("user_id", userId)
    .is("deleted_at", null)
    .lte("session_date", new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("session_date", { ascending: false })
    .limit(limit);

  if (error) return { data: null, error: error.message };

  type RawRecent = {
    id: string;
    session_date: string;
    workout_entries: Array<{ exercise_name: string; deleted_at: string | null }> | null;
  };

  const sessions: RecentSession[] = (data as unknown as RawRecent[]).map((s) => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const e of s.workout_entries ?? []) {
      if (e.deleted_at !== null) continue;
      if (!seen.has(e.exercise_name)) {
        seen.add(e.exercise_name);
        names.push(e.exercise_name);
      }
    }
    return { id: s.id, session_date: s.session_date, exercise_names: names };
  });

  return { data: sessions, error: null };
}

export async function getExerciseNameByEntryId(supabase: SB, entryId: string): Promise<string | null> {
  const { data } = await supabase
    .from("workout_entries")
    .select("exercise_name")
    .eq("id", entryId)
    .single();
  return data?.exercise_name ?? null;
}

export async function getExerciseNameBySetId(supabase: SB, setId: string): Promise<string | null> {
  const { data } = await supabase
    .from("workout_sets")
    .select("entry_id, workout_entries(exercise_name)")
    .eq("id", setId)
    .single();
  const entry = data?.workout_entries as { exercise_name: string } | null;
  return entry?.exercise_name ?? null;
}

export type WorkoutStats = {
  totalSessions: number;
  thisMonthSessions: number;
  currentStreak: number;
  totalSets: number;
  topExercises: { name: string; count: number }[];
};

/** 프로필 통계 */
export async function getWorkoutStats(
  supabase: SB,
  userId: string
): Promise<WorkoutStats> {
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const thisMonthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const [sessionsRes, setsRes, exercisesRes] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("session_date")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("session_date", { ascending: false }),
    supabase
      .from("workout_sets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null),
    supabase
      .from("workout_entries")
      .select("exercise_name")
      .eq("user_id", userId)
      .is("deleted_at", null),
  ]);

  const dates = (sessionsRes.data ?? []).map((s) => s.session_date);
  const totalSessions = dates.length;
  const thisMonthSessions = dates.filter((d) => d >= thisMonthStart).length;
  const totalSets = setsRes.count ?? 0;

  // 연속 운동 일수
  const todayStr = now.toISOString().split("T")[0];
  const dateSet = new Set(dates);
  let currentStreak = 0;
  const cursor = new Date(now);
  // 오늘 운동 안 했으면 어제부터 체크
  if (!dateSet.has(todayStr)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (true) {
    const d = cursor.toISOString().split("T")[0];
    if (!dateSet.has(d)) break;
    currentStreak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  // 많이 한 종목 Top 3
  const nameCount = new Map<string, number>();
  for (const row of exercisesRes.data ?? []) {
    nameCount.set(row.exercise_name, (nameCount.get(row.exercise_name) ?? 0) + 1);
  }
  const topExercises = [...nameCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  return { totalSessions, thisMonthSessions, currentStreak, totalSets, topExercises };
}

/** 전체 운동 세션 수 */
export async function getTotalSessionCount(
  supabase: SB,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("workout_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("deleted_at", null);
  return count ?? 0;
}

export async function getMaxOrderIndex(
  supabase: SB,
  sessionId: string
): Promise<number> {
  const { data } = await supabase
    .from("workout_entries")
    .select("order_index")
    .eq("session_id", sessionId)
    .is("deleted_at", null)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.order_index ?? -1;
}
