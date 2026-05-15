import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionsWithSummaryByMonth } from "@/lib/repositories/workout.repository";
import MonthNav from "./_components/MonthNav";
import SessionCard from "./_components/SessionCard";

interface WorkoutListPageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

function getTodayKST() {
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  return {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    dateStr: now.toISOString().split("T")[0],
  };
}

export default async function WorkoutListPage({ searchParams }: WorkoutListPageProps) {
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

  const { data: sessions } = await getSessionsWithSummaryByMonth(
    supabase,
    user.id,
    year,
    month
  );

  const list = sessions ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">운동 기록</h1>
        <Link
          href={`/workout/${today.dateStr}`}
          className="bg-foreground text-background text-sm font-medium rounded-xl px-4 py-2 hover:bg-foreground/90 transition-colors whitespace-nowrap"
        >
          오늘 운동 →
        </Link>
      </div>

      {/* 월 필터 */}
      <MonthNav year={year} month={month} />

      {/* 세션 목록 */}
      {list.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {list.map((session) => (
            <li key={session.id}>
              <SessionCard session={session} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">이 달의 운동 기록이 없습니다</p>
          <Link
            href={`/workout/${today.dateStr}`}
            className="inline-block mt-4 text-sm text-foreground underline underline-offset-2"
          >
            오늘 운동 시작하기
          </Link>
        </div>
      )}
    </div>
  );
}
