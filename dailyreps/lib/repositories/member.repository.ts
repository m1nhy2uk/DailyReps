import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ServiceResult } from "@/types/common.types";
import type { Profile } from "@/types/member.types";

type SB = SupabaseClient<Database>;

export async function getProfile(client: SB, userId: string): Promise<ServiceResult<Profile>> {
  try {
    const { data, error } = await client
      .from("profiles")
      .select("id, nickname, avatar_url, bench_press_kg, squat_kg, deadlift_kg, created_at, updated_at")
      .eq("id", userId)
      .maybeSingle(); // 행이 없으면 null 반환 (throw 안 함)

    if (error) throw error;
    return { data, error: null };
  } catch {
    return { data: null, error: "프로필 조회에 실패했습니다" };
  }
}

export async function updateProfile(
  client: SB,
  userId: string,
  input: {
    nickname?: string;
    avatar_url?: string | null;
    bench_press_kg?: number | null;
    squat_kg?: number | null;
    deadlift_kg?: number | null;
  }
): Promise<ServiceResult<Profile>> {
  try {
    const { data, error } = await client
      .from("profiles")
      .update(input)
      .eq("id", userId)
      .select("id, nickname, avatar_url, bench_press_kg, squat_kg, deadlift_kg, created_at, updated_at")
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch {
    return { data: null, error: "프로필 수정에 실패했습니다" };
  }
}
