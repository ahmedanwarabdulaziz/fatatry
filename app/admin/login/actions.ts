'use server';

import { cookies } from 'next/headers';
import { ADMIN_COOKIE, SESSION_HOURS, createSessionToken, safeEqual } from '@/lib/admin-session';

export async function loginAdmin(password: string): Promise<{ ok: boolean; error?: string }> {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || !process.env.ADMIN_SESSION_SECRET) {
        return { ok: false, error: 'Admin login is not configured on the server.' };
    }
    if (typeof password !== 'string' || !safeEqual(password, expected)) {
        // Slow down guessing
        await new Promise((r) => setTimeout(r, 1000));
        return { ok: false, error: 'Invalid password' };
    }
    cookies().set(ADMIN_COOKIE, await createSessionToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_HOURS * 3600,
    });
    return { ok: true };
}

export async function logoutAdmin() {
    cookies().delete(ADMIN_COOKIE);
}
