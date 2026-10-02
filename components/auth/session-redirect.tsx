"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Le lien de confirmation d'email de Supabase redirige vers le Site URL
 * avec la session dans le fragment `#access_token=...&refresh_token=...`
 * (grant implicite). Notre client est configuré en flow PKCE (nécessaire
 * pour l'auth SSR), qui n'écoute que `?code=` et ignore donc ce fragment
 * silencieusement. On le parse et on établit la session nous-mêmes.
 */
export function SessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!window.location.hash.includes("access_token")) return;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;

    const supabase = createClient();
    supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
      if (data.session && !error) {
        router.replace("/dashboard");
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    });
  }, [router]);

  return null;
}
