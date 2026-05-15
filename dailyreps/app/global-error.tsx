"use client";

import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-4xl">⚠️</p>
        <h1 className="text-xl font-semibold">서비스에 문제가 발생했습니다</h1>
        <p className="text-sm text-muted-foreground">
          페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">
            오류 코드: {error.digest}
          </p>
        )}
        <button
          onClick={unstable_retry}
          className="mt-2 bg-foreground text-background text-sm font-medium rounded-lg px-4 py-2 hover:bg-foreground/90 transition-colors"
        >
          새로고침
        </button>
      </body>
    </html>
  );
}
