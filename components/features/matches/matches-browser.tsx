"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchCard } from "@/components/features/matches/match-card";
import type { MatchListItem } from "@/lib/data/matches";
import { tierLabel } from "@/lib/pandascore/mappers";

const TIER_ORDER = ["s", "a", "b", "c", "d"];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function MatchesBrowser({
  matches,
  games,
}: {
  matches: MatchListItem[];
  games: readonly { id: number; slug: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [gameId, setGameId] = useState(String(games[0].id));
  const [tier, setTier] = useState<string>("all");
  const [league, setLeague] = useState<string>("all");

  const activeGame = games.find((g) => String(g.id) === gameId) ?? games[0];

  const byGame = useMemo(
    () => matches.filter((m) => String(m.game_id) === gameId),
    [matches, gameId]
  );

  const tiersAvailable = useMemo(() => {
    const present = new Set(byGame.map((m) => m.tier).filter((t): t is string => !!t));
    return TIER_ORDER.filter((t) => present.has(t));
  }, [byGame]);

  const leaguesAvailable = useMemo(() => {
    const pool = tier === "all" ? byGame : byGame.filter((m) => m.tier === tier);
    const names = new Set(pool.map((m) => m.league_name).filter((l): l is string => !!l));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "fr"));
  }, [byGame, tier]);

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return byGame.filter((m) => {
      if (tier !== "all" && m.tier !== tier) return false;
      if (league !== "all" && m.league_name !== league) return false;
      if (q) {
        const haystack = normalize(`${m.team_a.name} ${m.team_b.name}`);
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [byGame, tier, league, search]);

  function handleGameChange(value: string) {
    setGameId(value);
    setTier("all");
    setLeague("all");
  }

  function handleTierChange(value: string) {
    setTier(value);
    setLeague("all");
  }

  const hasActiveFilters = search.length > 0 || tier !== "all" || league !== "all";

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une équipe..."
          className="h-10 pl-9"
        />
      </div>

      <Tabs value={gameId} onValueChange={(v) => handleGameChange(String(v))}>
        <TabsList>
          {games.map((g) => (
            <TabsTrigger key={g.id} value={String(g.id)}>
              {g.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tiersAvailable.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={tier === "all" ? "secondary" : "ghost"}
            className="h-7 rounded-full px-3 text-xs"
            onClick={() => handleTierChange("all")}
          >
            Tous niveaux
          </Button>
          {tiersAvailable.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tier === t ? "secondary" : "ghost"}
              className="h-7 rounded-full px-3 text-xs"
              onClick={() => handleTierChange(t)}
            >
              {tierLabel(t)}
            </Button>
          ))}
        </div>
      )}

      {leaguesAvailable.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="h-8 rounded-lg border border-input bg-surface-1 px-2 text-xs text-foreground outline-none focus-visible:border-ring"
          >
            <option value="all">Tous les tournois</option>
            {leaguesAvailable.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
              onClick={() => {
                setSearch("");
                setTier("all");
                setLeague("all");
              }}
            >
              <X className="size-3" /> Réinitialiser
            </Button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {byGame.length === 0
            ? `Aucun match ${activeGame.name} à venir pour le moment.`
            : `Aucun match ${activeGame.name} ne correspond à ta recherche.`}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
