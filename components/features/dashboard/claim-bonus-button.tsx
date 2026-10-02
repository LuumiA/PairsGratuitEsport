"use client";

import { useState, useTransition } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { claimLoginBonus } from "@/lib/actions/points";

export function ClaimBonusButton() {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        onClick={() =>
          startTransition(async () => {
            const result = await claimLoginBonus();
            if (result && "error" in result) setFeedback(result.error);
            else if (result) setFeedback("+50 points crédités !");
          })
        }
        disabled={pending}
        className="glow-primary gap-2"
      >
        <Gift className="size-4" />
        {pending ? "..." : "Réclamer le bonus du jour"}
      </Button>
      {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}
    </div>
  );
}
