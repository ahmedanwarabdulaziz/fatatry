import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowForward, Email, Phone } from "@mui/icons-material";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { phoneHref, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
    title: "Catering | Elfatatry",
    description: "Egyptian catering in Mississauga for family gatherings, offices and events. Full trays of feteer, grills, rice and home dishes.",
};

const occasions = [
    { title: "Family gatherings", text: "Birthdays, Eid, weekend dinners and get-togethers." },
    { title: "Office lunches", text: "Easy, generous trays your whole team will enjoy." },
    { title: "Events & celebrations", text: "Engagements, parties and community events, any size." },
];

const steps = [
    { n: "01", title: "Tell us about your event", text: "Date, number of guests, budget and any dishes you have in mind." },
    { n: "02", title: "We build your menu", text: "We suggest a spread that fits your guests and budget." },
    { n: "03", title: "Ready on the day", text: "Fresh trays, prepared on the day and ready to serve." },
];

export default function CateringPage() {
    const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent("Catering inquiry")}`;

    return (
        <>
            <SiteHeader transparent />
            <main className="bg-background">
                <PageHero
                    eyebrow="Catering"
                    title="Any gathering, any size."
                    subtitle="Full trays of Egyptian favourites, prepared fresh and made to share."
                    image="/images/site/catering-spread.webp"
                    imagePosition="center 55%"
                />

                <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
                    <div className="grid gap-5 md:grid-cols-3">
                        {occasions.map((o) => (
                            <div key={o.title} className="rounded-card border border-border bg-surface p-6 md:p-8">
                                <h2 className="text-xl font-extrabold text-main-text">{o.title}</h2>
                                <p className="mt-3 text-sm leading-relaxed text-muted-text md:text-base">{o.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="border-y border-border bg-surface/40">
                    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:gap-16 md:px-6 md:py-28">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">How It Works</p>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-main-text md:text-5xl">Simple from start to table.</h2>
                            <ol className="mt-8 space-y-6">
                                {steps.map((s) => (
                                    <li key={s.n} className="flex gap-5">
                                        <span className="text-2xl font-extrabold text-accent-gold">{s.n}</span>
                                        <div>
                                            <h3 className="text-lg font-extrabold text-main-text">{s.title}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-muted-text md:text-base">{s.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-card">
                                <Image src="/images/site/catering-event.webp" alt="Guests at an event catered by Elfatatry" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                            </div>
                            <div className="relative aspect-square overflow-hidden rounded-card">
                                <Image src="/images/site/catering-buffet.webp" alt="Catering buffet trays" fill sizes="25vw" className="object-cover" />
                            </div>
                            <div className="relative aspect-square overflow-hidden rounded-card">
                                <Image src="/images/site/dish-grill.webp" alt="Grill platter" fill sizes="25vw" className="object-cover" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
                    <div className="rounded-card border border-accent-gold/40 bg-surface p-8 md:p-14">
                        <h2 className="text-3xl font-extrabold tracking-tight text-main-text md:text-4xl">Planning something?</h2>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-text md:text-lg">
                            Call us with your date and number of guests and we&apos;ll put together a menu for you.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a href={phoneHref} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent-gold px-8 font-bold text-background hover:bg-accent-gold-hover">
                                <Phone fontSize="small" /> {siteConfig.phone}
                            </a>
                            {siteConfig.email && (
                                <a href={mailto} className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-border px-8 font-bold text-main-text hover:border-accent-gold hover:text-accent-gold">
                                    <Email fontSize="small" /> Email us
                                </a>
                            )}
                            <Link href="/menu" className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-4 font-bold text-accent-gold hover:text-accent-gold-hover">
                                See catering menu <ArrowForward fontSize="small" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
