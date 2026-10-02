import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GroupSummary } from "@/lib/data/groups";

function tournamentPhase(group: GroupSummary): { label: string; className: string } {
  const now = Date.now();
  const start = group.tournament_start ? new Date(group.tournament_start).getTime() : null;
  const end = group.tournament_end ? new Date(group.tournament_end).getTime() : null;

  if (start && now < start) return { label: "À venir", className: "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan" };
  if (end && now > end) return { label: "Terminé", className: "border-white/20 bg-white/5 text-muted-foreground" };
  return { label: "En cours", className: "border-neon-win/40 bg-neon-win/10 text-neon-win" };
}

export function GroupCard({ group }: { group: GroupSummary }) {
  const phase = tournamentPhase(group);
  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="h-full border-white/10 transition-colors hover:border-neon-violet/40 hover:bg-surface-2">
        <CardContent className="space-y-2 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{group.name}</h3>
            <Badge className={phase.className}>{phase.label}</Badge>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-3.5" /> {group.member_count} membre{group.member_count > 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
