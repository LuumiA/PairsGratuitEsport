"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyInviteButton({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/groups?code=${encodeURIComponent(inviteCode)}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} className="gap-1.5">
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copié !" : "Copier le lien d'invitation"}
    </Button>
  );
}
