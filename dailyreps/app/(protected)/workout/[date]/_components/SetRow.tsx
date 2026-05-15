"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateSet, deleteSet } from "@/lib/services/workout.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { WorkoutSetView } from "@/types/workout.types";

interface SetRowProps {
  set: WorkoutSetView;
  date: string;
}

export default function SetRow({ set, date }: SetRowProps) {
  const [weight, setWeight] = useState(String(set.weight_kg));
  const [reps, setReps] = useState(String(set.reps));
  const [isPending, startTransition] = useTransition();

  const handleBlur = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (isNaN(w) || isNaN(r)) return;
    if (w === set.weight_kg && r === set.reps) return;

    startTransition(async () => {
      const result = await updateSet(set.id, w, r, date);
      if (result.error) toast.error(result.error);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSet(set.id, date);
      if (result.error) toast.error(result.error);
    });
  };

  return (
    <tr className={`border-b last:border-0 ${isPending ? "opacity-50" : ""}`}>
      <td className="py-2 pl-1 pr-3 text-sm text-muted-foreground w-12">
        {set.set_number}세트
      </td>
      <td className="py-2 pr-2">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={weight}
            min={0}
            max={999.9}
            step={0.5}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={handleBlur}
            disabled={isPending}
            className="w-14 sm:w-20 text-right h-8"
          />
          <span className="text-xs text-muted-foreground">kg</span>
        </div>
      </td>
      <td className="py-2 pr-2">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={reps}
            min={1}
            max={999}
            step={1}
            onChange={(e) => setReps(e.target.value)}
            onBlur={handleBlur}
            disabled={isPending}
            className="w-12 sm:w-16 text-right h-8"
          />
          <span className="text-xs text-muted-foreground">회</span>
        </div>
      </td>
      <td className="py-2 pr-1 text-right">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          disabled={isPending}
          aria-label={`${set.set_number}세트 삭제`}
          className="text-muted-foreground hover:text-destructive"
        >
          ×
        </Button>
      </td>
    </tr>
  );
}
