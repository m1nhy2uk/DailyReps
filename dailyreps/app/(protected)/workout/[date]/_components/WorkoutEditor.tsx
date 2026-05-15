"use client";

import AddEntryForm from "./AddEntryForm";
import EntryCard from "./EntryCard";
import type { WorkoutEntryWithSets } from "@/types/workout.types";

interface WorkoutEditorProps {
  date: string;
  entries: WorkoutEntryWithSets[];
}

export default function WorkoutEditor({ date, entries }: WorkoutEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      {entries.length > 0 ? (
        entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} date={date} />
        ))
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🏋️</p>
          <p className="text-sm">아래에서 종목을 추가해 운동을 기록해보세요</p>
        </div>
      )}

      <div className="pt-2 border-t">
        <AddEntryForm date={date} />
      </div>
    </div>
  );
}
