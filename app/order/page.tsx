import type { Metadata } from "next";
import Link from "next/link";
import { ArrowForward, Phone } from "@mui/icons-material";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { phoneHref, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
    title: "Order Online | Elfatatry",
    description: "Order Elfatatry for pickup or delivery in Mississauga.",
};

// Phase 2 replaces this page with the online ordering flow.
export default function OrderPage() {
    return (
        <>
            <SiteHeader transparent />
            <main className="bg-background">
                <PageHero
                    eyebrow="Order Online"
                    title="Online ordering is coming soon."
                    subtitle="Pickup and delivery, straight from our kitchen. Until then, give us a call and we'll have it ready."
                    image="/images/site/dish-feteer.webp"
                    imagePosition="center 40%"
                />
                <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <a href={phoneHref} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent-gold px-8 font-bold text-background hover:bg-accent-gold-hover">
                            <Phone fontSize="small" /> Call {siteConfig.phone}
                        </a>
                        <Link href="/menu" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-border px-8 font-bold text-main-text hover:border-accent-gold hover:text-accent-gold">
                            Browse the menu <ArrowForward fontSize="small" />
                        </Link>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
