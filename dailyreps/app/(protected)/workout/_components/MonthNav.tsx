import Link from "next/link";

interface MonthNavProps {
  year: number;
  month: number;
}

const MONTH_NAMES = [
  "1월","2월","3월","4월","5월","6월",
  "7월","8월","9월","10월","11월","12월",
] as const;

function prev(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

function next(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

export default function MonthNav({ year, month }: MonthNavProps) {
  const p = prev(year, month);
  const n = next(year, month);

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`/workout?year=${p.year}&month=${p.month}`}
        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="이전 달"
      >
        ‹
      </Link>
      <span className="font-semibold text-base">
        {year}년 {MONTH_NAMES[month - 1]}
      </span>
      <Link
        href={`/workout?year=${n.year}&month=${n.month}`}
        className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="다음 달"
      >
        ›
      </Link>
    </div>
  );
}
