// Whether delivery can be offered right now. Server only.

import { isAdmin } from "./admin-auth";
import { uberConfigured } from "./uber";

export interface DeliveryAccess {
    available: boolean; // show the delivery option
    configured: boolean;
}

/** Delivery is offered to customers when DELIVERY_ENABLED=true; signed-in admins can always try it for testing. */
export async function getDeliveryAccess(): Promise<DeliveryAccess> {
    const configured = uberConfigured();
    if (!configured) return { available: false, configured };
    const live = process.env.DELIVERY_ENABLED === "true";
    return { available: live || (await isAdmin()), configured };
}
