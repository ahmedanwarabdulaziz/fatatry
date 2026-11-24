// Who can order, and what is missing before ordering can work. Server only.

import { adminDb } from "./firebase-admin";
import { isAdmin } from "./admin-auth";
import { cloverConfigured, ecommerceReady, getCloverCatalog } from "./clover";

const SETTINGS_DOC = adminDb.collection("settings").doc("ordering");

export async function isPaused(): Promise<boolean> {
    const doc = await SETTINGS_DOC.get();
    return Boolean(doc.exists && doc.data()?.paused);
}

export async function setPaused(paused: boolean) {
    await SETTINGS_DOC.set({ paused, updatedAt: new Date().toISOString() }, { merge: true });
}

/** Master switch: set ORDERING_ENABLED=true on the server when the owner approves launch. */
export function orderingSwitchedOn(): boolean {
    return process.env.ORDERING_ENABLED === "true";
}

export interface OrderingAccess {
    publicLive: boolean; // customers can order
    admin: boolean; // signed-in admin (can order for testing even when not live)
    paused: boolean;
    missing: string[]; // setup still needed
}

export async function getOrderingAccess(): Promise<OrderingAccess> {
    const [admin, paused] = await Promise.all([isAdmin(), isPaused()]);
    const missing: string[] = [];
    if (!cloverConfigured()) missing.push("Clover API token (CLOVER_MERCHANT_ID / CLOVER_API_TOKEN)");
    if (!ecommerceReady()) missing.push("Clover ecommerce keys (CLOVER_ECOMM_PUBLIC_KEY / CLOVER_ECOMM_PRIVATE_KEY)");
    if (cloverConfigured()) {
        try {
            await getCloverCatalog(); // confirms the token can read items (an "Online Pickup" order type is optional)
        } catch {
            missing.push("A Clover token that can read items and order types");
        }
    }
    return { publicLive: orderingSwitchedOn() && !paused && missing.length === 0, admin, paused, missing };
}
