export default function WorkoutListLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-muted rounded w-28" />
        <div className="h-9 bg-muted rounded-xl w-24" />
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-7 bg-muted rounded" />
        <div className="h-5 bg-muted rounded w-28" />
        <div className="h-7 w-7 bg-muted rounded" />
      </div>

      {/* 세션 카드 목록 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border rounded-xl px-4 py-3 flex flex-col gap-1.5"
        >
          <div className="h-4 bg-muted rounded w-36" />
          <div className="h-3 bg-muted/60 rounded w-56" />
          <div className="h-3 bg-muted/60 rounded w-24 mt-0.5" />
        </div>
      ))}
    </div>
  );
}
