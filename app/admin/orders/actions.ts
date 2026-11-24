'use server';

import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { isPaused, orderingSwitchedOn, setPaused } from '@/lib/ordering-status';

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
