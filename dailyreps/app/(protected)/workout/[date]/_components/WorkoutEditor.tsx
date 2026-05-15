"use client";

import AddEntryForm from "./AddEntryForm";
import EntryCard from "./EntryCard";
import type { WorkoutEntryWithSets } from "@/types/workout.types";
import { detectPrimaryCategory, type ExerciseCategory } from "@/lib/utils/exercise-category";

interface WorkoutEditorProps {
  date: string;
  entries: WorkoutEntryWithSets[];
}

interface CategoryGroup {
  category: ExerciseCategory | null;
  entries: WorkoutEntryWithSets[];
}

function groupByCategory(entries: WorkoutEntryWithSets[]): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>();

  for (const entry of entries) {
    const cat = detectPrimaryCategory(entry.exercise_name);
    const key = cat?.id ?? "기타";
    if (!map.has(key)) {
      map.set(key, { category: cat, entries: [] });
    }
    map.get(key)!.entries.push(entry);
  }

  return Array.from(map.values());
}

export default function WorkoutEditor({ date, entries }: WorkoutEditorProps) {
  const groups = groupByCategory(entries);

  return (
    <div className="flex flex-col gap-6">
      {entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🏋️</p>
          <p className="text-sm">아래에서 종목을 추가해 운동을 기록해보세요</p>
        </div>
      ) : (
        groups.map(({ category, entries: groupEntries }) => (
          <div key={category?.id ?? "기타"} className="flex flex-col gap-3">
            {/* 카테고리 헤더 */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${category?.dotColor ?? "bg-muted-foreground"}`}
              />
              <span className="text-sm font-semibold text-muted-foreground">
                {category?.label ?? "기타"}
              </span>
              <span className="flex-1 h-px bg-border" />
            </div>

            {/* 해당 카테고리 종목 카드들 */}
            {groupEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} date={date} />
            ))}
          </div>
        ))
      )}

      <div className="border-t pt-4">
        <AddEntryForm date={date} />
      </div>
    </div>
  );
}
