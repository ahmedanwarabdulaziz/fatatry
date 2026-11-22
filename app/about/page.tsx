import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowForward } from "@mui/icons-material";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
    title: "About Us | Elfatatry",
    description: "The story behind Elfatatry: hand-stretched feteer and Egyptian home cooking in Mississauga.",
};

const values = [
    { title: "Made by hand", text: "Our feteer is stretched, folded and baked to order. No shortcuts." },
    { title: "Egyptian at heart", text: "Recipes and flavours from home: koshari, molokhya, grills and more." },
    { title: "Shared with family", text: "Generous portions made for the table, whether that's two people or two hundred." },
];

export default function AboutPage() {
    return (
        <>
            <SiteHeader transparent />
            <main className="bg-background">
                <PageHero
                    eyebrow="About Us"
                    title="Made with love, shared with family."
                    subtitle="A little corner of Egypt in Mississauga."
                    image="/images/site/feteer-stretch.webp"
                    imagePosition="center 30%"
                />

                <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:gap-16 md:px-6 md:py-28">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">Our Story</p>
                        <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-main-text md:text-5xl">
                            It all starts with the dough.
                        </h2>
                        {/* PLACEHOLDER story: replace with the owner's own words */}
                        <p className="mt-5 text-base leading-relaxed text-muted-text md:text-lg">
                            {siteConfig.name} ({siteConfig.nameAr}) means &ldquo;the feteer maker&rdquo;. Feteer is Egypt&apos;s layered, buttery pastry,
                            stretched paper-thin by hand and baked until golden. It&apos;s the dish we&apos;re named after, and the heart of our kitchen.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-muted-text md:text-lg">
                            Around it we cook the food Egyptian families gather for: koshari, molokhya, stuffed vegetables, oven dishes and grills,
                            made the way we know them from home.
                        </p>
                    </div>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-card">
                        <Image src="/images/site/team-owner.webp" alt="The Elfatatry team" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-top" />
                    </div>
                </section>

                <section className="border-y border-border bg-surface/40">
                    <div className="mx-auto grid max-w-6xl gap-5 px-4 py-20 md:grid-cols-3 md:px-6 md:py-24">
                        {values.map((v) => (
                            <div key={v.title} className="rounded-card border border-border bg-surface p-6 md:p-8">
                                <h3 className="text-xl font-extrabold text-main-text">{v.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-muted-text md:text-base">{v.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
                    <div className="grid grid-cols-2 gap-3 md:gap-5">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-card">
                            <Image src="/images/site/interior-1.webp" alt="Our dining room" fill sizes="50vw" className="object-cover" />
                        </div>
                        <div className="relative aspect-[3/4] overflow-hidden rounded-card">
                            <Image src="/images/site/oven-toss.webp" alt="Stretching feteer dough" fill sizes="50vw" className="object-cover" />
                        </div>
                    </div>
                    <div className="mt-12 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                        <h2 className="text-2xl font-extrabold text-main-text md:text-4xl">Come hungry.</h2>
                        <Link href="/menu" className="inline-flex h-14 items-center gap-2 rounded-full bg-accent-gold px-8 font-bold text-background hover:bg-accent-gold-hover">
                            View Menu <ArrowForward fontSize="small" />
                        </Link>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
