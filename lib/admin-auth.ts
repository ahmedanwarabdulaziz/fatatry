// Server-only admin guard for server actions.
// Server actions can be called directly (not only from admin pages), so every action
// that changes data or exposes private data must call requireAdmin() first.

import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "./admin-session";

export async function isAdmin(): Promise<boolean> {
    return verifySessionToken(cookies().get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
    if (!(await isAdmin())) throw new Error("Unauthorized");
}
