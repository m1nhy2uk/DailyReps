export interface Profile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  bench_press_kg: number | null;
  squat_kg: number | null;
  deadlift_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  nickname?: string;
  avatar_url?: string | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  nickname: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
