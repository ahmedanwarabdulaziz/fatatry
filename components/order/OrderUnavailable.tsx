import Link from "next/link";
import { ArrowForward, Phone } from "@mui/icons-material";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PageHero from "@/components/site/PageHero";
import { phoneHref, siteConfig } from "@/lib/site-config";

export default function OrderUnavailable({ paused = false, missing = [] as string[] }: { paused?: boolean; missing?: string[] }) {
    return (
        <>
            <SiteHeader transparent />
            <main className="bg-background">
                <PageHero
                    eyebrow="Order Online"
                    title={paused ? "Online ordering is paused right now." : "Online ordering is coming soon."}
                    subtitle={
                        paused
                            ? "We're very busy at the moment. Please call us and we'll take your order by phone."
                            : "Pickup, straight from our kitchen. Until then, give us a call and we'll have it ready."
                    }
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
                    {missing.length > 0 && (
                        <div className="mt-12 max-w-xl rounded-card border border-accent-gold/40 bg-surface p-6">
                            <p className="font-bold text-accent-gold">Admin only: setup still needed</p>
                            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-text">
                                {missing.map((m) => <li key={m}>{m}</li>)}
                            </ul>
                        </div>
                    )}
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
