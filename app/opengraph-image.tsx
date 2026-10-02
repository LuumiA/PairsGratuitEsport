import { ImageResponse } from "next/og";

export const alt = "PairsGratuitEsport — paris esport 100% gratuits";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a12 0%, #160b24 55%, #0a0a12 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800 }}>
          <span style={{ color: "#a855f7" }}>Pairs</span>
          <span style={{ color: "#22d3ee" }}>Gratuit</span>
          <span style={{ color: "#ffffff" }}>Esport</span>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#9ca3af" }}>
          Valorant · CS2 · League of Legends — points gratuits, zéro argent réel
        </div>
      </div>
    ),
    size
  );
}
