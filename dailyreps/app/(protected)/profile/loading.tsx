export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* 헤더 */}
      <div className="flex flex-col gap-2">
        <div className="h-8 bg-muted rounded w-20" />
        <div className="h-4 bg-muted/60 rounded w-44" />
      </div>

      {/* 아바타 */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-24 h-24 rounded-full bg-muted" />
        <div className="h-3 bg-muted/60 rounded w-40" />
      </div>

      {/* 닉네임 필드 */}
      <div className="flex flex-col gap-1.5">
        <div className="h-4 bg-muted rounded w-14" />
        <div className="h-11 bg-muted/60 rounded-lg" />
        <div className="h-3 bg-muted/60 rounded w-48" />
      </div>

      {/* 저장 버튼 */}
      <div className="h-11 bg-muted rounded-lg" />
    </div>
  );
}
