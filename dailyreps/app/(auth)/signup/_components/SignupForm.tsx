"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthActionState } from "@/lib/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export default function SignupForm() {
  const [state, action, pending] = useActionState(signUp, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          name="nickname"
          type="text"
          required
          autoComplete="username"
          placeholder="2~20자, 영문/한글/숫자/_"
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="example@email.com"
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="8자 이상, 영문+숫자 포함"
          disabled={pending}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "가입 중..." : "회원가입"}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
