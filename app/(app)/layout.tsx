import { requireProfile } from "@/lib/data/profile";
import { AppNav } from "@/components/nav/app-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav
        profile={{
          username: profile.username,
          avatar_url: profile.avatar_url,
          points_balance: profile.points_balance,
          is_admin: profile.is_admin,
        }}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-20 md:pb-8">{children}</main>
    </div>
  );
}
