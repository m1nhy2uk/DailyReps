import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/services/member.service";
import { getTotalSessionCount } from "@/lib/repositories/workout.repository";
import ProfileForm from "./_components/ProfileForm";
import DeleteAccountSection from "./_components/DeleteAccountSection";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const [profile, totalSessions] = await Promise.all([
    getOrCreateProfile(),
    getTotalSessionCount(supabase, user.id),
  ]);

  if (!profile) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">프로필</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
      </div>

      {/* 운동 통계 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded-xl px-4 py-3 flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">총 운동 횟수</p>
          <p className="text-2xl font-bold">{totalSessions}<span className="text-sm font-normal text-muted-foreground ml-1">회</span></p>
        </div>
        <div className="border rounded-xl px-4 py-3 flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">3대 합계</p>
          {profile.bench_press_kg || profile.squat_kg || profile.deadlift_kg ? (
            <p className="text-2xl font-bold">
              {((profile.bench_press_kg ?? 0) + (profile.squat_kg ?? 0) + (profile.deadlift_kg ?? 0)).toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">미입력</p>
          )}
        </div>
      </div>

      <ProfileForm profile={profile} />
      <DeleteAccountSection />
    </div>
  );
}
