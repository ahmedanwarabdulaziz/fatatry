'use server';

import { adminDb } from '@/lib/firebase-admin';
import { uploadFileToR2 } from '@/lib/storage-utils';
import { revalidatePath } from 'next/cache';

export interface SpecialOffer {
    id: string;
    headline: string;
    text: string;
    priceBefore: number;
    priceAfter: number;
    squareImage: string;
    isActive: boolean;
    order: number;
    createdAt?: string;
}

const COLLECTION = 'special_offers';

export async function getSpecialOffers(): Promise<SpecialOffer[]> {
    const snapshot = await adminDb.collection(COLLECTION).orderBy('order', 'asc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpecialOffer));
}

export async function getActiveOffers(limit: number = 3): Promise<SpecialOffer[]> {
    const snapshot = await adminDb
        .collection(COLLECTION)
        .get();

    const allOffers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpecialOffer));

    // Filter active offers, sort by order, and limit
    return allOffers
        .filter(offer => offer.isActive)
        .sort((a, b) => a.order - b.order)
        .slice(0, limit);
}

export async function saveSpecialOffer(formData: FormData) {
    const id = formData.get('id') as string;
    const headline = formData.get('headline') as string;
    const text = formData.get('text') as string;
    const priceBefore = parseFloat(formData.get('priceBefore') as string) || 0;
    const priceAfter = parseFloat(formData.get('priceAfter') as string) || 0;
    const isActive = formData.get('isActive') === 'true';

    const imageFile = formData.get('squareImageFile') as File;
    let squareImage = formData.get('existingSquareImage') as string || '';

    if (imageFile && imageFile.size > 0) {
        try {
            squareImage = await uploadFileToR2(imageFile, 'special-offers');
        } catch (error) {
            console.error("Failed to upload offer image:", error);
        }
    }

    const data: Partial<SpecialOffer> = {
        headline,
        text,
        priceBefore,
        priceAfter,
        squareImage,
        isActive,
    };

    if (id) {
        await adminDb.collection(COLLECTION).doc(id).update(data);
    } else {
        const snapshot = await adminDb.collection(COLLECTION).orderBy('order', 'desc').limit(1).get();
        const maxOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;

        await adminDb.collection(COLLECTION).add({
            ...data,
            order: maxOrder + 1,
            createdAt: new Date().toISOString(),
        });
    }

    revalidatePath('/admin/special-offers');
    revalidatePath('/');
}

export async function deleteSpecialOffer(id: string) {
    await adminDb.collection(COLLECTION).doc(id).delete();
    revalidatePath('/admin/special-offers');
    revalidatePath('/');
}

export async function reorderOffers(items: { id: string, order: number }[]) {
    const batch = adminDb.batch();
    items.forEach(({ id, order }) => {
        const ref = adminDb.collection(COLLECTION).doc(id);
        batch.update(ref, { order });
    });
    await batch.commit();
    revalidatePath('/admin/special-offers');
    revalidatePath('/');
}
