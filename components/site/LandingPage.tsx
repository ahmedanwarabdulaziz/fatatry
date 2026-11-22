import Link from "next/link";
import Image from "next/image";
import { ArrowForward, Check, LocalCafe, Phone, Place } from "@mui/icons-material";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { dishes } from "@/lib/dishes";
import type { LandingPageContent } from "@/lib/landing-pages";
import { fullAddress, mapsUrl, phoneHref, siteConfig } from "@/lib/site-config";

function CtaButtons({ primary }: { primary: "call" | "directions" }) {
    const call = (
        <a key="call" href={phoneHref} data-cta="call"
            className={`inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 font-bold active:scale-[0.98] ${
                primary === "call" ? "bg-accent-gold text-background hover:bg-accent-gold-hover" : "border border-main-text/30 text-main-text hover:border-accent-gold hover:text-accent-gold"
            }`}>
            <Phone fontSize="small" /> Call {siteConfig.phone}
        </a>
    );
    const directions = (
        <a key="directions" href={mapsUrl} target="_blank" rel="noopener noreferrer" data-cta="directions"
            className={`inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 font-bold active:scale-[0.98] ${
                primary === "directions" ? "bg-accent-gold text-background hover:bg-accent-gold-hover" : "border border-main-text/30 text-main-text hover:border-accent-gold hover:text-accent-gold"
            }`}>
            <Place fontSize="small" /> Get directions
        </a>
    );
    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            {primary === "call" ? [call, directions] : [directions, call]}
        </div>
    );
}

export default function LandingPage({ page }: { page: LandingPageContent }) {
    const featured = page.dishSlugs.map((s) => dishes.find((d) => d.slug === s)).filter((d) => d !== undefined);
    const offer = siteConfig.newGuestOffer;

    return (
        <>
            <SiteHeader transparent />
            <main className="bg-background">
                {/* Hero */}
                <section className="relative flex min-h-[100svh] items-end overflow-hidden md:min-h-[88vh]">
                    <Image src={page.heroImage} alt="" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: page.heroImagePosition || "center" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-background/25" />
                    <div className="absolute inset-0 hidden bg-gradient-to-r from-background/90 via-background/50 to-transparent md:block" />
                    <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-28 md:px-6 md:pb-20">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">{page.eyebrow}</p>
                        <h1 className="mt-4 max-w-3xl text-[2.5rem] font-extrabold leading-[1.04] tracking-tight text-main-text sm:text-6xl">
                            {page.headline} <span className="text-accent-gold">{page.highlight}</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-main-text/85 md:text-lg">{page.subheadline}</p>

                        {page.showOffer && (
                            <div className="mt-6 inline-flex max-w-xl items-start gap-3 rounded-card border border-accent-gold/50 bg-background/70 p-4 backdrop-blur-md">
                                <LocalCafe className="mt-0.5 shrink-0 text-accent-gold" />
                                <div>
                                    <p className="font-bold text-main-text">{offer.title}</p>
                                    <p className="mt-0.5 text-sm text-main-text/80">Show this page when you order.</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-7">
                            <CtaButtons primary={page.primaryCta} />
                        </div>
                        <a href={siteConfig.google.mapsUrl} target="_blank" rel="noopener noreferrer"
                            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-main-text/90 hover:text-accent-gold">
                            <span className="text-accent-gold" aria-hidden>★★★★★</span>
                            Rated {siteConfig.google.rating} on Google
                        </a>
                    </div>
                </section>

                {/* Reasons */}
                <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
                    <h2 className="text-3xl font-extrabold tracking-tight text-main-text md:text-5xl">{page.reasonsTitle}</h2>
                    <div className="mt-10 grid gap-4 sm:grid-cols-2 md:gap-5">
                        {page.reasons.map((r) => (
                            <div key={r.title} className="flex gap-4 rounded-card border border-border bg-surface p-6">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-gold/15 text-accent-gold">
                                    <Check fontSize="small" />
                                </span>
                                <div>
                                    <h3 className="text-lg font-extrabold text-main-text">{r.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-text md:text-base">{r.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Featured dishes */}
                <section className="border-y border-border bg-surface/40">
                    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
                        <h2 className="text-3xl font-extrabold tracking-tight text-main-text md:text-5xl">{page.dishesTitle}</h2>
                        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                            {featured.map((d) => (
                                <Link key={d.slug} href={`/dishes/${d.slug}`} className="group overflow-hidden rounded-card border border-border bg-surface active:scale-[0.99]">
                                    <div className="relative aspect-square overflow-hidden">
                                        <Image src={d.image} alt={d.name} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-500 md:group-hover:scale-105" />
                                        {d.badge && (
                                            <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-bold text-accent-gold">{d.badge}</span>
                                        )}
                                    </div>
                                    <div className="p-3 md:p-4">
                                        <h3 className="font-extrabold leading-tight text-main-text md:text-lg">{d.name}</h3>
                                        <p className="mt-1 text-xs leading-snug text-muted-text md:text-sm">{d.tagline}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Link href="/menu" className="mt-8 inline-flex items-center gap-2 font-bold text-accent-gold hover:text-accent-gold-hover">
                            See the full menu with prices <ArrowForward fontSize="small" />
                        </Link>
                    </div>
                </section>

                {/* Steps (catering) */}
                {page.steps && (
                    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
                        <h2 className="text-3xl font-extrabold tracking-tight text-main-text md:text-5xl">How it works</h2>
                        <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
                            {page.steps.map((s, i) => (
                                <li key={s.title} className="rounded-card border border-border bg-surface p-6">
                                    <span className="text-3xl font-extrabold text-accent-gold">0{i + 1}</span>
                                    <h3 className="mt-3 text-lg font-extrabold text-main-text">{s.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-text md:text-base">{s.text}</p>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                {/* Gallery */}
                {page.gallery && (
                    <section className={`mx-auto max-w-6xl px-4 md:px-6 ${page.steps ? "pb-16 md:pb-24" : "py-16 md:py-24"}`}>
                        <div className="grid grid-cols-2 gap-3 md:gap-5">
                            {page.gallery.map((g) => (
                                <div key={g.src} className="relative aspect-[4/3] overflow-hidden rounded-card">
                                    <Image src={g.src} alt={g.alt} fill sizes="50vw" className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Final CTA */}
                <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-28">
                    <div className="rounded-card border border-accent-gold/40 bg-surface p-8 md:p-12">
                        <h2 className="text-3xl font-extrabold tracking-tight text-main-text md:text-4xl">{page.ctaTitle}</h2>
                        <p className="mt-3 max-w-xl text-base text-muted-text md:text-lg">{page.ctaText}</p>
                        {page.showOffer && (
                            <p className="mt-4 flex items-start gap-2 text-sm text-main-text/85">
                                <LocalCafe fontSize="small" className="text-accent-gold" />
                                <span>{offer.text} <span className="text-muted-text">({offer.terms})</span></span>
                            </p>
                        )}
                        <div className="mt-8">
                            <CtaButtons primary={page.primaryCta} />
                        </div>
                        <p className="mt-6 text-sm text-muted-text">
                            {fullAddress} · Open Tuesday to Sunday
                        </p>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
