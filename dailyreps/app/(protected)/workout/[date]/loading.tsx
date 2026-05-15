function SetRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pl-1 pr-3 w-12">
        <div className="h-4 bg-muted/60 rounded w-10" />
      </td>
      <td className="py-2 pr-2">
        <div className="flex items-center gap-1">
          <div className="h-8 bg-muted/60 rounded w-14 sm:w-20" />
          <div className="h-3 bg-muted/60 rounded w-5" />
        </div>
      </td>
      <td className="py-2 pr-2">
        <div className="flex items-center gap-1">
          <div className="h-8 bg-muted/60 rounded w-12 sm:w-16" />
          <div className="h-3 bg-muted/60 rounded w-4" />
        </div>
      </td>
      <td className="py-2 pr-1 text-right">
        <div className="h-5 w-5 bg-muted/60 rounded ml-auto" />
      </td>
    </tr>
  );
}

function EntryCardSkeleton({ sets }: { sets: number }) {
  return (
    <div className="border rounded-xl p-4 flex flex-col gap-3">
      {/* 종목명 + 삭제 버튼 */}
      <div className="flex items-center justify-between">
        <div className="h-5 bg-muted rounded w-36" />
        <div className="h-5 w-5 bg-muted/60 rounded" />
      </div>

      {/* 세트 테이블 */}
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {["w-8", "w-12", "w-10", "w-4"].map((w, i) => (
              <th key={i} className="pb-1 text-left">
                <div className={`h-3 bg-muted/60 rounded ${w}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: sets }).map((_, j) => (
            <SetRowSkeleton key={j} />
          ))}
        </tbody>
      </table>

      {/* 세트 추가 버튼 */}
      <div className="h-8 bg-muted/60 rounded-lg" />
    </div>
  );
}

export default function WorkoutDateLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* 날짜 헤더 */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 bg-muted/60 rounded w-16" />
        <div className="h-7 bg-muted rounded w-44" />
      </div>

      {/* 종목 카드 2개 */}
      <EntryCardSkeleton sets={3} />
      <EntryCardSkeleton sets={2} />

      {/* 종목 추가 폼 */}
      <div className="pt-2 border-t flex gap-2">
        <div className="flex-1 h-10 bg-muted/60 rounded-lg" />
        <div className="h-10 w-28 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
