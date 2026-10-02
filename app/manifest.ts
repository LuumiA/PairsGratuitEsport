import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PairsGratuitEsport",
    short_name: "PairsGratuit",
    description:
      "Paris esport 100% gratuits sur Valorant, CS2 et League of Legends — points virtuels uniquement.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a12",
    theme_color: "#0a0a12",
    icons: [{ src: "/icon", sizes: "192x192", type: "image/png" }],
  };
}
