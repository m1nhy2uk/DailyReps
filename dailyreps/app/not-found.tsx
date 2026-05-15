import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl font-bold text-zinc-100">404</p>
      <h1 className="text-xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-muted-foreground">
        요청하신 페이지가 존재하지 않거나 이동되었습니다
      </p>
      <Link
        href="/"
        className="mt-2 text-sm font-medium underline underline-offset-4 hover:text-foreground transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
