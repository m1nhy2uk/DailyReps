import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/services/member.service";
import ProfileForm from "../_components/ProfileForm";
import DeleteAccountSection from "../_components/DeleteAccountSection";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const profile = await getOrCreateProfile();
  if (!profile) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 프로필
        </Link>
        <h1 className="text-2xl font-bold">프로필 수정</h1>
      </div>

      <ProfileForm profile={profile} />
      <DeleteAccountSection />
    </div>
  );
}
