// animate-pulse를 부모에 적용 → 모든 자식 요소가 함께 페이드 처리됨
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-8 bg-muted rounded w-28" />
          <div className="h-4 bg-muted/60 rounded w-32" />
        </div>
        <div className="h-9 bg-muted rounded-xl w-24" />
      </div>

      {/* 달력 영역 */}
      <div className="flex flex-col gap-3">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-6 bg-muted rounded" />
          <div className="h-5 bg-muted rounded w-24" />
          <div className="h-6 w-6 bg-muted rounded" />
        </div>

        {/* 진행률 바 */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <div className="h-3 bg-muted/60 rounded w-20" />
            <div className="h-3 bg-muted/60 rounded w-24" />
          </div>
          <div className="h-1.5 bg-muted/60 rounded-full" />
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 pb-1 border-b">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted/60 rounded mx-auto w-4" />
          ))}
        </div>

        {/* 날짜 그리드 (5줄) */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: 7 }).map((_, col) => (
              <div key={col} className="h-10 bg-muted/60 rounded-lg mx-0.5" />
            ))}
          </div>
        ))}
      </div>

      {/* 최근 운동 기록 섹션 */}
      <div className="flex flex-col gap-3">
        <div className="h-4 bg-muted rounded w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted/60 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
