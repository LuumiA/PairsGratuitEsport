// Miroir TypeScript de la formule Elo utilisée dans settle_match() (SQL) —
// ici pour calculer les cotes AVANT le match, pendant la synchro PandaScore.
// Garder les deux formules identiques si l'une évolue.

const OVERROUND = 0.06;
const MIN_ODDS = 1.05;

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeOdds(
  ratingA: number,
  ratingB: number
): { oddsA: number; oddsB: number } {
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = 1 - expectedA;

  const impliedA = expectedA * (1 + OVERROUND);
  const impliedB = expectedB * (1 + OVERROUND);

  return {
    oddsA: Math.max(MIN_ODDS, round2(1 / impliedA)),
    oddsB: Math.max(MIN_ODDS, round2(1 / impliedB)),
  };
}
