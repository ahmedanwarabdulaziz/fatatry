'use server';

import { adminDb } from '@/lib/firebase-admin';
import { uploadFileToR2 } from '@/lib/storage-utils';
import { revalidatePath } from 'next/cache';

export interface Category {
    id: string;
    name: string;
    description?: string;
    heroImage: string;
    squareImage: string;
    isFeatured: boolean;
    order: number;
}

const COLLECTION = 'categories';

export async function getCategories(): Promise<Category[]> {
    const snapshot = await adminDb.collection(COLLECTION).orderBy('order', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function saveCategory(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isFeatured = formData.get('isFeatured') === 'true';

    const heroFile = formData.get('heroImageFile') as File;
    const squareFile = formData.get('squareImageFile') as File;

    // Existing images if not updating
    let heroImage = formData.get('existingHeroImage') as string || '';
    let squareImage = formData.get('existingSquareImage') as string || '';

    if (heroFile && heroFile.size > 0) {
        try {
            heroImage = await uploadFileToR2(heroFile, 'categories');
        } catch (error) {
            console.error("Failed to upload Hero Image:", error);
            // Fallback or just ignore so text data saves
        }
    }

    if (squareFile && squareFile.size > 0) {
        try {
            squareImage = await uploadFileToR2(squareFile, 'categories');
        } catch (error) {
            console.error("Failed to upload Square Image:", error);
        }
    }

    const data: Partial<Category> = {
        name,
        description,
        isFeatured,
        heroImage,
        squareImage,
    };

    if (id) {
        await adminDb.collection(COLLECTION).doc(id).update(data);
    } else {
        // Get max order to append to end
        const snapshot = await adminDb.collection(COLLECTION).orderBy('order', 'desc').limit(1).get();
        const maxOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;

        await adminDb.collection(COLLECTION).add({
            ...data,
            order: maxOrder + 1,
            createdAt: new Date().toISOString(),
        });
    }

    revalidatePath('/admin/categories');
}

export async function deleteCategory(id: string) {
    await adminDb.collection(COLLECTION).doc(id).delete();
    revalidatePath('/admin/categories');
}

export async function reorderCategories(items: { id: string, order: number }[]) {
    const batch = adminDb.batch();

    items.forEach(({ id, order }) => {
        const ref = adminDb.collection(COLLECTION).doc(id);
        batch.update(ref, { order });
    });

    await batch.commit();
    revalidatePath('/admin/categories');
}
