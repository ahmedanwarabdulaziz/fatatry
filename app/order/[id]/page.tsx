import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Phone, Place } from "@mui/icons-material";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { adminDb } from "@/lib/firebase-admin";
import { formatCents } from "@/lib/order-types";
import { fullAddress, mapsUrl, phoneHref, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Your order | Elfatatry", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrderConfirmation({ params }: { params: { id: string } }) {
    if (!/^[A-Za-z0-9]{20}$/.test(params.id)) notFound();
    const doc = await adminDb.collection("orders").doc(params.id).get();
    if (!doc.exists) notFound();
    const o = doc.data()!;
    if (o.status !== "paid") notFound();

    const first = String(o.customer?.name || "").split(" ")[0];
    const lines: { name: string; variant: string; qty: number; unitCents: number; options: string[]; note: string }[] = o.lines || [];
    const total: number = o.totalCents ?? o.estimatedTotalCents;

    return (
        <>
            <SiteHeader />
            <main className="bg-background px-4 pb-20 pt-28 md:pt-32">
                <div className="mx-auto max-w-xl">
                    <div className="text-center">
                        <CheckCircle className="text-accent-gold" sx={{ fontSize: 56 }} />
                        <h1 className="mt-3 text-3xl font-extrabold text-main-text">Thank you{first ? `, ${first}` : ""}!</h1>
                        <p className="mt-2 text-muted-text">Your order is confirmed and on its way to our kitchen.</p>
                    </div>

                    <div className="mt-8 rounded-card border border-border bg-surface p-6">
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between"><dt className="text-muted-text">Order number</dt><dd className="font-extrabold text-main-text">{o.orderCode}</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-text">Pickup</dt><dd className="font-bold text-accent-gold">{o.pickup?.label}</dd></div>
                            <div className="flex justify-between gap-6"><dt className="text-muted-text">Where</dt><dd className="text-right text-main-text">{fullAddress}</dd></div>
                        </dl>
                        <hr className="my-5 border-border" />
                        <ul className="space-y-3">
                            {lines.map((l, i) => (
                                <li key={i} className="flex justify-between gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-main-text">{l.qty} × {l.name}{l.variant ? ` (${l.variant})` : ""}</p>
                                        {l.options?.length > 0 && <p className="text-muted-text">{l.options.join(", ")}</p>}
                                        {l.note && <p className="italic text-muted-text">“{l.note}”</p>}
                                    </div>
                                    <span className="shrink-0 text-main-text">{formatCents(l.unitCents * l.qty)}</span>
                                </li>
                            ))}
                        </ul>
                        <hr className="my-5 border-border" />
                        <div className="flex justify-between text-base font-extrabold text-main-text"><span>Total paid (incl. HST)</span><span>{formatCents(total)}</span></div>
                    </div>

                    <p className="mt-6 text-center text-sm text-muted-text">
                        Please come to the counter and give your name. Need to change something? Call us right away.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <a href={phoneHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent-gold px-6 font-bold text-background"><Phone fontSize="small" /> {siteConfig.phone}</a>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-6 font-bold text-main-text"><Place fontSize="small" /> Directions</a>
                        <Link href="/menu" className="inline-flex h-12 items-center justify-center px-4 font-bold text-accent-gold">Back to menu</Link>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
