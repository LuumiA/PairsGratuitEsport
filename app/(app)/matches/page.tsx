import { Swords } from "lucide-react";
import { getUpcomingAndLiveMatches } from "@/lib/data/matches";
import { GAMES } from "@/lib/data/games";
import { MatchCard } from "@/components/features/matches/match-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = { title: "Matchs" };
export const revalidate = 60;

export default async function MatchesPage() {
  const matches = await getUpcomingAndLiveMatches();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Swords className="size-6 text-neon-violet" />
        <h1 className="text-2xl font-bold">Matchs à venir</h1>
      </div>

      <Tabs defaultValue={String(GAMES[0].id)}>
        <TabsList>
          {GAMES.map((g) => (
            <TabsTrigger key={g.id} value={String(g.id)}>
              {g.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {GAMES.map((g) => {
          const gameMatches = matches.filter((m) => m.game_id === g.id);
          return (
            <TabsContent key={g.id} value={String(g.id)} className="mt-4">
              {gameMatches.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Aucun match {g.name} à venir pour le moment.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gameMatches.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
