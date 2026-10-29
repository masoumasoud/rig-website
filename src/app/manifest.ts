import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "گروه صنعتی رضایی | Rezaei Industrial Group",
    short_name: "R.I.G",
    description: "Precision machining and custom industrial parts — Karaj, Iran",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f5f1",
    theme_color: "#111214",
    lang: "fa",
    dir: "rtl",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
  };
}
