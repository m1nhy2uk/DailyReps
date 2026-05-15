"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProfile, updateProfile } from "@/lib/repositories/member.repository";
import type { Profile } from "@/types/member.types";

function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type ProfileActionState = { error?: string; success?: boolean };

const NICKNAME_RE = /^[a-zA-Z0-9가-힣_]{2,20}$/;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const nickname = (formData.get("nickname") as string)?.trim();

  if (!nickname || !NICKNAME_RE.test(nickname)) {
    return { error: "닉네임은 2~20자이며 영문/한글/숫자/언더스코어만 허용됩니다" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다" };

  // 3대 기록
  const parseKg = (v: FormDataEntryValue | null) => {
    if (!v || v === "") return null;
    const n = parseFloat(v as string);
    return isNaN(n) || n < 0 || n > 999.9 ? null : n;
  };
  const bench_press_kg = parseKg(formData.get("bench_press_kg"));
  const squat_kg = parseKg(formData.get("squat_kg"));
  const deadlift_kg = parseKg(formData.get("deadlift_kg"));

  const avatarFile = formData.get("avatar") as File | null;
  let avatar_url: string | undefined;

  if (avatarFile && avatarFile.size > 0) {
    if (!ALLOWED_MIME.includes(avatarFile.type)) {
      return { error: "JPG, PNG, WebP, GIF 형식만 업로드 가능합니다" };
    }
    if (avatarFile.size > MAX_BYTES) {
      return { error: "이미지 크기는 2MB 이하여야 합니다" };
    }

    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (uploadError) return { error: "이미지 업로드에 실패했습니다" };

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    avatar_url = publicUrl;
  }

  const input = {
    nickname,
    bench_press_kg,
    squat_kg,
    deadlift_kg,
    ...(avatar_url !== undefined ? { avatar_url } : {}),
  };
  const result = await updateProfile(supabase, user.id, input);

  if (result.error) return { error: result.error };

  revalidatePath("/profile");
  return { success: true };
}

export async function getOrCreateProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await getProfile(supabase, user.id);
  if (profile) return profile;

  // profiles 행이 없으면 admin 클라이언트로 생성 (RLS 우회)
  const adminClient = createAdminClient();
  const nickname = user.email?.split("@")[0] ?? "사용자";

  const { data: created, error } = await adminClient
    .from("profiles")
    .insert({ id: user.id, nickname })
    .select("id, nickname, avatar_url, bench_press_kg, squat_kg, deadlift_kg, created_at, updated_at")
    .single();

  if (error || !created) return null;
  return created as unknown as Profile;
}

export async function deleteAccountAction(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) return { error: "탈퇴 처리 중 오류가 발생했습니다" };

  redirect("/login");
}
