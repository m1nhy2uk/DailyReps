import { signOut } from "@/lib/services/auth.service";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import NavLinks from "./_components/NavLinks";
import BottomNav from "./_components/BottomNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Toaster />
      <header className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <span className="font-bold">DailyReps</span>
          <div className="hidden sm:block">
            <NavLinks />
          </div>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground">
            로그아웃
          </Button>
        </form>
      </header>
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-6 pb-20 sm:pb-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
