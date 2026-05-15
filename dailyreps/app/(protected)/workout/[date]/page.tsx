import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionWithEntries } from "@/lib/repositories/workout.repository";
import WorkoutEditor from "./_components/WorkoutEditor";

interface WorkoutDatePageProps {
  params: Promise<{ date: string }>;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
}

export default async function WorkoutDatePage({ params }: WorkoutDatePageProps) {
  const { date } = await params;

  if (!isValidDate(date)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: session } = await getSessionWithEntries(supabase, user.id, date);

  const entries = session?.entries ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/workout"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 목록으로
          </Link>
          <h1 className="text-xl font-bold mt-1">{formatDate(date)}</h1>
        </div>
      </div>

      <WorkoutEditor date={date} entries={entries} />
    </div>
  );
}
