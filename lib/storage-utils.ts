import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, bucketName } from "./storage";
import { v4 as uuidv4 } from "uuid";

export async function uploadFileToR2(file: File, folder: string): Promise<string> {
    const extension = file.name.split(".").pop();
    const filename = `${folder}/${uuidv4()}.${extension}`;

    // Convert File to Buffer/ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await r2.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
            // ACL: "public-read", // R2 doesn't always support ACLs depending on config, usually handled by public access settings
        })
    );

    // Assuming a public domain or R2.dev URL is configured.
    // Ideally user provided a public URL domain for R2. 
    // For now, we'll construct a standard R2 URL structure or use a placeholder if domain is missing.
    // Using a placeholder public domain variable if available, else constructing raw R2 link (which might be private).

    // Note: The user didn't provide a PUBLIC_ASSETS_URL in the variables, so we will return the key 
    // and assume we might need a presigned URL or public domain later. 
    // However, usually for websites we want a public CDN URL.
    // For this step, I'll return the relative path (Key) and we can prepend the domain in the UI or config.
    // Actually, let's return a Full URL if we can guess it, otherwise just the Key.

    const domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
    return domain ? `${domain}/${filename}` : filename;
}
