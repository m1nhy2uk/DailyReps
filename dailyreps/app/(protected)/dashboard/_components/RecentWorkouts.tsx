import Link from "next/link";
import type { RecentSession } from "@/lib/repositories/workout.repository";

interface RecentWorkoutsProps {
  sessions: RecentSession[];
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatSessionDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const dow = DAY_LABELS[new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${dow})`;
}

function formatExerciseNames(names: string[]): string {
  if (names.length === 0) return "기록 없음";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} 외 ${names.length - 3}개`;
}

export default function RecentWorkouts({ sessions }: RecentWorkoutsProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        아직 운동 기록이 없습니다
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sessions.map((s) => (
        <li key={s.id}>
          <Link
            href={`/workout/${s.session_date}`}
            className="flex flex-col gap-0.5 border rounded-xl px-4 py-3 hover:bg-accent/50 transition-colors"
          >
            <span className="text-sm font-medium">
              {formatSessionDate(s.session_date)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatExerciseNames(s.exercise_names)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
