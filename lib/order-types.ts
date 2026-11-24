// Types shared by the ordering screens (client) and ordering server code. No server imports here.

export interface OrderModifier {
    id: string;
    name: string;
    priceCents: number;
}

export interface OrderModGroup {
    id: string;
    name: string;
    min: number;
    max: number; // 0 = unlimited
    modifiers: OrderModifier[];
}

/** One orderable Clover item: the item itself or one size of it */
export interface OrderVariant {
    cloverId: string;
    label: string; // "" for single-size items, e.g. "Medium" for sizes
    priceCents: number;
    groups: OrderModGroup[];
}

export interface OrderItem {
    id: string; // website item id
    name: string;
    description: string;
    image: string;
    variants: OrderVariant[];
}

export interface OrderCategory {
    id: string;
    name: string;
    items: OrderItem[];
}

export interface OrderMenu {
    categories: OrderCategory[];
    taxRate: number; // e.g. 0.13
}

/** Cart line as the browser sends it. Names and prices are NOT trusted: the server rebuilds them. */
export interface CartLineInput {
    cloverId: string;
    qty: number;
    modifierIds: string[];
    note?: string;
}

export interface CartLine extends CartLineInput {
    key: string;
    itemName: string;
    variantLabel: string;
    modifierNames: string[];
    unitCents: number;
}

export interface PickupSlot {
    minutes: number; // minutes after midnight, Toronto time
    label: string;
}

export interface PickupInfo {
    open: boolean;
    message?: string; // why ordering is closed
    date: string; // YYYY-MM-DD in Toronto
    asapLabel: string | null; // e.g. "about 25 minutes"
    slots: PickupSlot[];
}

export interface PickupChoice {
    asap: boolean;
    minutes?: number;
}

export interface CustomerInput {
    name: string;
    phone: string;
    email: string;
}

export interface QuoteResult {
    ok: boolean;
    error?: string;
    lines?: CartLine[];
    subtotalCents?: number;
    taxCents?: number;
    totalCents?: number;
}

export interface PlaceOrderResult {
    ok: boolean;
    error?: string;
    orderId?: string;
}

export const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;
