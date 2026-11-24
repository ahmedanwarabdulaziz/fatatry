'use server';

import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { isAdmin } from '@/lib/admin-auth';
import { getOrderingAccess } from '@/lib/ordering-status';
import { getOrderMenu } from '@/lib/order-menu';
import { createCloverOrder, deleteCloverOrder, getCloverOrder, payCloverOrder, printCloverOrder } from '@/lib/clover';
import { getPickupInfo, torontoParts, validatePickup } from '@/lib/hours';
import { getDeliveryAccess } from '@/lib/delivery-status';
import { createDelivery, createQuote, UberQuote } from '@/lib/uber';
import { customerDeliveryFee, DELIVERY, normalizePostal, POSTAL_CODE } from '@/lib/delivery-config';
import { ORDERING } from '@/lib/ordering-config';
import type {
    CartLine, CartLineInput, CustomerInput, DeliveryAddress, DeliveryQuoteResult, Fulfilment, PickupChoice, PickupInfo, PlaceOrderResult, QuoteResult,
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
    | { ok: true; lines: CartLine[]; subtotalCents: number; taxCents: number; totalCents: number; taxRate: number; taxRateId: string | null; orderTypeId: string | null }
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
    return { ok: true, lines, subtotalCents: subtotal, taxCents, totalCents: subtotal + taxCents, taxRate: menu.taxRate, taxRateId: catalog.taxRateId, orderTypeId: catalog.orderTypeId };
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

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** Validates and tidies a delivery address. Returns an error message (string) when it is not usable. */
function cleanAddress(a: DeliveryAddress | undefined): DeliveryAddress | string {
    const street = clean(a?.street, 80);
    const unit = clean(a?.unit, 15);
    const city = clean(a?.city, 40) || DELIVERY.defaultCity;
    const postalRaw = clean(a?.postalCode, 10);
    const notes = clean(a?.notes, 200);
    if (street.length < 3 || !/\d/.test(street)) return 'Please enter your street address, including the number.';
    if (city.length < 2) return 'Please enter your city.';
    if (!POSTAL_CODE.test(postalRaw)) return 'Please enter a valid postal code, for example L5M 1K7.';
    return { street, unit, city, postalCode: normalizePostal(postalRaw), notes };
}

// At most 12 delivery price checks per IP per 10 minutes (Uber limits how often we may ask)
const quoteAttempts = new Map<string, number[]>();
function tooManyQuotes(ip: string): boolean {
    const now = Date.now();
    const recent = (quoteAttempts.get(ip) || []).filter((t) => now - t < 10 * 60_000);
    recent.push(now);
    quoteAttempts.set(ip, recent);
    return recent.length > 12;
}

/** Asks Uber for a quote and checks it is usable (right currency, not too far). */
async function usableQuote(address: DeliveryAddress, phone?: string): Promise<{ ok: true; quote: UberQuote } | { ok: false; error: string }> {
    try {
        const quote = await createQuote(address, phone);
        if (quote.currency && quote.currency !== 'CAD') {
            console.error('Uber quote in unexpected currency', quote.currency);
            return { ok: false, error: 'Delivery is temporarily unavailable. Please choose pickup or call us.' };
        }
        if (quote.durationMinutes > DELIVERY.maxMinutes) {
            return { ok: false, error: 'Sorry, that address is outside our delivery area. Please choose pickup or call us.' };
        }
        return { ok: true, quote };
    } catch (e) {
        console.error('Uber quote failed', (e as Error).message);
        return { ok: false, error: "We can't deliver to that address right now. Please check it, choose pickup, or call us." };
    }
}

// ---- actions ----------------------------------------------------------------

export async function loadPickup(): Promise<PickupInfo> {
    return getPickupInfo();
}

export async function getDeliveryQuote(input: { address: DeliveryAddress; phone?: string; subtotalCents: number }): Promise<DeliveryQuoteResult> {
    const blocked = await assertCanOrder();
    if (blocked) return { ok: false, error: blocked };
    const access = await getDeliveryAccess();
    if (!access.available) return { ok: false, error: 'Delivery is not available right now. Please choose pickup.' };

    const ip = (headers().get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    if (tooManyQuotes(ip)) return { ok: false, error: 'Too many delivery checks. Please wait a few minutes or call us.' };

    const address = cleanAddress(input?.address);
    if (typeof address === 'string') return { ok: false, error: address };

    const result = await usableQuote(address, input.phone);
    if (!result.ok) return result;
    const subtotal = Number(input.subtotalCents) || 0;
    return { ok: true, feeCents: customerDeliveryFee(result.quote.feeCents, subtotal), etaMinutes: result.quote.durationMinutes };
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
    fulfilment?: Fulfilment; // defaults to pickup
    delivery?: DeliveryAddress;
    expectedFeeCents?: number; // delivery fee the customer saw
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

    // ---- delivery: check the address and get a fresh quote BEFORE touching Clover or the card ----
    const isDelivery = input.fulfilment === 'delivery';
    let delivery: { address: DeliveryAddress; quote: UberQuote; customerFeeCents: number } | null = null;
    if (isDelivery) {
        const access = await getDeliveryAccess();
        if (!access.available) return { ok: false, error: 'Delivery is not available right now. Please choose pickup.' };
        const address = cleanAddress(input.delivery);
        if (typeof address === 'string') return { ok: false, error: address };
        if (priced.subtotalCents < DELIVERY.minOrderCents) {
            return { ok: false, error: `Delivery needs a minimum order of ${money(DELIVERY.minOrderCents)} before tax.` };
        }
        const q = await usableQuote(address, phone);
        if (!q.ok) return q;
        const customerFeeCents = customerDeliveryFee(q.quote.feeCents, priced.subtotalCents);
        if (typeof input.expectedFeeCents === 'number' && Math.abs(customerFeeCents - input.expectedFeeCents) > 50) {
            return { ok: false, error: `The delivery fee is now ${money(customerFeeCents)}. Please review your order and confirm.`, feeChangedTo: customerFeeCents };
        }
        delivery = { address, quote: q.quote, customerFeeCents };
    }
    const feeCents = delivery?.customerFeeCents ?? 0;
    const feeTaxCents = DELIVERY.taxDeliveryFee ? Math.round(feeCents * priced.taxRate) : 0;
    const expectedTotal = priced.totalCents + feeCents + feeTaxCents;

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
        estimatedTaxCents: priced.taxCents + feeTaxCents,
        estimatedTotalCents: expectedTotal,
        placedByAdmin: admin,
        fulfilment: 'new',
        fulfilmentType: delivery ? 'delivery' : 'pickup',
        ...(delivery
            ? {
                  delivery: {
                      address: delivery.address,
                      customerFeeCents: delivery.customerFeeCents,
                      uberFeeCents: delivery.quote.feeCents,
                      quoteId: delivery.quote.id,
                      etaMinutes: delivery.quote.durationMinutes,
                      status: 'awaiting-payment',
                  },
              }
            : {}),
    };
    await docRef.set({ ...base, status: 'pending' });

    let cloverOrderId: string | null = null;
    let charged = false; // once true, the order must never be deleted
    try {
        const where = delivery ? `${delivery.address.street}${delivery.address.unit ? ' Unit ' + delivery.address.unit : ''}, ${delivery.address.city} ${delivery.address.postalCode}` : '';
        const note = delivery
            ? `ONLINE DELIVERY (Uber courier picks up ${pickup.label}) | ${name} | ${phone} | ${where}`
            : `ONLINE PICKUP ${pickup.label} | ${name} | ${phone}`;
        const created = await createCloverOrder(
            priced.lines.map((l) => ({ itemId: l.cloverId, modifierIds: l.modifierIds, note: l.note, qty: l.qty })),
            priced.orderTypeId,
            note,
            feeCents > 0 ? [{ name: 'Delivery fee', priceCents: feeCents, taxRateId: DELIVERY.taxDeliveryFee ? priced.taxRateId : null }] : []
        );
        cloverOrderId = created.id;

        // Check the total Clover will charge against what the customer saw
        const total = created.total ?? (await getCloverOrder(created.id)).total;
        const tolerance = Math.max(5, priced.lines.length);
        if (typeof total !== 'number' || Math.abs(total - expectedTotal) > tolerance) {
            await deleteCloverOrder(created.id).catch(() => undefined);
            await docRef.update({ status: 'failed', failure: `Total mismatch: shown ${expectedTotal}, Clover ${total}`, cloverOrderId });
            return { ok: false, error: 'The total changed while we were preparing your order. Please review your cart and try again.' };
        }

        const payment = await payCloverOrder(created.id, token, email, ip, docRef.id);
        const status = String(payment.status || '').toLowerCase();
        if (status && !['succeeded', 'paid', 'approved', 'captured'].includes(status)) {
            throw new Error(`PAYMENT_DECLINED:status ${status}`);
        }

        charged = true;
        await docRef.update({ status: 'paid', cloverOrderId, paymentId: payment.id || null, totalCents: total, paidAt: new Date().toISOString() });

        // Only now (money taken) book the courier. A failure here keeps the paid order and alerts staff.
        if (delivery) {
            const minutesUntilReady = Math.max(0, pickup.minutes - torontoParts().minutes);
            const booking = {
                quoteId: delivery.quote.id,
                dropoff: delivery.address,
                dropoffName: name,
                dropoffPhone: phone,
                dropoffNotes: delivery.address.notes,
                items: priced.lines.map((l) => ({ name: l.itemName + (l.variantLabel ? ` (${l.variantLabel})` : ''), quantity: l.qty })),
                orderCode,
                orderTotalCents: total,
                readyAt: new Date(Date.now() + minutesUntilReady * 60_000),
                externalId: docRef.id,
            };
            let booked: Awaited<ReturnType<typeof createDelivery>> | null = null;
            let bookingError = '';
            for (let attempt = 0; attempt < 2 && !booked; attempt++) {
                try {
                    booked = await createDelivery(booking);
                } catch (err) {
                    bookingError = (err as Error).message.slice(0, 250);
                    console.error('Uber booking failed', bookingError);
                    if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
                }
            }
            await docRef.update(
                booked
                    ? { 'delivery.uberDeliveryId': booked.id, 'delivery.trackingUrl': booked.trackingUrl, 'delivery.status': booked.status }
                    : { 'delivery.status': 'booking-failed', 'delivery.error': bookingError }
            );
        }

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
