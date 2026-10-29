import { GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { r2, bucketName } from "@/lib/storage";
import { IMAGE_WIDTHS } from "@/lib/image-url";

export const runtime = "nodejs";

// Serves R2 images via the S3 API (avoids the rate-limited r2.dev URL), resized to WebP.
// Keys are unique per upload, so responses are cached for a year at Vercel's CDN.
export async function GET(request: Request, { params }: { params: { key: string[] } }) {
    const key = params.key.map(decodeURIComponent).join("/");
    if (!/^[\w\-./]+$/.test(key) || key.includes("..")) {
        return new Response("Invalid key", { status: 400 });
    }

    // Only allow known widths so the cache can't be flooded with arbitrary sizes
    const requested = Number(new URL(request.url).searchParams.get("w")) || 640;
    const width = IMAGE_WIDTHS.find(w => w >= requested) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];

    let original: Uint8Array;
    try {
        const object = await r2.send(new GetObjectCommand({ Bucket: bucketName, Key: key }));
        original = await object.Body!.transformToByteArray();
    } catch (e: any) {
        const status = e?.$metadata?.httpStatusCode === 404 || e?.name === "NoSuchKey" ? 404 : 502;
        return new Response("Image not found", { status, headers: { "Cache-Control": "public, max-age=60" } });
    }

    let body: Buffer;
    let contentType = "image/webp";
    try {
        body = await sharp(original)
            .rotate()
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();
    } catch {
        // Not something sharp can process (e.g. SVG/GIF): pass the original through
        body = Buffer.from(original);
        contentType = "application/octet-stream";
        const ext = key.split(".").pop()?.toLowerCase();
        if (ext === "svg") contentType = "image/svg+xml";
        else if (ext === "gif") contentType = "image/gif";
    }

    return new Response(new Uint8Array(body), {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
        },
    });
}
