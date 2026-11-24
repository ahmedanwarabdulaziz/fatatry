'use server';

import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { isPaused, orderingSwitchedOn, setPaused } from '@/lib/ordering-status';
import { createDelivery, createQuote } from '@/lib/uber';

export interface AdminOrder {
    id: string;
    orderCode: string;
    createdAt: string;
    status: string;
    fulfilment: string;
    customer: { name: string; phone: string; email: string };
    pickupLabel: string;
    lines: { name: string; variant: string; qty: number; options: string[]; note: string }[];
    totalCents: number;
    placedByAdmin: boolean;
    failure?: string;
    printError?: string;
    followUpError?: string;
    delivery?: {
        address: string;
        status: string;
        trackingUrl: string;
        courier: string;
        error: string;
        canRetry: boolean;
    };
}

export async function getOrdersData(): Promise<{ orders: AdminOrder[]; paused: boolean; switchedOn: boolean }> {
    await requireAdmin();
    const snap = await adminDb.collection('orders').orderBy('createdAt', 'desc').limit(60).get();
    const orders = snap.docs.map((d) => {
        const o = d.data();
        return {
            id: d.id,
            orderCode: o.orderCode || d.id.slice(0, 5).toUpperCase(),
            createdAt: o.createdAt || '',
            status: o.status || 'unknown',
            fulfilment: o.fulfilment || 'new',
            customer: o.customer || { name: '', phone: '', email: '' },
            pickupLabel: o.pickup?.label || '',
            lines: o.lines || [],
            totalCents: o.totalCents ?? o.estimatedTotalCents ?? 0,
            placedByAdmin: Boolean(o.placedByAdmin),
            failure: o.failure,
            printError: o.printError,
            followUpError: o.followUpError,
            delivery: o.fulfilmentType === 'delivery' && o.delivery
                ? {
                      address: [o.delivery.address?.street, o.delivery.address?.unit ? 'Unit ' + o.delivery.address.unit : '', o.delivery.address?.city, o.delivery.address?.postalCode].filter(Boolean).join(', '),
                      status: o.delivery.status || '',
                      trackingUrl: o.delivery.trackingUrl || '',
                      courier: o.delivery.courier?.name ? o.delivery.courier.name + (o.delivery.courier.vehicle ? ' (' + o.delivery.courier.vehicle + ')' : '') : '',
                      error: o.delivery.error || '',
                      canRetry: o.status === 'paid' && !o.delivery.uberDeliveryId,
                  }
                : undefined,
        } as AdminOrder;
    });
    return { orders, paused: await isPaused(), switchedOn: orderingSwitchedOn() };
}

export async function setOrderingPaused(paused: boolean) {
    await requireAdmin();
    await setPaused(paused);
}

export async function setFulfilment(orderId: string, fulfilment: 'new' | 'preparing' | 'ready' | 'picked-up' | 'cancelled') {
    await requireAdmin();
    await adminDb.collection('orders').doc(orderId).update({ fulfilment, updatedAt: new Date().toISOString() });
}

/** Books the Uber courier again for a paid delivery order whose first booking failed. */
export async function retryDelivery(orderId: string): Promise<{ ok: boolean; error?: string }> {
    await requireAdmin();
    const ref = adminDb.collection('orders').doc(orderId);
    const doc = await ref.get();
    const o = doc.data();
    if (!o || o.status !== 'paid' || o.fulfilmentType !== 'delivery' || !o.delivery || o.delivery.uberDeliveryId) {
        return { ok: false, error: 'This order does not need a new courier booking.' };
    }
    try {
        const quote = await createQuote(o.delivery.address, o.customer.phone);
        const booked = await createDelivery({
            quoteId: quote.id,
            dropoff: o.delivery.address,
            dropoffName: o.customer.name,
            dropoffPhone: o.customer.phone,
            dropoffNotes: o.delivery.address.notes || '',
            items: (o.lines || []).map((l: any) => ({ name: l.name + (l.variant ? ' (' + l.variant + ')' : ''), quantity: l.qty })),
            orderCode: o.orderCode,
            orderTotalCents: o.totalCents ?? o.estimatedTotalCents ?? 0,
            readyAt: new Date(Date.now() + 5 * 60_000),
            externalId: orderId,
        });
        await ref.update({
            'delivery.uberDeliveryId': booked.id,
            'delivery.trackingUrl': booked.trackingUrl,
            'delivery.status': booked.status,
            'delivery.error': '',
            'delivery.uberFeeCents': quote.feeCents,
        });
        return { ok: true };
    } catch (e) {
        const message = (e as Error).message.slice(0, 250);
        await ref.update({ 'delivery.error': message });
        return { ok: false, error: message };
    }
}
