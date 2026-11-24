// Builds the orderable menu: website items that are linked to Clover, with Clover prices and options.
// Server only.

import { getCategories } from "@/app/admin/categories/actions";
import { getMenuItems } from "@/app/admin/menu-items/actions";
import { getCloverCatalog, CloverCatalog } from "./clover";
import { imageUrl } from "./image-url";
import { SINGLE_CHOICE_GROUPS } from "./ordering-config";
import type { OrderCategory, OrderItem, OrderMenu, OrderModGroup, OrderVariant } from "./order-types";

export function groupsForItem(catalog: CloverCatalog, cloverId: string): OrderModGroup[] {
    const item = catalog.items.get(cloverId);
    if (!item) return [];
    return item.groupIds
        .map((gid) => catalog.groups.get(gid))
        .filter((g): g is NonNullable<typeof g> => !!g && g.modifiers.length > 0)
        .map((g) => ({
            id: g.id,
            name: g.name,
            min: g.min,
            max: g.max > 0 ? g.max : SINGLE_CHOICE_GROUPS.has(g.name.toLowerCase()) ? 1 : 0,
            modifiers: g.modifiers,
        }));
}

function variantFor(catalog: CloverCatalog, cloverId: string, label: string): OrderVariant | null {
    const item = catalog.items.get(cloverId);
    if (!item || !item.orderable) return null;
    return { cloverId, label, priceCents: item.priceCents, groups: groupsForItem(catalog, cloverId) };
}

export async function getOrderMenu(): Promise<{ menu: OrderMenu; catalog: CloverCatalog }> {
    const [catalog, categories, items] = await Promise.all([getCloverCatalog(), getCategories(), getMenuItems()]);

    const result: OrderCategory[] = [];
    for (const cat of categories.filter((c) => (c.type || "dine-in") === "dine-in")) {
        const orderItems: OrderItem[] = [];
        for (const item of items.filter((i) => i.categoryId === cat.id).sort((a, b) => a.order - b.order)) {
            const variants: OrderVariant[] = [];
            if (item.sizes && item.sizes.length) {
                for (const s of item.sizes) {
                    const id = item.cloverSizeItemIds?.[s.name];
                    const v = id ? variantFor(catalog, id, s.name) : null;
                    if (v) variants.push(v);
                }
            } else if (item.cloverItemId) {
                const v = variantFor(catalog, item.cloverItemId, "");
                if (v) variants.push(v);
            }
            if (!variants.length) continue;
            orderItems.push({
                id: item.id,
                name: item.name.trim(),
                description: item.description?.trim() || "",
                image: item.squareImage ? imageUrl(item.squareImage, 256) : "",
                variants,
            });
        }
        if (orderItems.length) result.push({ id: cat.id, name: cat.name.trim(), items: orderItems });
    }

    return { menu: { categories: result, taxRate: catalog.taxRate }, catalog };
}
