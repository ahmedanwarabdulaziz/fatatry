// Server-side only (uses firebase-admin through the admin actions)
import { getCategories } from "@/app/admin/categories/actions";
import { getMenuItems, MenuItem } from "@/app/admin/menu-items/actions";
import type { Dish } from "./dishes";

// Dine-in menu items that belong to a dish page
export async function getItemsForDish(dish: Dish): Promise<MenuItem[]> {
    const [categories, items] = await Promise.all([getCategories(), getMenuItems()]);
    const dineIn = categories.filter((c) => (c.type || "dine-in") === "dine-in");
    const dineInIds = new Set(dineIn.map((c) => c.id));
    const wanted = new Set(
        dineIn
            .filter((c) => dish.match.categories?.some((n) => n.toLowerCase() === c.name.trim().toLowerCase()))
            .map((c) => c.id)
    );

    return items.filter(
        (item) =>
            dineInIds.has(item.categoryId) &&
            (wanted.has(item.categoryId) || (dish.match.items ? dish.match.items.test(item.name.trim()) : false))
    );
}

export function formatPrice(item: MenuItem): { label: string; from: boolean } {
    if (item.sizes && item.sizes.length > 0) {
        return { label: `$${Math.min(...item.sizes.map((s) => s.price)).toFixed(2)}`, from: true };
    }
    return { label: `$${item.price.toFixed(2)}`, from: false };
}
