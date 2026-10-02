import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata = { title: "Classement" };

const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-300",
  3: "text-amber-600",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("leaderboard")
    .select("*")
    .order("points_balance", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="size-6 text-neon-violet" />
        <h1 className="text-2xl font-bold">Classement du serveur</h1>
      </div>

      <Card className="border-white/10">
        <CardContent className="divide-y divide-white/10 p-0">
          {rows?.map((row, i) => (
            <Link
              key={row.user_id}
              href={`/profile/${row.username}`}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2"
            >
              <span className={cn("w-6 text-center font-bold", RANK_STYLES[i + 1] ?? "text-muted-foreground")}>
                {i + 1}
              </span>
              <Avatar className="size-9">
                <AvatarImage src={row.avatar_url ?? undefined} alt={row.username} />
                <AvatarFallback>{row.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{row.username}</p>
                <p className="text-xs text-muted-foreground">
                  {row.bets_settled} paris · {row.win_rate_pct}% de victoires
                </p>
              </div>
              <span className="font-semibold text-neon-violet">
                {row.points_balance.toLocaleString("fr-FR")}
              </span>
            </Link>
          ))}
          {!rows?.length && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Personne n&apos;a encore rejoint le classement.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
