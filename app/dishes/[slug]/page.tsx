import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowForward, Check, Phone, Place } from "@mui/icons-material";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { dishes, getDish } from "@/lib/dishes";
import { formatPrice, getItemsForDish } from "@/lib/menu-data";
import { imageUrl } from "@/lib/image-url";
import { mapsUrl, phoneHref, siteConfig } from "@/lib/site-config";

// Menu items are re-read from the admin data at most every 5 minutes
export const revalidate = 300;

export function generateStaticParams() {
    return dishes.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    const dish = getDish(params.slug);
    if (!dish) return {};
    return {
        title: dish.metaTitle,
        description: dish.metaDescription,
        alternates: { canonical: `/dishes/${dish.slug}` },
        openGraph: { title: dish.metaTitle, description: dish.metaDescription, images: [dish.image] },
    };
}

export default async function DishPage({ params }: { params: { slug: string } }) {
    const dish = getDish(params.slug);
    if (!dish) notFound();

    const items = await getItemsForDish(dish);
    const others = dishes.filter((d) => d.slug !== dish.slug);

    return (
        <>
            <SiteHeader transparent />
            <main className="bg-background">
                {/* Hero */}
                <section className="relative flex min-h-[62vh] items-end overflow-hidden pt-20 md:min-h-[70vh]">
                    <Image src={dish.image} alt={dish.name} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: dish.imagePosition || "center" }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />
                    <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 md:px-6 md:pb-16">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="font-arabic text-2xl font-bold text-accent-gold md:text-3xl" lang="ar" dir="rtl">{dish.nameAr}</span>
                            {dish.badge && (
                                <span className="rounded-full bg-accent-gold px-3 py-1 text-xs font-bold text-background">{dish.badge}</span>
                            )}
                        </div>
                        <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-main-text md:text-6xl">{dish.name}</h1>
                        <p className="mt-3 max-w-xl text-lg text-main-text/85 md:text-xl">{dish.tagline}</p>
                    </div>
                </section>

                {/* About the dish */}
                <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.4fr_1fr] md:gap-16 md:px-6 md:py-24">
                    <div className="space-y-5">
                        {dish.intro.map((p, i) => (
                            <p key={i} className="text-base leading-relaxed text-muted-text md:text-lg">{p}</p>
                        ))}
                    </div>
                    <ul className="space-y-3 self-start rounded-card border border-border bg-surface p-6">
                        {dish.facts.map((f) => (
                            <li key={f} className="flex gap-3 text-sm text-main-text/90 md:text-base">
                                <Check className="shrink-0 text-accent-gold" fontSize="small" />
                                {f}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Live menu items */}
                {items.length > 0 && (
                    <section className="border-y border-border bg-surface/40">
                        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">On Our Menu</p>
                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-main-text md:text-4xl">Choose your {dish.name.toLowerCase().includes("feteer") ? "feteer" : "favourite"}</h2>
                            <div className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4">
                                {items.map((item) => {
                                    const price = formatPrice(item);
                                    return (
                                        <article key={item.id} className="flex gap-4 rounded-card border border-border bg-surface p-3">
                                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-surface-elevated md:h-24 md:w-24">
                                                {item.squareImage ? (
                                                    <Image src={imageUrl(item.squareImage, 256)} alt={item.name} fill sizes="96px" className="object-cover" />
                                                ) : (
                                                    <Image src={dish.image} alt="" fill sizes="96px" className="object-cover opacity-60" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 py-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="font-bold leading-tight text-main-text">{item.name}</h3>
                                                    <span className="shrink-0 text-right font-bold text-accent-gold">
                                                        {price.from && <span className="block text-[10px] uppercase tracking-wider text-muted-text">From</span>}
                                                        {price.label}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-text">{item.description}</p>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Visit CTA */}
                <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
                    <div className="rounded-card border border-accent-gold/40 bg-surface p-8 md:p-12">
                        <h2 className="text-3xl font-extrabold tracking-tight text-main-text md:text-4xl">Come try it in Streetsville.</h2>
                        <p className="mt-3 max-w-xl text-base text-muted-text md:text-lg">
                            {siteConfig.address.street}, {siteConfig.address.city}. Dine in or call ahead for takeout.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a href={phoneHref} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent-gold px-8 font-bold text-background hover:bg-accent-gold-hover">
                                <Phone fontSize="small" /> {siteConfig.phone}
                            </a>
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-border px-8 font-bold text-main-text hover:border-accent-gold hover:text-accent-gold">
                                <Place fontSize="small" /> Get directions
                            </a>
                            <Link href="/menu" className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-4 font-bold text-accent-gold hover:text-accent-gold-hover">
                                Full menu <ArrowForward fontSize="small" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Other dishes */}
                <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-28">
                    <h2 className="text-2xl font-extrabold text-main-text md:text-3xl">More Egyptian favourites</h2>
                    <div className="no-scrollbar -mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
                        {others.map((d) => (
                            <Link key={d.slug} href={`/dishes/${d.slug}`} className="group relative aspect-[3/4] w-[42%] shrink-0 snap-start overflow-hidden rounded-card md:w-auto">
                                <Image src={d.image} alt={d.name} fill sizes="(min-width: 768px) 25vw, 42vw" className="object-cover transition-transform duration-500 md:group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                                    <p className="font-arabic text-sm font-bold text-accent-gold" lang="ar" dir="rtl">{d.nameAr}</p>
                                    <h3 className="text-base font-extrabold text-main-text md:text-lg">{d.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
