"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 2 * 1024 * 1024;

export function AvatarUploader({
  userId,
  username,
  avatarUrl,
}: {
  userId: string;
  username: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File) {
    if (file.size > MAX_SIZE) {
      setError("Image trop lourde (2 Mo max).");
      return;
    }
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", userId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setPreview(data.publicUrl);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-20">
        <AvatarImage src={preview ?? undefined} alt={username} />
        <AvatarFallback className="text-lg">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="size-4" />
          {pending ? "Envoi..." : "Changer la photo"}
        </Button>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
