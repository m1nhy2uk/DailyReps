import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getSessionCategoriesByMonth,
  getRecentSessionsWithEntries,
} from "@/lib/repositories/workout.repository";
import WorkoutCalendar from "./_components/WorkoutCalendar";
import RecentWorkouts from "./_components/RecentWorkouts";

interface DashboardPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

function getTodayKST() {
  // UTC+9 기준 오늘 날짜
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  return {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
    dateStr: now.toISOString().split("T")[0],
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const today = getTodayKST();

  const year = parseInt(params.year ?? String(today.year), 10);
  const month = parseInt(params.month ?? String(today.month), 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // 달력 + 최근 기록 병렬 fetch
  const [categoriesResult, recentResult] = await Promise.all([
    getSessionCategoriesByMonth(supabase, user.id, year, month),
    getRecentSessionsWithEntries(supabase, user.id, 5),
  ]);

  const sessions = categoriesResult.data ?? [];
  const recentSessions = recentResult.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* 오늘 운동 빠른 접근 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {today.year}년 {today.month}월 {today.day}일
          </p>
        </div>
        <Link
          href={`/workout/${today.dateStr}`}
          className="bg-foreground text-background text-sm font-medium rounded-xl px-4 py-2 hover:bg-foreground/90 transition-colors whitespace-nowrap"
        >
          오늘 운동 →
        </Link>
      </div>

      {/* 달력 */}
      <section>
        <WorkoutCalendar
          year={year}
          month={month}
          sessions={sessions}
          today={today}
        />
      </section>

      {/* 최근 운동 기록 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">최근 운동 기록</h2>
        <RecentWorkouts sessions={recentSessions} />
      </section>
    </div>
  );
}
