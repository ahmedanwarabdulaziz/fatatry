// Uber Direct client (server only). Docs: https://developer.uber.com/docs/deliveries
// Credentials come from the environment and are never sent to the browser.

import { createHmac, timingSafeEqual } from "crypto";
import { DELIVERY, normalizePostal } from "./delivery-config";

const API = "https://api.uber.com/v1";
const AUTH_URL = "https://auth.uber.com/oauth/v2/token";

export function uberConfigured(): boolean {
    return Boolean(process.env.UBER_DIRECT_CUSTOMER_ID && process.env.UBER_DIRECT_CLIENT_ID && process.env.UBER_DIRECT_CLIENT_SECRET);
}

export class UberError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(force = false): Promise<string> {
    if (!force && tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token;
    const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.UBER_DIRECT_CLIENT_ID || "",
            client_secret: process.env.UBER_DIRECT_CLIENT_SECRET || "",
            grant_type: "client_credentials",
            scope: "eats.deliveries",
        }),
        cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.access_token) {
        throw new UberError(res.status, `Uber sign-in failed: ${json.error || res.status} ${json.message || json.error_description || ""}`.trim());
    }
    // Tokens last 30 days; refresh a little early
    tokenCache = { token: json.access_token, expiresAt: Date.now() + Math.max(60, (json.expires_in || 3600) - 300) * 1000 };
    return tokenCache.token;
}

async function uberFetch<T>(path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<T> {
    const customer = process.env.UBER_DIRECT_CUSTOMER_ID;
    const attempt = async (force: boolean) => {
        const token = await getToken(force);
        return fetch(`${API}/customers/${customer}${path}`, {
            method: init.method,
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: init.body === undefined ? undefined : JSON.stringify(init.body),
            cache: "no-store",
        });
    };
    let res = await attempt(false);
    if (res.status === 401) res = await attempt(true); // token may have been revoked: get a new one once
    const text = await res.text();
    let json: any = {};
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        /* non-JSON */
    }
    if (!res.ok) throw new UberError(res.status, `Uber ${path.split("?")[0]} failed (${res.status}): ${json.code || ""} ${json.message || text.slice(0, 200)}`.trim());
    return json as T;
}

// ---- addresses ---------------------------------------------------------------

export interface DropoffAddress {
    street: string;
    unit?: string;
    city: string;
    postalCode: string;
}

function addressJson(a: { street: string[]; city: string; state: string; zip: string; country: string }): string {
    return JSON.stringify({ street_address: a.street, city: a.city, state: a.state, zip_code: a.zip, country: a.country });
}

const pickupAddress = () =>
    addressJson({ street: [...DELIVERY.pickup.street], city: DELIVERY.pickup.city, state: DELIVERY.pickup.state, zip: DELIVERY.pickup.zip, country: DELIVERY.pickup.country });

export const dropoffAddressJson = (d: DropoffAddress) =>
    addressJson({
        street: [d.street, ...(d.unit ? [`Unit ${d.unit.replace(/^unit\s*/i, "")}`] : [])],
        city: d.city,
        state: DELIVERY.province,
        zip: normalizePostal(d.postalCode),
        country: "CA",
    });

/** Canadian phone number in +1XXXXXXXXXX form (Uber's format) */
export function e164(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith("1") ? `+${digits}` : `+${digits}`;
}

// ---- quote -------------------------------------------------------------------

export interface UberQuote {
    id: string;
    feeCents: number;
    currency: string;
    durationMinutes: number; // end to end, from now
    expires: string;
}

export async function createQuote(dropoff: DropoffAddress, dropoffPhone?: string): Promise<UberQuote> {
    const q = await uberFetch<any>("/delivery_quotes", {
        method: "POST",
        body: {
            pickup_address: pickupAddress(),
            dropoff_address: dropoffAddressJson(dropoff),
            pickup_phone_number: DELIVERY.pickup.phone,
            ...(dropoffPhone && dropoffPhone.replace(/\D/g, "").length >= 10 ? { dropoff_phone_number: e164(dropoffPhone) } : {}),
        },
    });
    if (!q.id || typeof q.fee !== "number") throw new UberError(502, "Uber returned an unexpected quote");
    return { id: q.id, feeCents: q.fee, currency: String(q.currency_type || q.currency || "").toUpperCase(), durationMinutes: Number(q.duration || 0), expires: q.expires };
}

// ---- delivery ----------------------------------------------------------------

export interface UberDelivery {
    id: string;
    status: string;
    trackingUrl: string;
    feeCents: number;
}

export interface CreateDeliveryInput {
    quoteId: string;
    dropoff: DropoffAddress;
    dropoffName: string;
    dropoffPhone: string;
    dropoffNotes: string;
    items: { name: string; quantity: number }[];
    orderCode: string;
    orderTotalCents: number;
    readyAt: Date; // when the food will be ready for the courier
    externalId: string; // our order id
}

export async function createDelivery(i: CreateDeliveryInput): Promise<UberDelivery> {
    const body: Record<string, unknown> = {
        quote_id: i.quoteId,
        pickup_name: DELIVERY.pickup.name,
        pickup_address: pickupAddress(),
        pickup_phone_number: DELIVERY.pickup.phone,
        pickup_notes: `Online order ${i.orderCode}. Ask for the order number at the counter.`,
        dropoff_name: i.dropoffName,
        dropoff_address: dropoffAddressJson(i.dropoff),
        dropoff_phone_number: e164(i.dropoffPhone),
        dropoff_notes: i.dropoffNotes,
        manifest_items: i.items.map((it) => ({ name: it.name, quantity: it.quantity, size: "small" })),
        manifest_reference: i.orderCode,
        manifest_total_value: i.orderTotalCents,
        pickup_ready_dt: i.readyAt.toISOString(),
        undeliverable_action: "return",
        external_id: i.externalId,
        idempotency_key: i.externalId, // creating twice with the same key must not book two couriers
    };
    // Test mode only: a simulated "robo courier" moves the delivery through its statuses
    if (process.env.UBER_ROBO_COURIER === "true") body.test_specifications = { robo_courier_specification: { mode: "auto" } };

    const d = await uberFetch<any>("/deliveries", { method: "POST", body });
    if (!d.id) throw new UberError(502, "Uber returned an unexpected delivery");
    return { id: d.id, status: String(d.status || "pending"), trackingUrl: String(d.tracking_url || ""), feeCents: Number(d.fee || 0) };
}

/** Cancel path is inferred from Uber's docs anchor: confirm with the first test delivery. */
export async function cancelDelivery(deliveryId: string) {
    return uberFetch<any>(`/deliveries/${deliveryId}/cancel`, { method: "POST", body: {} });
}

// ---- webhook signature ---------------------------------------------------------

/** Uber signs the raw request body with HMAC-SHA256 (hex) using the webhook signing key. */
export function verifyWebhookSignature(rawBody: string, header: string | null): boolean {
    const key = process.env.UBER_WEBHOOK_SIGNING_KEY;
    if (!key || !header) return false;
    const expected = createHmac("sha256", key).update(rawBody, "utf8").digest("hex");
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(header.trim().toLowerCase(), "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
}
