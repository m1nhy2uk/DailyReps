export interface WorkoutSession {
  id: string;
  user_id: string;
  session_date: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkoutEntry {
  id: string;
  session_id: string;
  user_id: string;
  exercise_name: string;
  order_index: number;
  sets?: WorkoutSet[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  id: string;
  entry_id: string;
  user_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionInput {
  session_date: string;
  memo?: string;
}

export interface CreateEntryInput {
  session_id: string;
  exercise_name: string;
  order_index?: number;
}

export interface CreateSetInput {
  entry_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface UpdateSetInput {
  weight_kg?: number;
  reps?: number;
}

// UI 레이어에서 사용하는 조합 타입
export type WorkoutSetView = Pick<
  WorkoutSet,
  "id" | "entry_id" | "set_number" | "weight_kg" | "reps"
>;

export type WorkoutEntryWithSets = Omit<WorkoutEntry, "sets"> & {
  sets: WorkoutSetView[];
};

export type WorkoutSessionWithEntries = WorkoutSession & {
  entries: WorkoutEntryWithSets[];
};
