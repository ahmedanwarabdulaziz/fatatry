export const IMAGE_WIDTHS = [128, 256, 384, 640, 828, 1080, 1600];

const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_DOMAIN;

// Rewrites a stored R2 URL to the cached, resized /img route. Other URLs are returned unchanged.
export function imageUrl(src: string | undefined, width: number): string {
    if (!src) return "";
    let key: string | undefined;
    if (R2_DOMAIN && src.startsWith(`${R2_DOMAIN}/`)) {
        key = src.slice(R2_DOMAIN.length + 1);
    } else {
        const match = src.match(/^https:\/\/pub-[a-z0-9]+\.r2\.dev\/(.+)$/);
        if (match) key = match[1];
    }
    if (!key) return src;
    return `/img/${key}?w=${width}`;
}
