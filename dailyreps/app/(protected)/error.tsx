"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function ProtectedError({ error, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    // 운영 환경에서는 Sentry 등 에러 리포팅 서비스로 전송
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-4xl">⚠️</p>
      <h1 className="text-lg font-semibold">오류가 발생했습니다</h1>
      <p className="text-sm text-muted-foreground">
        일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">
          오류 코드: {error.digest}
        </p>
      )}
      <div className="flex gap-3 mt-2">
        <button
          onClick={unstable_retry}
          className="bg-foreground text-background text-sm font-medium rounded-lg px-4 py-2 hover:bg-foreground/90 transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/dashboard"
          className="text-sm font-medium border rounded-lg px-4 py-2 hover:bg-accent transition-colors"
        >
          대시보드로
        </Link>
      </div>
    </div>
  );
}
