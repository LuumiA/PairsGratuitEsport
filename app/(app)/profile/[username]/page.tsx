import { notFound } from "next/navigation";
import { Trophy, Percent, Coins, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url, created_at")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: stats } = await supabase
    .from("leaderboard")
    .select("*")
    .eq("user_id", profile.id)
    .single();

  const statCards = [
    { icon: Coins, label: "Points", value: stats?.points_balance ?? 0 },
    { icon: Swords, label: "Paris joués", value: stats?.bets_settled ?? 0 },
    { icon: Percent, label: "Taux de victoire", value: `${stats?.win_rate_pct ?? 0}%` },
    { icon: Trophy, label: "Points gagnés", value: stats?.total_points_won ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username} />
          <AvatarFallback className="text-lg">
            {profile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="border-white/10">
            <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
              <Icon className="size-5 text-neon-violet" />
              <span className="text-lg font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
