'use server';

import { adminDb } from '@/lib/firebase-admin';
import { uploadFileToR2 } from '@/lib/storage-utils';
import { revalidatePath } from 'next/cache';
import { getCategories } from '../categories/actions'; // Reuse to get category names if needed

export interface ServingDetails {
    weightGrams?: number;
    pieceCount?: number;
    skewerCount?: number;
}

export interface MenuItemSize {
    name: string;
    price: number;
    servingDetails: ServingDetails;
}

export interface MenuItemAddon {
    name: string;
    price: number;
}

export interface MenuItem {
    id: string;
    name: string;
    categoryId: string;
    description?: string;
    price: number;
    isFeatured: boolean;
    heroImage: string;
    squareImage: string;
    servingDetails: ServingDetails;
    sizes?: MenuItemSize[];
    addons?: MenuItemAddon[];
    order: number;
}

const COLLECTION = 'menu_items';

export async function getMenuItems(): Promise<MenuItem[]> {
    const snapshot = await adminDb.collection(COLLECTION).orderBy('order', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
}

export async function saveMenuItem(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string) || 0;
    const isFeatured = formData.get('isFeatured') === 'true';

    // Serving Details
    const weightGrams = formData.get('weightGrams') ? Number(formData.get('weightGrams')) : undefined;
    const pieceCount = formData.get('pieceCount') ? Number(formData.get('pieceCount')) : undefined;
    const skewerCount = formData.get('skewerCount') ? Number(formData.get('skewerCount')) : undefined;

    // Sizes parsing
    let sizes: MenuItemSize[] = [];
    const sizesJson = formData.get('sizes') as string;
    if (sizesJson) {
        try {
            sizes = JSON.parse(sizesJson);
        } catch (e) {
            console.error("Failed to parse sizes JSON", e);
        }
    }

    // Addons parsing
    let addons: MenuItemAddon[] = [];
    const addonsJson = formData.get('addons') as string;
    if (addonsJson) {
        try {
            addons = JSON.parse(addonsJson);
        } catch (e) {
            console.error("Failed to parse addons JSON", e);
        }
    }

    const heroFile = formData.get('heroImageFile') as File;
    const squareFile = formData.get('squareImageFile') as File;

    let heroImage = formData.get('existingHeroImage') as string || '';
    let squareImage = formData.get('existingSquareImage') as string || '';

    if (heroFile && heroFile.size > 0) {
        try {
            heroImage = await uploadFileToR2(heroFile, 'menu-items');
        } catch (e) {
            console.error("Hero upload failed", e);
        }
    }

    if (squareFile && squareFile.size > 0) {
        try {
            squareImage = await uploadFileToR2(squareFile, 'menu-items');
        } catch (e) {
            console.error("Square upload failed", e);
        }
    }

    const data: Partial<MenuItem> = {
        name,
        categoryId,
        description,
        price,
        isFeatured,
        heroImage,
        squareImage,
        servingDetails: {
            weightGrams,
            pieceCount,
            skewerCount
        },
        sizes,
        addons
    };

    // Clean undefined serving details
    Object.keys(data.servingDetails!).forEach(key =>
        (data.servingDetails as any)[key] === undefined && delete (data.servingDetails as any)[key]
    );

    if (id) {
        await adminDb.collection(COLLECTION).doc(id).update(data);
    } else {
        // Get max order
        const snapshot = await adminDb.collection(COLLECTION).orderBy('order', 'desc').limit(1).get();
        const maxOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;

        await adminDb.collection(COLLECTION).add({
            ...data,
            order: maxOrder + 1,
            createdAt: new Date().toISOString(),
        });
    }

    revalidatePath('/admin/menu-items');
}

export async function deleteMenuItem(id: string) {
    await adminDb.collection(COLLECTION).doc(id).delete();
    revalidatePath('/admin/menu-items');
}

export async function reorderMenuItems(items: { id: string, order: number }[]) {
    const batch = adminDb.batch();
    items.forEach(({ id, order }) => {
        const ref = adminDb.collection(COLLECTION).doc(id);
        batch.update(ref, { order });
    });
    await batch.commit();
    revalidatePath('/admin/menu-items');
}
