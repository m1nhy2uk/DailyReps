"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthActionState } from "@/lib/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
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
          autoComplete="current-password"
          placeholder="비밀번호 입력"
          disabled={pending}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "로그인 중..." : "로그인"}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-foreground hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
