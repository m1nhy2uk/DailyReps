import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/services/member.service";
import ProfileForm from "./_components/ProfileForm";
import DeleteAccountSection from "./_components/DeleteAccountSection";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const profile = await getOrCreateProfile();
  if (!profile) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">프로필</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
      </div>
      <ProfileForm profile={profile} />
      <DeleteAccountSection />
    </div>
  );
}
