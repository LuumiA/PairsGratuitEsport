"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { gameNameById } from "@/lib/data/games";
import type { BetHistoryItem } from "@/lib/data/bets";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "pending" | "won" | "lost";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "pending", label: "En attente" },
  { key: "won", label: "Gagnés" },
  { key: "lost", label: "Perdus" },
];

function outcomeBadge(bet: BetHistoryItem) {
  if (bet.outcome === "pending") {
    return <Badge variant="secondary">En attente</Badge>;
  }
  if (bet.outcome === "won") {
    return (
      <Badge className="border-neon-win/40 bg-neon-win/10 text-neon-win">+{bet.payout} pts</Badge>
    );
  }
  if (bet.outcome === "lost") {
    return (
      <Badge className="border-neon-loss/40 bg-neon-loss/10 text-neon-loss">-{bet.stake} pts</Badge>
    );
  }
  return <Badge variant="outline">Annulé</Badge>;
}

export function BetsHistoryList({ bets }: { bets: BetHistoryItem[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(
    () => ({
      all: bets.length,
      pending: bets.filter((b) => b.outcome === "pending").length,
      won: bets.filter((b) => b.outcome === "won").length,
      lost: bets.filter((b) => b.outcome === "lost").length,
    }),
    [bets]
  );

  const filtered = useMemo(
    () => (filter === "all" ? bets : bets.filter((b) => b.outcome === filter)),
    [bets, filter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "secondary" : "ghost"}
            className="h-7 rounded-full px-3 text-xs"
            onClick={() => setFilter(f.key)}
          >
            {f.label} ({counts[f.key]})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Aucun pari ici pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((bet) => (
            <Link key={bet.id} href={`/matches/${bet.match_id}`}>
              <Card className="border-white/10 transition-colors hover:border-neon-violet/40 hover:bg-surface-2">
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {gameNameById(bet.game_id)}
                      </Badge>
                      <p className="truncate text-sm font-medium">
                        {bet.chosen_team_name}{" "}
                        <span className="text-muted-foreground">vs {bet.opponent_team_name}</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {bet.stake} pts misés · cote {bet.odds}
                    </p>
                  </div>
                  <div className={cn("shrink-0")}>{outcomeBadge(bet)}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
