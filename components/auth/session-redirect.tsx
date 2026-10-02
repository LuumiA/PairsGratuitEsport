"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Le lien de confirmation d'email de Supabase redirige vers le Site URL
 * (la racine) avec la session dans le fragment `#access_token=...` —
 * un fragment n'est jamais envoyé au serveur, donc rien côté Server
 * Component ne peut la lire. Instancier le client navigateur ici déclenche
 * sa détection automatique (`detectSessionInUrl`), qui consomme le
 * fragment et établit la session ; on redirige ensuite vers le dashboard.
 */
export function SessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!window.location.hash.includes("access_token")) return;

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  return null;
}
