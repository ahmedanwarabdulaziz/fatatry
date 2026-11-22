// Signed admin session tokens. Uses Web Crypto so it works in both middleware (edge) and server actions (node).
// Token format: "<expiresAtMs>.<base64url HMAC-SHA256(expiresAtMs)>"

export const ADMIN_COOKIE = "elf_admin_session";
export const SESSION_HOURS = 12;

const encoder = new TextEncoder();

function getSecret(): string | null {
    const s = process.env.ADMIN_SESSION_SECRET;
    return s && s.length >= 32 ? s : null;
}

function toBase64Url(bytes: ArrayBuffer): string {
    let bin = "";
    new Uint8Array(bytes).forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(value: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

/** Constant-time string comparison */
export function safeEqual(a: string, b: string): boolean {
    const ab = encoder.encode(a);
    const bb = encoder.encode(b);
    let diff = ab.length ^ bb.length;
    for (let i = 0; i < Math.max(ab.length, bb.length); i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
    return diff === 0;
}

export async function createSessionToken(): Promise<string> {
    const secret = getSecret();
    if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured (min 32 characters)");
    const exp = String(Date.now() + SESSION_HOURS * 3600 * 1000);
    return `${exp}.${await sign(exp, secret)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
    const secret = getSecret();
    if (!secret || !token) return false;
    const [exp, sig] = token.split(".");
    if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
    return safeEqual(sig, await sign(exp, secret));
}
