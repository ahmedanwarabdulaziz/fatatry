'use server';

import { requireAdmin } from '@/lib/admin-auth';

import { FieldPath, FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { cloverConfigured, getCloverItems } from '@/lib/clover';
import { isStrong, suggestMatches, CloverItemLite, MatchSuggestion } from '@/lib/clover-match';
import { getCategories } from '../categories/actions';
import { getMenuItems } from '../menu-items/actions';

export interface LinkRow {
    key: string;
    itemId: string;
    sizeName: string | null;
    name: string;
    categoryName: string;
    catering: boolean;
    price: number;
    linkedId: string | null;
    suggestions: MatchSuggestion[];
    strong: boolean;
}

export interface CloverLinkData {
    configured: boolean;
    error?: string;
    rows: LinkRow[];
    cloverItems: CloverItemLite[];
}

export async function getCloverLinkData(refresh = false): Promise<CloverLinkData> {
    await requireAdmin();
    if (!cloverConfigured()) return { configured: false, rows: [], cloverItems: [] };

    let cloverItems: CloverItemLite[];
    try {
        cloverItems = await getCloverItems(refresh);
    } catch (e) {
        return { configured: true, error: (e as Error).message, rows: [], cloverItems: [] };
    }

    const [categories, items] = await Promise.all([getCategories(), getMenuItems()]);
    const catById = new Map(categories.map((c) => [c.id, c]));
    const order = new Map(categories.map((c, i) => [c.id, i]));

    const rows: LinkRow[] = [];
    const sorted = [...items].sort((a, b) => (order.get(a.categoryId) ?? 999) - (order.get(b.categoryId) ?? 999) || a.order - b.order);
    for (const item of sorted) {
        const cat = catById.get(item.categoryId);
        const catering = (cat?.type || 'dine-in') === 'catering';
        const base = { itemId: item.id, categoryName: cat?.name || '(no category)', catering };
        const variants = item.sizes && item.sizes.length
            ? item.sizes.map((s) => ({ sizeName: s.name, label: `${item.name} (${s.name})`, price: s.price, linkedId: item.cloverSizeItemIds?.[s.name] || null }))
            : [{ sizeName: null, label: item.name, price: item.price, linkedId: item.cloverItemId || null }];

        for (const v of variants) {
            const suggestions = suggestMatches(v.sizeName ? `${item.name} ${v.sizeName}` : item.name, v.price, catering, cloverItems);
            rows.push({
                ...base,
                key: v.sizeName ? `${item.id}::${v.sizeName}` : item.id,
                sizeName: v.sizeName,
                name: v.label.trim(),
                price: v.price,
                linkedId: v.linkedId,
                suggestions,
                strong: isStrong(suggestions[0], suggestions[1]),
            });
        }
    }

    return { configured: true, rows, cloverItems };
}

function linkField(sizeName: string | null): FieldPath {
    return sizeName ? new FieldPath('cloverSizeItemIds', sizeName) : new FieldPath('cloverItemId');
}

/** Link (or unlink, when cloverId is null) one website item / size to a Clover item. */
export async function saveCloverLink(itemId: string, sizeName: string | null, cloverId: string | null) {
    await requireAdmin();
    await adminDb.collection('menu_items').doc(itemId).update(linkField(sizeName), cloverId ?? FieldValue.delete());
}

/** Save several links in one batch (used by "Accept all strong suggestions"). */
export async function saveCloverLinks(links: { itemId: string; sizeName: string | null; cloverId: string }[]) {
    await requireAdmin();
    const batch = adminDb.batch();
    for (const l of links) {
        batch.update(adminDb.collection('menu_items').doc(l.itemId), linkField(l.sizeName), l.cloverId);
    }
    await batch.commit();
    return links.length;
}
