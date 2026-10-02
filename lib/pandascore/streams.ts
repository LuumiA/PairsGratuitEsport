export interface MatchStream {
  language: string;
  official: boolean;
  main: boolean;
  url: string;
  platform: "twitch" | "youtube" | "other";
}

interface RawStreamEntry {
  language?: string;
  official?: boolean;
  main?: boolean;
  raw_url?: string | null;
}

function detectPlatform(url: string): MatchStream["platform"] {
  if (url.includes("twitch.tv")) return "twitch";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  return "other";
}

/** Extrait les liens de stream (Twitch/YouTube/...) du payload brut PandaScore
 * stocké dans matches.raw, triés avec le flux principal/officiel en premier. */
export function extractStreams(raw: Record<string, unknown> | null): MatchStream[] {
  const list = raw?.streams_list;
  if (!Array.isArray(list)) return [];

  return (list as RawStreamEntry[])
    .filter((s): s is RawStreamEntry & { raw_url: string } => typeof s.raw_url === "string" && s.raw_url.length > 0)
    .map((s) => ({
      language: s.language ?? "?",
      official: !!s.official,
      main: !!s.main,
      url: s.raw_url,
      platform: detectPlatform(s.raw_url),
    }))
    .sort((a, b) => Number(b.main) - Number(a.main) || Number(b.official) - Number(a.official));
}
