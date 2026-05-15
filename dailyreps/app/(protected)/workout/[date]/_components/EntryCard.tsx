"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteEntry,
  addSet,
  updateEntryName,
} from "@/lib/services/workout.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SetRow from "./SetRow";
import type { WorkoutEntryWithSets } from "@/types/workout.types";

interface EntryCardProps {
  entry: WorkoutEntryWithSets;
  date: string;
}

export default function EntryCard({ entry, date }: EntryCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(entry.exercise_name);
  const [nameError, setNameError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleNameSave = () => {
    setIsEditingName(false);
    if (nameValue.trim() === entry.exercise_name) return;

    startTransition(async () => {
      const result = await updateEntryName(entry.id, nameValue, date);
      if (result.error) {
        setNameError(result.error);
        setNameValue(entry.exercise_name);
      } else {
        setNameError(undefined);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEntry(entry.id, date);
      if (result.error) toast.error(result.error);
    });
  };

  const handleAddSet = () => {
    const last = entry.sets.at(-1);
    const nextSetNumber = (last?.set_number ?? 0) + 1;
    const defaultWeight = last?.weight_kg ?? 0;
    const defaultReps = last?.reps ?? 10;

    startTransition(async () => {
      const result = await addSet(
        entry.id,
        nextSetNumber,
        defaultWeight,
        defaultReps,
        date
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("세트가 추가됐습니다");
      }
    });
  };

  return (
    <div
      className={`border rounded-xl p-4 flex flex-col gap-3 bg-card ${isPending ? "opacity-60" : ""}`}
    >
      {/* 종목 헤더 */}
      <div className="flex items-center justify-between gap-2">
        {isEditingName ? (
          <Input
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSave();
              if (e.key === "Escape") {
                setNameValue(entry.exercise_name);
                setIsEditingName(false);
              }
            }}
            maxLength={50}
            className="flex-1 text-base font-semibold h-auto py-0 border-0 border-b-2 border-primary rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="flex-1 text-left text-base font-semibold hover:text-muted-foreground transition-colors"
            title="클릭하여 이름 수정"
          >
            {entry.exercise_name}
          </button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`${entry.exercise_name} 종목 삭제`}
          className="text-muted-foreground hover:text-destructive shrink-0"
        >
          ×
        </Button>
      </div>

      {nameError && <p className="text-xs text-destructive">{nameError}</p>}

      {/* 세트 테이블 */}
      {entry.sets.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground border-b">
              <th className="text-left pb-1 font-normal pl-1">세트</th>
              <th className="text-left pb-1 font-normal">무게</th>
              <th className="text-left pb-1 font-normal">횟수</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {entry.sets.map((set) => (
              <SetRow key={`${set.id}-${set.weight_kg}-${set.reps}`} set={set} date={date} />
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-muted-foreground">세트를 추가해보세요</p>
      )}

      {/* 세트 추가 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddSet}
        disabled={isPending}
        className="w-full border-dashed"
      >
        {isPending ? "추가 중…" : "+ 세트 추가"}
      </Button>
    </div>
  );
}
