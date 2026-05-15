import Link from "next/link";

export default function ProtectedNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-6xl font-bold text-zinc-100">404</p>
      <h1 className="text-lg font-semibold">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-muted-foreground">
        요청하신 페이지가 존재하지 않거나 이동되었습니다
      </p>
      <Link
        href="/dashboard"
        className="mt-2 text-sm font-medium underline underline-offset-4 hover:text-foreground transition-colors"
      >
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
