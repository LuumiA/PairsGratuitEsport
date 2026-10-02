"use client";

import { useTransition } from "react";
import { Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { claimLoginBonus } from "@/lib/actions/points";

export function ClaimBonusButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          const result = await claimLoginBonus();
          if (result && "error" in result) toast.error(result.error);
          else if (result) toast.success("+50 points crédités !");
        })
      }
      disabled={pending}
      className="glow-primary gap-2"
    >
      <Gift className="size-4" />
      {pending ? "..." : "Réclamer le bonus du jour"}
    </Button>
  );
}
