import type { Metadata } from "next";
import { ArrowForward, Email, Phone, Place, Schedule, Star } from "@mui/icons-material";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { fullAddress, mapsUrl, phoneHref, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
    title: "Contact & Hours | Elfatatry",
    description: "Address, opening hours and contact details for Elfatatry in Mississauga, Ontario.",
};

export default function ContactPage() {
    return (
        <>
            <SiteHeader transparent />
            <main className="bg-background">
                <PageHero
                    eyebrow="Contact"
                    title="Come visit us."
                    subtitle="Dine in, pick up, or call ahead. We'd love to feed you."
                    image="/images/site/interior-2.webp"
                />

                <section className="mx-auto grid max-w-6xl gap-5 px-4 py-20 md:grid-cols-2 md:px-6 md:py-24">
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-card border border-border bg-surface p-6 md:p-8 transition-colors hover:border-accent-gold/60">
                        <Place className="text-accent-gold" />
                        <h2 className="mt-4 text-xl font-extrabold text-main-text">Address</h2>
                        <p className="mt-2 text-base leading-relaxed text-muted-text">{fullAddress}</p>
                        <span className="mt-4 inline-flex items-center gap-1 font-bold text-accent-gold">Get directions <ArrowForward fontSize="small" /></span>
                    </a>

                    <div className="rounded-card border border-border bg-surface p-6 md:p-8">
                        <Schedule className="text-accent-gold" />
                        <h2 className="mt-4 text-xl font-extrabold text-main-text">Opening hours</h2>
                        <ul className="mt-3 space-y-2">
                            {siteConfig.hours.map((h) => (
                                <li key={h.days} className="flex justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
                                    <span className="text-muted-text">{h.days}</span>
                                    <span className="text-right font-semibold text-main-text">{h.time}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <a href={phoneHref} className="rounded-card border border-border bg-surface p-6 md:p-8 transition-colors hover:border-accent-gold/60">
                        <Phone className="text-accent-gold" />
                        <h2 className="mt-4 text-xl font-extrabold text-main-text">Phone</h2>
                        <p className="mt-2 text-lg font-bold text-main-text">{siteConfig.phone}</p>
                        <p className="mt-1 text-sm text-muted-text">Takeout orders and catering.</p>
                    </a>

                    {siteConfig.email ? (
                        <a href={`mailto:${siteConfig.email}`} className="rounded-card border border-border bg-surface p-6 md:p-8 transition-colors hover:border-accent-gold/60">
                            <Email className="text-accent-gold" />
                            <h2 className="mt-4 text-xl font-extrabold text-main-text">Email</h2>
                            <p className="mt-2 text-lg font-bold text-main-text break-all">{siteConfig.email}</p>
                            <p className="mt-1 text-sm text-muted-text">Catering inquiries and general questions.</p>
                        </a>
                    ) : (
                        <a href={siteConfig.google.mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-card border border-border bg-surface p-6 md:p-8 transition-colors hover:border-accent-gold/60">
                            <Star className="text-accent-gold" />
                            <h2 className="mt-4 text-xl font-extrabold text-main-text">Reviews</h2>
                            <p className="mt-2 text-lg font-bold text-main-text">{siteConfig.google.rating} ★ on Google</p>
                            <p className="mt-1 text-sm text-muted-text">Read what our guests say, or leave a review.</p>
                        </a>
                    )}
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
