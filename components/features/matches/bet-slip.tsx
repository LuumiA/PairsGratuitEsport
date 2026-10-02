"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface TeamOption {
  id: number;
  name: string;
  odds: number;
}

export function BetSlip({
  matchId,
  teamA,
  teamB,
  pointsBalance,
}: {
  matchId: number;
  teamA: TeamOption;
  teamB: TeamOption;
  pointsBalance: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<TeamOption | null>(null);
  const [stake, setStake] = useState(Math.min(50, pointsBalance));
  const [pending, startTransition] = useTransition();

  const potentialPayout = selected ? Math.round(stake * selected.odds) : null;

  function submit() {
    if (!selected) {
      toast.error("Choisis une équipe.");
      return;
    }
    if (stake <= 0 || stake > pointsBalance) {
      toast.error("Mise invalide.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc("place_bet", {
        p_match_id: matchId,
        p_team_id: selected.id,
        p_stake: stake,
        p_idempotency_key: crypto.randomUUID(),
      });

      if (rpcError) {
        toast.error(rpcError.message);
        return;
      }

      toast.success(`Pari placé sur ${selected.name} : ${stake} points misés.`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-surface-1 p-4">
      <div className="grid grid-cols-2 gap-3">
        {[teamA, teamB].map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => setSelected(team)}
            className={cn(
              "rounded-lg border px-3 py-3 text-left transition-colors",
              selected?.id === team.id
                ? "border-neon-violet bg-neon-violet/10"
                : "border-white/10 bg-surface-2 hover:border-white/20"
            )}
          >
            <p className="text-sm font-medium">{team.name}</p>
            <p className="text-lg font-bold text-neon-cyan">{team.odds.toFixed(2)}</p>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="stake">Mise (points)</Label>
        <div className="flex gap-2">
          <Input
            id="stake"
            type="number"
            min={1}
            max={pointsBalance}
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
          />
          <Button type="button" variant="outline" onClick={() => setStake(pointsBalance)}>
            Max
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Solde disponible : {pointsBalance.toLocaleString("fr-FR")}</p>
      </div>

      {selected && (
        <p className="text-sm text-muted-foreground">
          Gain potentiel : <span className="font-semibold text-neon-win">{potentialPayout}</span> points
        </p>
      )}

      <Button onClick={submit} disabled={pending || !selected} className="w-full glow-primary">
        {pending ? "Envoi..." : "Placer le pari"}
      </Button>
    </div>
  );
}
