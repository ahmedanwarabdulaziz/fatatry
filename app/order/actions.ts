'use server';

import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { isAdmin } from '@/lib/admin-auth';
import { getOrderingAccess } from '@/lib/ordering-status';
import { getOrderMenu } from '@/lib/order-menu';
import { createCloverOrder, deleteCloverOrder, getCloverOrder, payCloverOrder, printCloverOrder } from '@/lib/clover';
import { getPickupInfo, validatePickup } from '@/lib/hours';
import { ORDERING } from '@/lib/ordering-config';
import type {
    CartLine, CartLineInput, CustomerInput, PickupChoice, PickupInfo, PlaceOrderResult, QuoteResult,
} from '@/lib/order-types';

// ---- helpers ---------------------------------------------------------------

async function assertCanOrder(): Promise<string | null> {
    const access = await getOrderingAccess();
    if (access.admin) return access.missing.length ? 'Ordering is not fully set up yet.' : null;
    if (access.paused) return 'Online ordering is paused right now. Please call us to order.';
    if (!access.publicLive) return 'Online ordering is not available yet.';
    return null;
}

const clean = (s: unknown, max: number) =>
    String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

/** Rebuilds the cart from Clover data. Names, prices and options come from the server, never the browser. */
async function priceLines(inputs: CartLineInput[]): Promise<
    | { ok: true; lines: CartLine[]; subtotalCents: number; taxCents: number; totalCents: number; taxRate: number; orderTypeId: string | null }
    | { ok: false; error: string }
> {
    if (!Array.isArray(inputs) || inputs.length === 0) return { ok: false, error: 'Your cart is empty.' };
    if (inputs.length > ORDERING.maxLines) return { ok: false, error: 'Too many different items in the cart.' };

    const { menu, catalog } = await getOrderMenu();
    const variants = new Map<string, { itemName: string; label: string; priceCents: number; groups: import('@/lib/order-types').OrderModGroup[] }>();
    for (const cat of menu.categories) {
        for (const item of cat.items) {
            for (const v of item.variants) variants.set(v.cloverId, { itemName: item.name, label: v.label, priceCents: v.priceCents, groups: v.groups });
        }
    }

    const lines: CartLine[] = [];
    let subtotal = 0;
    for (let index = 0; index < inputs.length; index++) {
        const input = inputs[index];
        const v = variants.get(String(input?.cloverId));
        if (!v) return { ok: false, error: 'One of the items in your cart is no longer available. Please remove it and try again.' };

        const qty = Number(input.qty);
        if (!Number.isInteger(qty) || qty < 1 || qty > ORDERING.maxQtyPerLine) return { ok: false, error: 'Please check the item quantities.' };

        const rawIds: string[] = (Array.isArray(input.modifierIds) ? input.modifierIds : []).map((x) => String(x));
        const modifierIds: string[] = rawIds.filter((id, i) => rawIds.indexOf(id) === i);
        const known = new Map<string, { name: string; priceCents: number; groupId: string }>();
        for (const g of v.groups) for (const m of g.modifiers) known.set(m.id, { name: m.name, priceCents: m.priceCents, groupId: g.id });
        if (modifierIds.some((id) => !known.has(id))) return { ok: false, error: `An option for ${v.itemName} is no longer available. Please re-add the item.` };

        for (const g of v.groups) {
            const count = modifierIds.filter((id) => known.get(id)!.groupId === g.id).length;
            if (count < g.min) return { ok: false, error: `Please choose an option for "${g.name}" on ${v.itemName}.` };
            if (g.max > 0 && count > g.max) return { ok: false, error: `Too many options chosen for "${g.name}" on ${v.itemName}.` };
        }

        const unitCents = v.priceCents + modifierIds.reduce((sum, id) => sum + known.get(id)!.priceCents, 0);
        subtotal += unitCents * qty;
        lines.push({
            key: String(index),
            cloverId: String(input.cloverId),
            qty,
            modifierIds,
            note: clean(input.note, ORDERING.maxNoteLength) || undefined,
            itemName: v.itemName,
            variantLabel: v.label,
            modifierNames: modifierIds.map((id) => known.get(id)!.name),
            unitCents,
        });
    }

    const taxCents = Math.round(subtotal * menu.taxRate);
    return { ok: true, lines, subtotalCents: subtotal, taxCents, totalCents: subtotal + taxCents, taxRate: menu.taxRate, orderTypeId: catalog.orderTypeId };
}

// Simple in-memory limit (per server instance): at most 5 order attempts per IP per 10 minutes
const attempts = new Map<string, number[]>();
function tooManyAttempts(ip: string): boolean {
    const now = Date.now();
    const recent = (attempts.get(ip) || []).filter((t) => now - t < 10 * 60_000);
    recent.push(now);
    attempts.set(ip, recent);
    return recent.length > 5;
}

// ---- actions ----------------------------------------------------------------

export async function loadPickup(): Promise<PickupInfo> {
    return getPickupInfo();
}

export async function getQuote(inputs: CartLineInput[]): Promise<QuoteResult> {
    const blocked = await assertCanOrder();
    if (blocked) return { ok: false, error: blocked };
    try {
        const priced = await priceLines(inputs);
        if (!priced.ok) return priced;
        return { ok: true, lines: priced.lines, subtotalCents: priced.subtotalCents, taxCents: priced.taxCents, totalCents: priced.totalCents };
    } catch (e) {
        console.error('getQuote failed', (e as Error).message);
        return { ok: false, error: 'Could not load prices right now. Please try again.' };
    }
}

export async function placeOrder(input: {
    lines: CartLineInput[];
    customer: CustomerInput;
    pickup: PickupChoice;
    cardToken: string;
    website?: string; // honeypot: real customers leave this empty
}): Promise<PlaceOrderResult> {
    const blocked = await assertCanOrder();
    if (blocked) return { ok: false, error: blocked };
    if (input.website) return { ok: false, error: 'Something went wrong. Please try again.' };

    const h = headers();
    const ip = (h.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (tooManyAttempts(ip)) return { ok: false, error: 'Too many attempts. Please wait a few minutes or call us.' };

    const name = clean(input.customer?.name, 60);
    const phone = clean(input.customer?.phone, 25);
    const email = clean(input.customer?.email, 120).toLowerCase();
    if (name.length < 2) return { ok: false, error: 'Please enter your name.' };
    if (phone.replace(/\D/g, '').length < 10) return { ok: false, error: 'Please enter a phone number we can reach you on.' };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Please enter a valid email for your receipt.' };

    const token = String(input.cardToken || '');
    if (!/^clv_[A-Za-z0-9_-]{6,200}$/.test(token)) return { ok: false, error: 'Please re-enter your card details.' };

    const pickupResult = validatePickup(input.pickup || { asap: false });
    if (pickupResult.ok === false) return { ok: false, error: pickupResult.error };
    const pickup = pickupResult;

    let priced;
    try {
        priced = await priceLines(input.lines);
    } catch (e) {
        console.error('placeOrder price check failed', (e as Error).message);
        return { ok: false, error: 'Could not confirm prices right now. Please try again.' };
    }
    if (!priced.ok) return priced;

    const admin = await isAdmin();
    const docRef = adminDb.collection('orders').doc();
    const orderCode = `EF-${docRef.id.slice(0, 5).toUpperCase()}`;
    const base = {
        orderCode,
        createdAt: new Date().toISOString(),
        customer: { name, phone, email },
        pickup: { date: pickup.date, minutes: pickup.minutes, label: pickup.label, asap: Boolean(input.pickup?.asap) },
        lines: priced.lines.map((l) => ({
            name: l.itemName, variant: l.variantLabel, qty: l.qty, unitCents: l.unitCents, options: l.modifierNames, note: l.note || '',
        })),
        subtotalCents: priced.subtotalCents,
        estimatedTaxCents: priced.taxCents,
        estimatedTotalCents: priced.totalCents,
        placedByAdmin: admin,
        fulfilment: 'new',
    };
    await docRef.set({ ...base, status: 'pending' });

    let cloverOrderId: string | null = null;
    let charged = false; // once true, the order must never be deleted
    try {
        const note = `ONLINE PICKUP ${pickup.label} | ${name} | ${phone}`;
        const created = await createCloverOrder(
            priced.lines.map((l) => ({ itemId: l.cloverId, modifierIds: l.modifierIds, note: l.note, qty: l.qty })),
            priced.orderTypeId,
            note
        );
        cloverOrderId = created.id;

        // Check the total Clover will charge against what the customer saw
        const total = created.total ?? (await getCloverOrder(created.id)).total;
        const tolerance = Math.max(5, priced.lines.length);
        if (typeof total !== 'number' || Math.abs(total - priced.totalCents) > tolerance) {
            await deleteCloverOrder(created.id).catch(() => undefined);
            await docRef.update({ status: 'failed', failure: `Total mismatch: shown ${priced.totalCents}, Clover ${total}`, cloverOrderId });
            return { ok: false, error: 'The total changed while we were preparing your order. Please review your cart and try again.' };
        }

        const payment = await payCloverOrder(created.id, token, email, ip, docRef.id);
        const status = String(payment.status || '').toLowerCase();
        if (status && !['succeeded', 'paid', 'approved', 'captured'].includes(status)) {
            throw new Error(`PAYMENT_DECLINED:status ${status}`);
        }

        charged = true;
        await docRef.update({ status: 'paid', cloverOrderId, paymentId: payment.id || null, totalCents: total, paidAt: new Date().toISOString() });

        if (process.env.CLOVER_PRINT_ONLINE_ORDERS === 'true') {
            await printCloverOrder(created.id).catch(async (e) => {
                console.error('print failed', (e as Error).message);
                await docRef.update({ printError: (e as Error).message.slice(0, 200) });
            });
        }
        return { ok: true, orderId: docRef.id };
    } catch (e) {
        const message = (e as Error).message || '';
        console.error('placeOrder failed', message.replace(/clv_[A-Za-z0-9_-]+/g, '[token]'));
        if (charged) {
            // The card was charged but a follow-up step failed: keep the order and tell staff via the record
            await docRef.update({ status: 'paid', cloverOrderId, followUpError: message.slice(0, 200) }).catch(() => undefined);
            return { ok: true, orderId: docRef.id };
        }
        if (cloverOrderId) await deleteCloverOrder(cloverOrderId).catch(() => undefined);
        await docRef.update({ status: 'failed', failure: message.replace(/clv_[A-Za-z0-9_-]+/g, '[token]').slice(0, 300), cloverOrderId });
        if (message.startsWith('PAYMENT_DECLINED')) {
            return { ok: false, error: 'Your card was declined. Please check the details or try another card.' };
        }
        return { ok: false, error: 'We could not place your order. You have not been charged. Please try again or call us.' };
    }
}
