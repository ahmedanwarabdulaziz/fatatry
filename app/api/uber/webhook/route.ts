import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyWebhookSignature } from "@/lib/uber";

// Receives delivery status updates from Uber Direct.
// Set the URL in the Uber Direct dashboard (Developer > Webhooks) to https://<your-domain>/api/uber/webhook
// and put its signing key in UBER_WEBHOOK_SIGNING_KEY.

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    // The signature covers the exact raw body, so read it as text before parsing
    const raw = await req.text();
    const signature = req.headers.get("x-uber-signature") || req.headers.get("x-postmates-signature");
    if (!verifyWebhookSignature(raw, signature)) {
        return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    let event: any;
    try {
        event = JSON.parse(raw);
    } catch {
        return NextResponse.json({ error: "bad json" }, { status: 400 });
    }

    // We only care about delivery status changes; acknowledge everything else
    if (event?.kind !== "event.delivery_status" || !event?.data) return NextResponse.json({ ok: true });

    const d = event.data;
    const orders = adminDb.collection("orders");
    let ref = null as FirebaseFirestore.DocumentReference | null;

    // external_id is our order id (set when the delivery is created)
    if (typeof d.external_id === "string" && /^[A-Za-z0-9]{20}$/.test(d.external_id)) {
        const doc = await orders.doc(d.external_id).get();
        if (doc.exists) ref = doc.ref;
    }
    if (!ref && d.id) {
        const q = await orders.where("delivery.uberDeliveryId", "==", d.id).limit(1).get();
        if (!q.empty) ref = q.docs[0].ref;
    }
    if (!ref) return NextResponse.json({ ok: true }); // not one of ours (or not saved yet): nothing to update

    const status = String(d.status || event.status || "");
    const update: Record<string, unknown> = {
        "delivery.status": status,
        "delivery.updatedAt": new Date().toISOString(),
    };
    if (d.tracking_url) update["delivery.trackingUrl"] = String(d.tracking_url);
    if (d.id) update["delivery.uberDeliveryId"] = String(d.id);
    if (d.courier?.name) {
        update["delivery.courier"] = {
            name: String(d.courier.name),
            vehicle: [d.courier.vehicle_color, d.courier.vehicle_make, d.courier.vehicle_model].filter(Boolean).join(" "),
        };
    }
    if (status === "delivered") update["fulfilment"] = "picked-up"; // reuse the staff status: done
    if (status === "canceled" || status === "returned") update["delivery.problem"] = status;

    await ref.update(update);
    return NextResponse.json({ ok: true });
}
