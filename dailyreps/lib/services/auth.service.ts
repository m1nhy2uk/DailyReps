"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string };

// ─── 유효성 검사 ────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NICKNAME_RE = /^[a-zA-Z0-9가-힣_]{2,20}$/;

function validateEmail(v: string): string | null {
  if (!v) return "이메일을 입력해주세요";
  if (!EMAIL_RE.test(v)) return "올바른 이메일 형식이 아닙니다";
  return null;
}

function validatePassword(v: string): string | null {
  if (!v) return "비밀번호를 입력해주세요";
  if (v.length < 8) return "비밀번호는 8자 이상이어야 합니다";
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v))
    return "비밀번호는 영문과 숫자를 포함해야 합니다";
  return null;
}

function validateNickname(v: string): string | null {
  if (!v) return "닉네임을 입력해주세요";
  if (!NICKNAME_RE.test(v))
    return "닉네임은 2~20자이며 영문/한글/숫자/언더스코어만 허용됩니다";
  return null;
}

// ─── Server Actions ──────────────────────────────────────────

export async function signIn(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  const emailErr = validateEmail(email);
  if (emailErr) return { error: emailErr };

  if (!password) return { error: "비밀번호를 입력해주세요" };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: "이메일 또는 비밀번호가 올바르지 않습니다" };
  } catch {
    return { error: "로그인 중 오류가 발생했습니다" };
  }

  redirect("/dashboard");
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const nickname = (formData.get("nickname") as string)?.trim();

  const emailErr = validateEmail(email);
  if (emailErr) return { error: emailErr };

  const pwErr = validatePassword(password);
  if (pwErr) return { error: pwErr };

  const nickErr = validateNickname(nickname);
  if (nickErr) return { error: nickErr };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    });

    if (error) {
      if (error.message.includes("already registered"))
        return { error: "이미 사용 중인 이메일입니다" };
      return { error: "회원가입 중 오류가 발생했습니다" };
    }
  } catch {
    return { error: "회원가입 중 오류가 발생했습니다" };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
