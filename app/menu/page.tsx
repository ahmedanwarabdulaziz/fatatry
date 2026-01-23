import { getCategories } from "../admin/categories/actions";
import { getMenuItems } from "../admin/menu-items/actions";
import MenuClient from "./MenuClient";

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
    const [categories, items] = await Promise.all([
        getCategories(),
        getMenuItems()
    ]);

    // Ensure we have some categories if empty to prevent UI breakage
    const safeCategories = categories.length > 0 ? categories : [];

    return <MenuClient categories={safeCategories} items={items} />;
}
