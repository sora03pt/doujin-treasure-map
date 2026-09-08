import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Doujin Treasure Map",
    short_name: "Treasure Map",
    description: "同人イベント当日のサークル巡回を管理する、自分専用の宝の地図。",
    start_url: "/events",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f766e",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
