import Image from "next/image";

interface PageHeroProps {
    eyebrow: string;
    title: string;
    subtitle?: string;
    image: string;
    imagePosition?: string;
}

// Shorter hero used at the top of inner pages (about, catering, contact, order).
export default function PageHero({ eyebrow, title, subtitle, image, imagePosition = "center" }: PageHeroProps) {
    return (
        <section className="relative flex min-h-[46vh] md:min-h-[52vh] items-end overflow-hidden pt-20">
            <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: imagePosition }} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
            <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 md:px-6 md:pb-16">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-gold">{eyebrow}</p>
                <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-main-text md:text-6xl">{title}</h1>
                {subtitle && <p className="mt-4 max-w-xl text-base leading-relaxed text-main-text/80 md:text-lg">{subtitle}</p>}
            </div>
        </section>
    );
}
