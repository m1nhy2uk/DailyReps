"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as repo from "@/lib/repositories/workout.repository";
import { getProfile, updateProfile } from "@/lib/repositories/member.repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type SB = SupabaseClient<Database>;

const BIG3_FIELD: Record<string, "bench_press_kg" | "squat_kg" | "deadlift_kg"> = {
  "벤치프레스": "bench_press_kg",
  "benchpress": "bench_press_kg",
  "스쿼트": "squat_kg",
  "squat": "squat_kg",
  "데드리프트": "deadlift_kg",
  "deadlift": "deadlift_kg",
};

async function maybeUpdatePR(supabase: SB, userId: string, exerciseName: string, weightKg: number) {
  const field = BIG3_FIELD[exerciseName.replace(/\s+/g, "").toLowerCase()];
  if (!field) return;
  const { data: profile } = await getProfile(supabase, userId);
  if (!profile) return;
  if ((profile[field] ?? 0) < weightKg) {
    await updateProfile(supabase, userId, { [field]: weightKg });
  }
}

export type WorkoutActionState = { error?: string };

// ─── 유효성 검사 ────────────────────────────────────────────

function validateExerciseName(v: string): string | null {
  const t = v.trim();
  if (!t) return "종목 이름을 입력해주세요";
  if (t.length > 50) return "종목 이름은 50자 이하여야 합니다";
  return null;
}

function validateWeight(v: number): string | null {
  if (isNaN(v) || v < 0 || v > 999.9) return "무게는 0~999.9 사이여야 합니다";
  return null;
}

function validateReps(v: number): string | null {
  if (!Number.isInteger(v) || v < 1 || v > 999) return "횟수는 1~999 사이 정수여야 합니다";
  return null;
}

// ─── 현재 사용자 가져오기 ──────────────────────────────────

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다");
  return { supabase, userId: user.id };
}

// ─── Server Actions ──────────────────────────────────────────

/** 종목 추가 — 세션이 없으면 자동 생성 (FormData 기반, useActionState 용) */
export async function createEntryAction(
  _prev: WorkoutActionState,
  formData: FormData
): Promise<WorkoutActionState> {
  const exerciseName = (formData.get("exercise_name") as string) ?? "";
  const date = formData.get("date") as string;

  const nameErr = validateExerciseName(exerciseName);
  if (nameErr) return { error: nameErr };

  try {
    const { supabase, userId } = await requireUser();

    const { data: sessionId, error: sessionErr } = await repo.getOrCreateSession(supabase, userId, date);
    if (sessionErr || !sessionId) return { error: sessionErr ?? "세션 생성 실패" };

    const nextIndex = (await repo.getMaxOrderIndex(supabase, sessionId)) + 1;
    const { error } = await repo.insertEntry(supabase, sessionId, userId, exerciseName.trim(), nextIndex);
    if (error) return { error };
  } catch {
    return { error: "종목 추가 중 오류가 발생했습니다" };
  }

  revalidatePath(`/workout/${date}`);
  return {};
}

/** 종목 삭제 (소프트) */
export async function deleteEntry(entryId: string, date: string): Promise<WorkoutActionState> {
  try {
    const { supabase } = await requireUser();
    const { error } = await repo.softDeleteEntry(supabase, entryId);
    if (error) return { error };
  } catch {
    return { error: "종목 삭제 중 오류가 발생했습니다" };
  }

  revalidatePath(`/workout/${date}`);
  return {};
}

/** 종목 이름 수정 */
export async function updateEntryName(
  entryId: string,
  name: string,
  date: string
): Promise<WorkoutActionState> {
  const nameErr = validateExerciseName(name);
  if (nameErr) return { error: nameErr };

  try {
    const { supabase } = await requireUser();
    const { error } = await repo.patchEntryName(supabase, entryId, name.trim());
    if (error) return { error };
  } catch {
    return { error: "종목 이름 수정 중 오류가 발생했습니다" };
  }

  revalidatePath(`/workout/${date}`);
  return {};
}

/** 세트 추가 */
export async function addSet(
  entryId: string,
  setNumber: number,
  weightKg: number,
  reps: number,
  date: string
): Promise<WorkoutActionState> {
  const weightErr = validateWeight(weightKg);
  if (weightErr) return { error: weightErr };
  const repsErr = validateReps(reps);
  if (repsErr) return { error: repsErr };

  try {
    const { supabase, userId } = await requireUser();
    const { error } = await repo.insertSet(supabase, entryId, userId, setNumber, weightKg, reps);
    if (error) return { error };
    const exerciseName = await repo.getExerciseNameByEntryId(supabase, entryId);
    if (exerciseName) await maybeUpdatePR(supabase, userId, exerciseName, weightKg);
  } catch {
    return { error: "세트 추가 중 오류가 발생했습니다" };
  }

  revalidatePath(`/workout/${date}`);
  return {};
}

/** 세트 수정 */
export async function updateSet(
  setId: string,
  weightKg: number,
  reps: number,
  date: string
): Promise<WorkoutActionState> {
  const weightErr = validateWeight(weightKg);
  if (weightErr) return { error: weightErr };
  const repsErr = validateReps(reps);
  if (repsErr) return { error: repsErr };

  try {
    const { supabase, userId } = await requireUser();
    const { error } = await repo.patchSet(supabase, setId, weightKg, reps);
    if (error) return { error };
    const exerciseName = await repo.getExerciseNameBySetId(supabase, setId);
    if (exerciseName) await maybeUpdatePR(supabase, userId, exerciseName, weightKg);
  } catch {
    return { error: "세트 수정 중 오류가 발생했습니다" };
  }

  revalidatePath(`/workout/${date}`);
  return {};
}

/** 종목명 자동완성 검색 — 클라이언트에서 debounce 후 호출 */
export async function searchExerciseNames(query: string): Promise<string[]> {
  try {
    const { supabase, userId } = await requireUser();
    const { data } = await repo.findExerciseNames(supabase, userId, query);
    return data ?? [];
  } catch {
    return [];
  }
}

/** 여러 종목 한 번에 추가 */
export async function createMultipleEntries(names: string[], date: string): Promise<WorkoutActionState> {
  for (const name of names) {
    const err = validateExerciseName(name);
    if (err) return { error: err };
  }
  try {
    const { supabase, userId } = await requireUser();
    const { data: sessionId, error: sessionErr } = await repo.getOrCreateSession(supabase, userId, date);
    if (sessionErr || !sessionId) return { error: sessionErr ?? "세션 생성 실패" };

    let nextIndex = (await repo.getMaxOrderIndex(supabase, sessionId)) + 1;
    for (const name of names) {
      const { error } = await repo.insertEntry(supabase, sessionId, userId, name.trim(), nextIndex);
      if (error) return { error };
      nextIndex++;
    }
  } catch {
    return { error: "종목 추가 중 오류가 발생했습니다" };
  }
  revalidatePath(`/workout/${date}`);
  return {};
}

/** 세트 삭제 (소프트) */
export async function deleteSet(setId: string, date: string): Promise<WorkoutActionState> {
  try {
    const { supabase } = await requireUser();
    const { error } = await repo.softDeleteSet(supabase, setId);
    if (error) return { error };
  } catch {
    return { error: "세트 삭제 중 오류가 발생했습니다" };
  }

  revalidatePath(`/workout/${date}`);
  return {};
}
