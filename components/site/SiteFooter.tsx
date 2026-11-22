import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "@mui/icons-material";
import { fullAddress, mapsUrl, navLinks, phoneHref, siteConfig } from "@/lib/site-config";

export default function SiteFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-[#0d0d0d]">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
                <div className="md:col-span-1">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="relative h-14 w-14">
                            <Image src="/images/general/logo.png" alt="" fill sizes="56px" className="object-contain" />
                        </span>
                        <span className="text-xl font-extrabold text-main-text">{siteConfig.name}</span>
                    </Link>
                    <p className="mt-4 text-sm leading-relaxed text-muted-text">{siteConfig.tagline}.</p>
                    <div className="mt-5 flex gap-2">
                        {siteConfig.social.instagram && (
                            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-main-text hover:border-accent-gold hover:text-accent-gold">
                                <Instagram fontSize="small" />
                            </a>
                        )}
                        {siteConfig.social.facebook && (
                            <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-main-text hover:border-accent-gold hover:text-accent-gold">
                                <Facebook fontSize="small" />
                            </a>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-accent-gold">Visit</h3>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block text-sm leading-relaxed text-main-text/85 hover:text-accent-gold">
                        {fullAddress}
                    </a>
                    <a href={phoneHref} className="mt-3 block text-sm text-main-text/85 hover:text-accent-gold">{siteConfig.phone}</a>
                    {siteConfig.email && (
                        <a href={`mailto:${siteConfig.email}`} className="mt-1 block text-sm text-main-text/85 hover:text-accent-gold">{siteConfig.email}</a>
                    )}
                    <a href={siteConfig.google.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-main-text/85 hover:text-accent-gold">
                        <span className="text-accent-gold">★</span> Rated {siteConfig.google.rating} on Google
                    </a>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-accent-gold">Hours</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        {siteConfig.hours.map((h) => (
                            <li key={h.days} className="flex flex-col">
                                <span className="text-main-text/85">{h.days}</span>
                                <span className="text-muted-text">{h.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-accent-gold">Explore</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><Link href="/" className="text-main-text/85 hover:text-accent-gold">Home</Link></li>
                        {navLinks.map((l) => (
                            <li key={l.href}><Link href={l.href} className="text-main-text/85 hover:text-accent-gold">{l.label}</Link></li>
                        ))}
                        <li><Link href="/order" className="text-main-text/85 hover:text-accent-gold">Order Online</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-border">
                <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-text md:px-6">
                    © {year} {siteConfig.name}. Mississauga, Ontario.
                </p>
            </div>
        </footer>
    );
}
