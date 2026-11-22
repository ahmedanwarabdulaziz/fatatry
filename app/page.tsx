import Link from "next/link";
import Image from "next/image";
import { ArrowForward, Phone, Place, Schedule } from "@mui/icons-material";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getHomepageSettings } from "./admin/settings/actions";
import { imageUrl } from "@/lib/image-url";
import { fullAddress, mapsUrl, phoneHref, siteConfig } from "@/lib/site-config";

// Plain-English intros for guests trying Egyptian food for the first time (dishes taken from the live menu)
const starterDishes = [
    {
        title: "Koshary",
        href: "/dishes/koshary",
        tag: "Vegetarian",
        text: "Egypt's favourite comfort food. Rice, lentils and pasta topped with crispy onions and a tangy tomato sauce.",
        image: "/images/site/dish-koshari.webp",
    },
    {
        title: "Hawawshi",
        href: "/dishes/hawawshi",
        tag: "Street food",
        text: "Seasoned ground beef baked inside Egyptian bread until crispy. Think of it as Egypt's take on the burger.",
        image: "/images/site/dish-hawawshi.webp",
    },
    {
        title: "Falafel (Ta'ameya)",
        href: "/dishes/falafel",
        tag: "Vegetarian",
        text: "Egyptian-style falafel made with fava beans: herby, green inside and extra crisp outside.",
        image: "/images/site/dish-falafel.webp",
    },
    {
        title: "Grills",
        href: "/dishes/grills",
        tag: "Crowd favourite",
        text: "Kofta, shish tawouk and lamb chops, served with rice or fries, salad and tahini.",
        image: "/images/site/dish-grill.webp",
    },
    {
        title: "Molokhya",
        href: "/dishes/molokhya",
        tag: "Home cooking",
        text: "A silky, garlicky green stew that every Egyptian grew up with. Best with rice or bread.",
        image: "/images/site/dish-molokhya.webp",
    },
    {
        title: "Desserts & Drinks",
        href: "/menu",
        tag: "Save room",
        text: "Om Ali bread pudding, rice pudding, fresh mango and guava juice, Turkish coffee and more.",
        image: "/images/site/dish-desserts.webp",
    },
];

const feteerStyles = [
    {
        title: "Savoury",
        href: "/dishes/savoury-feteer",
        text: "Filled and baked until golden. A full meal, perfect for sharing.",
        examples: ["Beef", "Mixed Cheese", "Chicken Strips", "Elfatatry Special"],
        image: "/images/site/feteer-savoury.webp",
    },
    {
        title: "Sweet",
        href: "/dishes/sweet-feteer",
        text: "Warm, flaky and indulgent. Dessert, or a treat with coffee.",
        examples: ["Nutella", "Lotus", "Custard & Sugar", "Dubai Chocolate"],
        image: "/images/site/feteer-sweet.webp",
    },
];

const highlights = [
    "Vegetarian options",
    "Egyptian breakfast",
    "Kids meal",
    "Fresh juices",
    "Catering trays",
];

export default async function Home() {
    const settings = await getHomepageSettings();
    const offers = [
        { image: settings?.topAdImage, title: settings?.topAdTitle, desc: settings?.topAdDesc },
        { image: settings?.middleAdImage, title: settings?.middleAdTitle, desc: settings?.middleAdDesc },
        { image: settings?.bottomAdImage, title: settings?.bottomAdTitle, desc: settings?.bottomAdDesc },
    ].filter((o) => o.image);

    const primary = siteConfig.orderingEnabled
        ? { href: "/order", label: "Order Online" }
        : { href: "/menu", label: "View Menu" };
    const secondary = siteConfig.orderingEnabled
        ? { href: "/menu", label: "View Menu" }
        : { href: "/catering", label: "Catering" };

    return (
        <>
            <SiteHeader transparent />
            <main className="bg-background">
                {/* Hero */}
                <section className="relative flex min-h-[100svh] items-end overflow-hidden">
                    <Image
                        src="/images/site/hero.webp"
                        alt="Freshly baked feteer being pulled apart"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-[center_60%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/30" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent hidden md:block" />

                    <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-28 md:px-6 md:pb-24">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent-gold">
                            Egyptian Kitchen · Streetsville
                        </p>
                        <h1 className="mt-4 max-w-3xl text-[2.5rem] font-extrabold leading-[1.02] tracking-tight text-main-text sm:text-6xl md:text-7xl">
                            Egyptian comfort food, <span className="text-accent-gold">fresh from our oven.</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-main-text/85 md:text-lg">
                            Flaky, hand-stretched feteer, savoury or sweet, plus koshary, grills and the home-style dishes Egypt loves.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={primary.href}
                                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent-gold px-8 text-base font-bold text-background transition-colors hover:bg-accent-gold-hover active:scale-[0.98]"
                            >
                                {primary.label} <ArrowForward fontSize="small" />
                            </Link>
                            <Link
                                href={secondary.href}
                                className="inline-flex h-14 items-center justify-center rounded-full border border-main-text/30 bg-background/30 px-8 text-base font-bold text-main-text backdrop-blur-sm transition-colors hover:border-accent-gold hover:text-accent-gold active:scale-[0.98]"
                            >
                                {secondary.label}
                            </Link>
                        </div>
                        <a
                            href={siteConfig.google.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-main-text/90 hover:text-accent-gold"
                        >
                            <span className="text-accent-gold tracking-tight" aria-hidden>★★★★★</span>
                            Rated {siteConfig.google.rating} on Google
                        </a>
                        <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-main-text/75">
                            {(siteConfig.orderingEnabled
                                ? ["Dine-in", "Pickup", "Delivery", "Catering"]
                                : ["Dine-in", "Takeout", "Catering"]
                            ).map((s, i) => (
                                <li key={s} className="flex items-center gap-3">
                                    {i > 0 && <span aria-hidden className="text-accent-gold">•</span>}
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Feteer explained */}
                <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">Our Signature</p>
                        <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-main-text md:text-5xl">
                            What is feteer?
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-muted-text md:text-lg">
                            Picture a flaky, buttery pastry, part croissant, part pie. We stretch the dough by hand until it&apos;s paper-thin,
                            fold it into dozens of layers, fill it and bake it fresh to order. It&apos;s the dish we&apos;re named after.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
                        {feteerStyles.map((style) => (
                            <Link
                                key={style.title}
                                href={style.href}
                                className="group relative flex min-h-[340px] items-end overflow-hidden rounded-card active:scale-[0.99] transition-transform md:min-h-[420px]"
                            >
                                <Image src={style.image} alt={`${style.title} feteer`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 md:group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="relative p-6 md:p-8">
                                    <h3 className="text-2xl font-extrabold text-main-text md:text-3xl">{style.title} feteer</h3>
                                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-main-text/80 md:text-base">{style.text}</p>
                                    <ul className="mt-4 flex flex-wrap gap-2">
                                        {style.examples.map((ex) => (
                                            <li key={ex} className="rounded-full border border-main-text/25 bg-black/30 px-3 py-1 text-xs font-semibold text-main-text/90 backdrop-blur-sm">
                                                {ex}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <Link href="/dishes/feteer-meshaltet" className="mt-6 inline-flex items-center gap-2 font-bold text-accent-gold hover:text-accent-gold-hover">
                        Or start with the original: Feteer Meshaltet <ArrowForward fontSize="small" />
                    </Link>
                </section>

                {/* Start here: Egyptian food for newcomers */}
                <section className="border-y border-border bg-surface/40">
                    <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">Beyond Feteer</p>
                                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-main-text md:text-5xl">
                                    New to Egyptian food? Start here.
                                </h2>
                                <p className="mt-4 text-base leading-relaxed text-muted-text md:text-lg">
                                    Hearty, flavourful and made for sharing. Here are the dishes our guests fall for first.
                                </p>
                            </div>
                            <Link href="/menu" className="inline-flex shrink-0 items-center gap-2 font-bold text-accent-gold hover:text-accent-gold-hover">
                                See the full menu <ArrowForward fontSize="small" />
                            </Link>
                        </div>
                        <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 md:gap-6">
                            {starterDishes.map((dish) => (
                                <Link
                                    key={dish.title}
                                    href={dish.href}
                                    className="group w-[78%] shrink-0 snap-center overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-accent-gold/50 active:scale-[0.99] sm:w-auto"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <Image src={dish.image} alt={dish.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 md:group-hover:scale-105" />
                                        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-3 py-1 text-xs font-bold text-accent-gold backdrop-blur-sm">
                                            {dish.tag}
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-xl font-extrabold text-main-text">{dish.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-text">{dish.text}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <ul className="mt-10 flex flex-wrap gap-2">
                            {highlights.map((h) => (
                                <li key={h} className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-main-text/85">
                                    {h}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Story */}
                <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:gap-16 md:px-6 md:py-28">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-card">
                        <Image src="/images/site/oven-toss.webp" alt="Our chef stretching feteer dough by hand" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">Our Story</p>
                        <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-main-text md:text-5xl">
                            Made by hand. Made to share.
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-muted-text md:text-lg">
                            Every feteer starts as a ball of dough, stretched thin by hand, folded with care and baked until golden and flaky.
                            Every dish on our menu is cooked the way it&apos;s done in Egyptian homes: generous, comforting and full of flavour.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-muted-text md:text-lg">
                            Whether it&apos;s your first taste of Egyptian food or a taste of home, there&apos;s a seat for you at our table.
                        </p>
                        <Link href="/about" className="mt-8 inline-flex items-center gap-2 font-bold text-accent-gold hover:text-accent-gold-hover">
                            More about us <ArrowForward fontSize="small" />
                        </Link>
                    </div>
                </section>

                {/* Offers (managed in admin) */}
                {offers.length > 0 && (
                    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">Right Now</p>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-main-text md:text-5xl">Offers & specials</h2>
                        <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
                            {offers.map((offer, i) => (
                                <article key={i} className="w-[82%] shrink-0 snap-center overflow-hidden rounded-card border border-border bg-surface md:w-auto">
                                    <div className="relative aspect-[4/3]">
                                        <Image src={imageUrl(offer.image, 828)} alt={offer.title || "Offer"} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                                    </div>
                                    {(offer.title || offer.desc) && (
                                        <div className="p-5">
                                            {offer.title && <h3 className="text-lg font-extrabold text-main-text">{offer.title}</h3>}
                                            {offer.desc && <p className="mt-2 text-sm leading-relaxed text-muted-text line-clamp-3">{offer.desc}</p>}
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Catering */}
                <section className="relative overflow-hidden">
                    <Image src="/images/site/catering-spread.webp" alt="A spread of Egyptian dishes for a gathering" fill sizes="100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
                    <div className="relative mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-36">
                        <div className="max-w-xl">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">Catering</p>
                            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-main-text md:text-5xl">
                                Any gathering, any size.
                            </h2>
                            <p className="mt-5 text-base leading-relaxed text-main-text/80 md:text-lg">
                                Family dinners, office lunches, celebrations and events. Full trays of Egyptian favourites, prepared fresh and ready to share.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Link href="/catering" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-accent-gold px-8 font-bold text-background hover:bg-accent-gold-hover active:scale-[0.98]">
                                    Plan your event <ArrowForward fontSize="small" />
                                </Link>
                                <Link href="/menu" className="inline-flex h-14 items-center justify-center rounded-full border border-main-text/30 px-8 font-bold text-main-text hover:border-accent-gold hover:text-accent-gold active:scale-[0.98]">
                                    Catering menu
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Inside the restaurant */}
                <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">Inside Elfatatry</p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-main-text md:text-5xl">Pull up a chair</h2>
                    <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                        {[
                            { src: "/images/site/interior-1.webp", alt: "Dining room with Egyptian tiles" },
                            { src: "/images/site/feteer-stretch.webp", alt: "Feteer being stretched by hand" },
                            { src: "/images/site/interior-2.webp", alt: "Dining room seating" },
                            { src: "/images/site/dish-drinks.webp", alt: "Fresh juices" },
                        ].map((img, i) => (
                            <div key={img.src} className={`relative overflow-hidden rounded-card ${i % 2 ? "aspect-[3/4] md:mt-10" : "aspect-[3/4]"}`}>
                                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Visit */}
                <section className="border-t border-border bg-surface/40">
                    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-20 md:grid-cols-3 md:px-6 md:py-24">
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-card border border-border bg-surface p-6 transition-colors hover:border-accent-gold/60">
                            <Place className="text-accent-gold" />
                            <h3 className="mt-4 text-lg font-extrabold text-main-text">Find us</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-text">{fullAddress}</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-accent-gold">Get directions <ArrowForward fontSize="inherit" /></span>
                        </a>
                        <div className="rounded-card border border-border bg-surface p-6">
                            <Schedule className="text-accent-gold" />
                            <h3 className="mt-4 text-lg font-extrabold text-main-text">Opening hours</h3>
                            <ul className="mt-2 space-y-1 text-sm">
                                {siteConfig.hours.map((h) => (
                                    <li key={h.days} className="flex justify-between gap-4">
                                        <span className="text-muted-text">{h.days}</span>
                                        <span className="text-main-text/85 text-right">{h.time}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <a href={phoneHref} className="rounded-card border border-border bg-surface p-6 transition-colors hover:border-accent-gold/60">
                            <Phone className="text-accent-gold" />
                            <h3 className="mt-4 text-lg font-extrabold text-main-text">Call us</h3>
                            <p className="mt-2 text-sm text-muted-text">Questions, pickup orders and catering.</p>
                            <span className="mt-4 inline-block text-lg font-bold text-main-text">{siteConfig.phone}</span>
                        </a>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
