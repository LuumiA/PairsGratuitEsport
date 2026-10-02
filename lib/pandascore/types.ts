export interface PandaScoreOpponent {
  id: number;
  name: string;
  acronym: string | null;
  image_url: string | null;
}

export interface PandaScoreOpponentWrapper {
  type: string;
  opponent: PandaScoreOpponent | null;
}

export type PandaScoreStatus = "not_started" | "running" | "finished" | "canceled" | string;

export interface PandaScoreMatch {
  id: number;
  status: PandaScoreStatus;
  scheduled_at: string | null;
  begin_at: string | null;
  winner_id: number | null;
  modified_at: string;
  videogame: { id: number; name: string; slug: string };
  opponents: PandaScoreOpponentWrapper[];
}
