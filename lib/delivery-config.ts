// Delivery (Uber Direct) settings. Safe to import from client and server code.
// All values here can be changed without touching the rest of the code.

export const DELIVERY = {
    minOrderCents: 2500, // minimum food subtotal for delivery ($25)
    maxMinutes: 45, // refuse addresses Uber says are further than this (pickup + drive time)
    markupCents: 0, // added on top of Uber's fee (0 = customer pays exactly Uber's fee)
    freeDeliveryOverCents: 0, // food subtotal at which the customer pays no fee (the restaurant absorbs it); 0 = never
    taxDeliveryFee: false, // TODO(accountant): is HST charged on the delivery fee? false until confirmed
    province: "ON",
    defaultCity: "Mississauga",
    // Where couriers pick the food up
    pickup: {
        name: "Elfatatry",
        street: ["117 Queen St S", "Unit 5 & 6"],
        city: "Mississauga",
        state: "ON",
        zip: "L5M 1K7",
        country: "CA",
        phone: "+14377997773",
    },
} as const;

/** Canadian postal code, e.g. "L5M 1K7" */
export const POSTAL_CODE = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

export function normalizePostal(value: string): string {
    const s = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    return s.length === 6 ? `${s.slice(0, 3)} ${s.slice(3)}` : s;
}

/** What the customer pays for delivery, given Uber's quoted fee. */
export function customerDeliveryFee(uberFeeCents: number, subtotalCents: number): number {
    if (DELIVERY.freeDeliveryOverCents > 0 && subtotalCents >= DELIVERY.freeDeliveryOverCents) return 0;
    return uberFeeCents + DELIVERY.markupCents;
}
