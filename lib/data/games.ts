// Miroir de la seed `insert into games` (supabase/migrations/0001_init.sql).
// Données fixes, pas besoin d'une requête DB pour ça.
export const GAMES = [
  { id: 1, slug: "valorant", name: "Valorant" },
  { id: 2, slug: "csgo", name: "CS2" },
  { id: 3, slug: "lol", name: "League of Legends" },
] as const;

export function gameNameById(id: number): string {
  return GAMES.find((g) => g.id === id)?.name ?? "Esport";
}
