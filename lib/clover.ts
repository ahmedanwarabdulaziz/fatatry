// Server-side Clover REST client. Reads CLOVER_MERCHANT_ID / CLOVER_API_TOKEN from the environment.
// Never import this from client components: the token must stay on the server.

import type { CloverItemLite } from "./clover-match";

const API_BASE = process.env.CLOVER_API_BASE || "https://api.clover.com";

export function cloverConfigured(): boolean {
    return Boolean(process.env.CLOVER_MERCHANT_ID && process.env.CLOVER_API_TOKEN);
}

async function cloverGet<T>(path: string): Promise<T> {
    const mid = process.env.CLOVER_MERCHANT_ID;
    const token = process.env.CLOVER_API_TOKEN;
    if (!mid || !token) throw new Error("Clover is not configured (CLOVER_MERCHANT_ID / CLOVER_API_TOKEN missing)");
    const res = await fetch(`${API_BASE}/v3/merchants/${mid}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
    });
    if (!res.ok) throw new Error(`Clover request failed (${res.status})`);
    return res.json() as Promise<T>;
}

interface CloverList<T> {
    elements: T[];
}
interface RawItem {
    id: string;
    name: string;
    price: number; // cents
    hidden?: boolean;
    categories?: CloverList<{ id: string; name: string }>;
}

let cache: { at: number; items: CloverItemLite[] } | null = null;

/** All Clover inventory items (cached for 60 seconds). */
export async function getCloverItems(force = false): Promise<CloverItemLite[]> {
    if (!force && cache && Date.now() - cache.at < 60_000) return cache.items;
    const items: CloverItemLite[] = [];
    // Clover pages results; 1000 per page is the maximum
    for (let offset = 0; ; offset += 1000) {
        const page = await cloverGet<CloverList<RawItem>>(`/items?limit=1000&offset=${offset}&expand=categories`);
        for (const i of page.elements) {
            items.push({
                id: i.id,
                name: i.name.trim(),
                price: (i.price || 0) / 100,
                categories: (i.categories?.elements || []).map((c) => c.name),
            });
        }
        if (page.elements.length < 1000) break;
    }
    cache = { at: Date.now(), items };
    return items;
}
