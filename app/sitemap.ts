import type { MetadataRoute } from "next";
import { dishes } from "@/lib/dishes";

const BASE = "https://elfatatry.com";

// Ad landing pages (/halal, /office-catering) are noindex and left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
    const pages = ["", "/menu", "/catering", "/about", "/contact", "/order"];
    return [
        ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
        ...dishes.map((d) => ({ url: `${BASE}/dishes/${d.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ];
}
