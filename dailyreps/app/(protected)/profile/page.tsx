import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/services/member.service";
import { getWorkoutStats } from "@/lib/repositories/workout.repository";
import { detectPrimaryCategory } from "@/lib/utils/exercise-category";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [profile, stats] = await Promise.all([
    getOrCreateProfile(),
    getWorkoutStats(supabase, user.id),
  ]);
  if (!profile) notFound();

  const total3 = (profile.bench_press_kg ?? 0) + (profile.squat_kg ?? 0) + (profile.deadlift_kg ?? 0);
  const has3 = profile.bench_press_kg || profile.squat_kg || profile.deadlift_kg;

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">프로필</h1>
        <Link
          href="/profile/edit"
          className="text-sm font-medium px-3 py-1.5 rounded-lg border hover:bg-accent transition-colors"
        >
          수정
        </Link>
      </div>

      {/* 사용자 정보 */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border bg-muted shrink-0 flex items-center justify-center">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt="프로필 이미지"
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-xl font-semibold text-muted-foreground">
              {profile.nickname.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="text-lg font-bold">{profile.nickname}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* 운동 통계 */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">운동 통계</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="총 운동 횟수" value={stats.totalSessions} unit="회" />
          <StatCard label="이번 달" value={stats.thisMonthSessions} unit="회" />
          <StatCard label="현재 연속" value={stats.currentStreak} unit="일" highlight={stats.currentStreak >= 3} />
          <StatCard label="총 세트 수" value={stats.totalSets} unit="세트" />
        </div>
      </div>

      {/* 3대 기록 */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">3대 기록</p>
        <div className="grid grid-cols-3 gap-3">
          <LiftCard label="벤치" value={profile.bench_press_kg} />
          <LiftCard label="스쿼트" value={profile.squat_kg} />
          <LiftCard label="데드" value={profile.deadlift_kg} />
        </div>
        {has3 && (
          <div className="border rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">합계</span>
            <span className="text-xl font-bold">{total3.toFixed(1)}<span className="text-sm font-normal text-muted-foreground ml-1">kg</span></span>
          </div>
        )}
        {!has3 && (
          <Link href="/profile/edit" className="text-xs text-muted-foreground hover:text-foreground transition-colors self-start">
            + 3대 기록 입력하기
          </Link>
        )}
      </div>

      {/* 많이 한 종목 */}
      {stats.topExercises.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">자주 한 종목</p>
          <div className="flex flex-col gap-2">
            {stats.topExercises.map(({ name, count }, i) => {
              const cat = detectPrimaryCategory(name);
              return (
                <div key={name} className="flex items-center gap-3 border rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-muted-foreground w-4">{i + 1}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${cat?.dotColor ?? "bg-muted-foreground"}`} />
                  <span className="flex-1 text-sm font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground">{count}회</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, highlight }: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className={`border rounded-xl px-4 py-3 flex flex-col gap-0.5 ${highlight ? "border-primary/40 bg-primary/5" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">
        {value}
        <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
      </p>
    </div>
  );
}

function LiftCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="border rounded-xl px-3 py-3 flex flex-col gap-1 items-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      {value ? (
        <p className="text-lg font-bold">{value}<span className="text-xs font-normal text-muted-foreground ml-0.5">kg</span></p>
      ) : (
        <p className="text-sm text-muted-foreground">-</p>
      )}
    </div>
  );
}
