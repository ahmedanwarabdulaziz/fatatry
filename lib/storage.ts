import { S3Client } from "@aws-sdk/client-s3";

// Ensure Account ID is available or endpoint is correct
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

export const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || "",
    },
});

export const bucketName = process.env.CLOUDFLARE_BUCKET_NAME || "restaurant-menu";
