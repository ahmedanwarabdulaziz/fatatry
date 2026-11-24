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

// ---------------------------------------------------------------------------
// Ordering: catalog with modifiers, order creation, payment (server only)
// ---------------------------------------------------------------------------

const ECOMM_BASE = process.env.CLOVER_ECOMM_BASE || "https://scl.clover.com";

export interface CloverModifierFull {
    id: string;
    name: string;
    priceCents: number;
}
export interface CloverGroupFull {
    id: string;
    name: string;
    min: number;
    max: number; // 0 = no limit set in Clover
    modifiers: CloverModifierFull[];
}
export interface CloverCatalogItem {
    id: string;
    name: string;
    priceCents: number;
    orderable: boolean; // fixed price, > $0, not hidden/unavailable
    groupIds: string[];
}
export interface CloverCatalog {
    items: Map<string, CloverCatalogItem>;
    groups: Map<string, CloverGroupFull>;
    taxRate: number; // default tax rate as a fraction, e.g. 0.13
    orderTypeId: string | null;
}

let catalogCache: { at: number; data: CloverCatalog } | null = null;

export async function getCloverCatalog(force = false): Promise<CloverCatalog> {
    if (!force && catalogCache && Date.now() - catalogCache.at < 60_000) return catalogCache.data;

    const items = new Map<string, CloverCatalogItem>();
    for (let offset = 0; ; offset += 1000) {
        const page = await cloverGet<{ elements: any[] }>(`/items?limit=1000&offset=${offset}&expand=modifierGroups`);
        for (const i of page.elements) {
            items.set(i.id, {
                id: i.id,
                name: String(i.name || "").trim(),
                priceCents: i.price || 0,
                orderable: !i.hidden && i.available !== false && (i.priceType || "FIXED") === "FIXED" && (i.price || 0) > 0,
                groupIds: (i.modifierGroups?.elements || []).map((g: any) => g.id),
            });
        }
        if (page.elements.length < 1000) break;
    }

    const groups = new Map<string, CloverGroupFull>();
    const groupPage = await cloverGet<{ elements: any[] }>(`/modifier_groups?limit=1000&expand=modifiers`);
    for (const g of groupPage.elements) {
        groups.set(g.id, {
            id: g.id,
            name: String(g.name || "").trim(),
            min: g.minRequired || 0,
            max: g.maxAllowed || 0,
            modifiers: (g.modifiers?.elements || [])
                .filter((m: any) => m.available !== false)
                .map((m: any) => ({ id: m.id, name: String(m.name || "").trim(), priceCents: m.price || 0 })),
        });
    }

    const rates = await cloverGet<{ elements: any[] }>(`/tax_rates`);
    const def = rates.elements.find((r) => r.isDefault) || rates.elements.find((r) => r.rate > 0);
    const taxRate = def ? def.rate / 10_000_000 : 0.13;

    let orderTypeId: string | null = process.env.CLOVER_ORDER_TYPE_ID || null;
    if (!orderTypeId) {
        try {
            const types = await cloverGet<{ elements: any[] }>(`/order_types`);
            orderTypeId = types.elements.find((t) => /online\s*pick/i.test(t.label || ""))?.id || null;
        } catch {
            orderTypeId = null;
        }
    }

    const data = { items, groups, taxRate, orderTypeId };
    catalogCache = { at: Date.now(), data };
    return data;
}

async function cloverSend<T>(method: "POST" | "DELETE", path: string, body?: unknown): Promise<T> {
    const mid = process.env.CLOVER_MERCHANT_ID;
    const token = process.env.CLOVER_API_TOKEN;
    if (!mid || !token) throw new Error("Clover is not configured");
    const res = await fetch(`${API_BASE}/v3/merchants/${mid}${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Clover ${method} ${path.split("?")[0]} failed (${res.status}) ${text.slice(0, 300)}`);
    return (text ? JSON.parse(text) : {}) as T;
}

export interface CloverLineInput {
    itemId: string;
    modifierIds: string[];
    note?: string;
}

/** Creates the order in Clover. Clover line items are one per unit, so quantities are expanded. */
export async function createCloverOrder(lines: (CloverLineInput & { qty: number })[], orderTypeId: string | null, note: string) {
    const lineItems = lines.flatMap((l) =>
        Array.from({ length: l.qty }, () => ({
            item: { id: l.itemId },
            ...(l.modifierIds.length ? { modifications: l.modifierIds.map((id) => ({ modifier: { id } })) } : {}),
            ...(l.note ? { note: l.note } : {}),
            printed: false,
            exchanged: false,
            refunded: false,
        }))
    );
    const order = await cloverSend<{ id: string; total?: number; currency?: string }>("POST", "/atomic_order/orders", {
        // The order type is optional: when none exists the pickup details are carried in the order note
        orderCart: { lineItems, ...(orderTypeId ? { orderType: { id: orderTypeId } } : {}), note },
    });
    return order;
}

export async function deleteCloverOrder(orderId: string) {
    await cloverSend("DELETE", `/orders/${orderId}`);
}

/** Sends the order to the kitchen printers (only when CLOVER_PRINT_ONLINE_ORDERS=true). */
export async function printCloverOrder(orderId: string) {
    await cloverSend("POST", "/print_event", { orderRef: { id: orderId } });
}

export async function payCloverOrder(orderId: string, cardToken: string, email: string, ip: string, idempotencyKey: string) {
    const key = process.env.CLOVER_ECOMM_PRIVATE_KEY;
    if (!key) throw new Error("Clover ecommerce key is not configured");
    const res = await fetch(`${ECOMM_BASE}/v1/orders/${orderId}/pay`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
            "x-forwarded-for": ip,
            "User-Agent": "elfatatry-website",
        },
        body: JSON.stringify({ source: cardToken, ecomind: "ecom", email }),
        cache: "no-store",
    });
    const text = await res.text();
    let json: any = {};
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        /* non-JSON error body */
    }
    if (!res.ok) {
        // Never include the request (it holds the card token) in the message
        const reason = json?.error?.message || json?.message || `status ${res.status}`;
        throw new Error(`PAYMENT_DECLINED:${reason}`);
    }
    return json as { id?: string; status?: string; amount?: number };
}

export function ecommerceReady(): boolean {
    return Boolean(process.env.CLOVER_ECOMM_PUBLIC_KEY && process.env.CLOVER_ECOMM_PRIVATE_KEY);
}

export function cloverSdkUrl(): string {
    return process.env.CLOVER_SDK_URL || "https://checkout.clover.com/sdk.js";
}

export async function getCloverOrder(orderId: string) {
    return cloverGet<{ id: string; total?: number; state?: string }>(`/orders/${orderId}`);
}
