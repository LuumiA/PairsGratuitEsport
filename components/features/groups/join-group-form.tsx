"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { joinGroup, type GroupFormState } from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function JoinGroupForm({ defaultCode }: { defaultCode?: string }) {
  const [state, formAction, pending] = useActionState<GroupFormState, FormData>(joinGroup, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="invite_code">Code d&apos;invitation</Label>
          <Input id="invite_code" name="invite_code" required defaultValue={defaultCode} placeholder="Ab3xY9==" />
        </div>
        <Button type="submit" disabled={pending} variant="outline">
          {pending ? "..." : "Rejoindre"}
        </Button>
      </div>
    </form>
  );
}
