import Link from "next/link";
import type { SessionSummary } from "@/lib/repositories/workout.repository";

interface SessionCardProps {
  session: SessionSummary;
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = DAY_LABELS[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${dow})`;
}

function formatExercises(names: string[]): string {
  if (names.length === 0) return "운동 없음";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} 외 ${names.length - 3}개`;
}

function formatStats(totalEntries: number, totalSets: number): string {
  if (totalEntries === 0) return "";
  const parts: string[] = [];
  if (totalEntries > 0) parts.push(`${totalEntries}종목`);
  if (totalSets > 0) parts.push(`${totalSets}세트`);
  return parts.join(" · ");
}

export default function SessionCard({ session }: SessionCardProps) {
  const stats = formatStats(session.total_entries, session.total_sets);

  return (
    <Link
      href={`/workout/${session.session_date}`}
      className="flex items-center justify-between border rounded-xl px-4 py-3 hover:bg-accent/50 transition-colors group"
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold">
          {formatDate(session.session_date)}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {formatExercises(session.exercise_names)}
        </span>
        {stats && (
          <span className="text-xs text-muted-foreground/70 mt-0.5">{stats}</span>
        )}
      </div>
      <span className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors text-lg shrink-0 ml-3">
        →
      </span>
    </Link>
  );
}
