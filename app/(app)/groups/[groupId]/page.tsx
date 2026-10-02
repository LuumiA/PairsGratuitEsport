import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { getGroupDetail } from "@/lib/data/groups";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CopyInviteButton } from "@/components/features/groups/copy-invite-button";

const RANK_STYLES: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-300",
  3: "text-amber-600",
};

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const detail = await getGroupDetail(groupId);
  if (!detail) notFound();

  const { group, leaderboard } = detail;

  const fmt = (d: string | null) =>
    d
      ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
          new Date(d)
        )
      : "—";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-sm text-muted-foreground">
            Tournoi du {fmt(group.tournament_start)} au {fmt(group.tournament_end)}
          </p>
        </div>
        <CopyInviteButton inviteCode={group.invite_code} />
      </div>

      <Card className="border-white/10">
        <CardContent className="space-y-1 p-0">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <Trophy className="size-4 text-neon-violet" />
            <h2 className="text-sm font-semibold text-muted-foreground">
              Classement du mini-tournoi
            </h2>
          </div>
          {leaderboard.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Aucun membre pour le moment.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {leaderboard.map((row, i) => (
                <div key={row.user_id} className="flex items-center gap-4 px-4 py-3">
                  <span className={`w-6 text-center font-bold ${RANK_STYLES[i + 1] ?? "text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <Avatar className="size-9">
                    <AvatarImage src={row.avatar_url ?? undefined} alt={row.username} />
                    <AvatarFallback>{row.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium">{row.username}</span>
                  <Badge
                    className={
                      row.points_delta >= 0
                        ? "border-neon-win/40 bg-neon-win/10 text-neon-win"
                        : "border-neon-loss/40 bg-neon-loss/10 text-neon-loss"
                    }
                  >
                    {row.points_delta >= 0 ? "+" : ""}
                    {row.points_delta}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
