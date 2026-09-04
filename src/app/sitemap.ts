import type { MetadataRoute } from "next";
import { monthOffset } from "@/lib/rawg";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastModified = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/releases`, lastModified, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/new-games`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/anime`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/vault`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/shelf`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/quiz`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Monthly guides: last month, this month, next two months.
  const guides: MetadataRoute.Sitemap = [-1, 0, 1, 2].map((delta) => {
    const m = monthOffset(year, month, delta);
    return {
      url: `${base}/new-games/${m.year}-${String(m.month).padStart(2, "0")}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  return [...core, ...guides];
}