import Link from "next/link";
import type { SessionWithExercises } from "@/lib/repositories/workout.repository";
import { detectCategories, ALL_CATEGORIES } from "@/lib/utils/exercise-category";
import { Progress } from "@/components/ui/progress";

interface WorkoutCalendarProps {
  year: number;
  month: number;
  sessions: SessionWithExercises[];
  today: { year: number; month: number; day: number };
}

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
] as const;

function getPrevMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

function getNextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function WorkoutCalendar({
  year,
  month,
  sessions,
  today,
}: WorkoutCalendarProps) {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const prev = getPrevMonth(year, month);
  const next = getNextMonth(year, month);

  const dayCategoriesMap = new Map(
    sessions.map((s) => {
      const day = parseInt(s.date.split("-")[2], 10);
      return [day, detectCategories(s.exerciseNames)];
    })
  );
  const workedOutDays = new Set(dayCategoriesMap.keys());

  const isCurrentMonth = year === today.year && month === today.month;
  const workedDays = workedOutDays.size;
  const percent = daysInMonth > 0 ? Math.round((workedDays / daysInMonth) * 100) : 0;

  const usedCategoryIds = new Set(
    [...dayCategoriesMap.values()].flatMap((cats) => cats.map((c) => c.id))
  );
  const legendCategories = ALL_CATEGORIES.filter((c) => usedCategoryIds.has(c.id));

  type Cell = { type: "current"; day: number } | { type: "adjacent" };
  const cells: Cell[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) cells.push({ type: "adjacent" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ type: "current", day: d });

  const remainder = cells.length % 7;
  if (remainder > 0) {
    for (let i = 0; i < 7 - remainder; i++) cells.push({ type: "adjacent" });
  }

  const isToday = (day: number) =>
    today.year === year && today.month === month && today.day === day;

  return (
    <div className="flex flex-col gap-3">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard?year=${prev.year}&month=${prev.month}`}
          className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="이전 달"
        >
          ‹
        </Link>
        <span className="font-semibold text-base">
          {year}년 {MONTH_NAMES[month - 1]}
        </span>
        <Link
          href={`/dashboard?year=${next.year}&month=${next.month}`}
          className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="다음 달"
        >
          ›
        </Link>
      </div>

      {/* 진행률 바 */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{isCurrentMonth ? "이번 달 운동" : `${month}월 운동`}</span>
          <span className="font-medium text-foreground">
            {workedDays} / {daysInMonth}일 ({percent}%)
          </span>
        </div>
        <Progress value={percent} className="h-1.5" />
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground font-medium pb-1 border-b">
        {WEEK_LABELS.map((label, i) => (
          <span
            key={label}
            className={i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : ""}
          >
            {label}
          </span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell, idx) => {
          if (cell.type === "adjacent") {
            return <div key={`adj-${idx}`} className="h-10" />;
          }

          const { day } = cell;
          const todayCell = isToday(day);
          const categories = dayCategoriesMap.get(day) ?? [];
          const hasWorkout = workedOutDays.has(day);
          const dateStr = toDateStr(year, month, day);
          const colPos = idx % 7;

          return (
            <Link
              key={dateStr}
              href={`/workout/${dateStr}`}
              className={`
                flex flex-col items-center justify-center h-10 rounded-lg text-sm transition-colors
                hover:bg-accent
                ${todayCell ? "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" : ""}
                ${colPos === 0 && !todayCell ? "text-red-500" : ""}
                ${colPos === 6 && !todayCell ? "text-blue-500" : ""}
              `}
            >
              <span>{day}</span>

              {categories.length > 0 ? (
                <div className="flex gap-0.5 mt-0.5">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      title={cat.label}
                      className={`w-2 h-2 rounded-full ring-1 ring-background ${cat.dotColor}`}
                    />
                  ))}
                </div>
              ) : hasWorkout ? (
                <span
                  className={`w-2 h-2 rounded-full mt-0.5 ring-1 ring-background ${todayCell ? "bg-primary-foreground" : "bg-muted-foreground"}`}
                />
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* 카테고리 범례 */}
      {legendCategories.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {legendCategories.map((cat) => (
            <span key={cat.id} className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.dotColor}`} />
              {cat.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
