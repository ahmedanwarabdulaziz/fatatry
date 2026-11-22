"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Close, Menu as MenuIcon, Phone } from "@mui/icons-material";
import { navLinks, phoneHref, siteConfig } from "@/lib/site-config";

export default function SiteHeader({ transparent = false }: { transparent?: boolean }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => setOpen(false), [pathname]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const solid = !transparent || scrolled || open;
    const cta = siteConfig.orderingEnabled
        ? { href: "/order", label: "Order Online" }
        : { href: "/menu", label: "View Menu" };

    return (
        <>
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
                solid ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
            }`}
        >
            <div className="mx-auto flex h-16 md:h-20 max-w-6xl items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
                    <span className="relative h-11 w-11 md:h-14 md:w-14">
                        <Image src="/images/general/logo.png" alt="" fill sizes="56px" className="object-contain" priority />
                    </span>
                    <span className="text-lg md:text-xl font-extrabold tracking-tight text-main-text">
                        {siteConfig.name}
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8" aria-label="Main">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-semibold transition-colors hover:text-accent-gold ${
                                pathname === link.href ? "text-accent-gold" : "text-main-text/85"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href={cta.href}
                        className="rounded-full bg-accent-gold px-5 py-2.5 text-sm font-bold text-background transition-colors hover:bg-accent-gold-hover"
                    >
                        {cta.label}
                    </Link>
                </nav>

                <div className="flex items-center gap-1 md:hidden">
                    <a
                        href={phoneHref}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-main-text active:scale-95"
                        aria-label={`Call ${siteConfig.name}`}
                    >
                        <Phone fontSize="small" />
                    </a>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-main-text active:scale-95"
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                    >
                        {open ? <Close /> : <MenuIcon />}
                    </button>
                </div>
            </div>
        </header>

            {/* Rendered outside <header>: its backdrop-filter would make it the containing block for this fixed panel */}
            {open && (
                <nav
                    className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-background px-6 pt-6 pb-10 flex flex-col"
                    aria-label="Mobile"
                >
                    <Link href="/" className="py-4 text-2xl font-bold border-b border-border text-main-text">
                        Home
                    </Link>
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`py-4 text-2xl font-bold border-b border-border ${
                                pathname === link.href ? "text-accent-gold" : "text-main-text"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href={cta.href}
                        className="mt-8 rounded-full bg-accent-gold py-4 text-center text-base font-bold text-background"
                    >
                        {cta.label}
                    </Link>
                    <a href={phoneHref} className="mt-3 rounded-full border border-border py-4 text-center text-base font-bold text-main-text">
                        Call {siteConfig.phone}
                    </a>
                </nav>
            )}
        </>
    );
}
