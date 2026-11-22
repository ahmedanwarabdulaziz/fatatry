import type { Metadata, Viewport } from "next";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jakarta",
});

// Arabic dish names (brand font for Arabic)
const cairo = Cairo({
    subsets: ["arabic"],
    weight: ["600", "700"],
    display: "swap",
    variable: "--font-cairo",
});

export const metadata: Metadata = {
    title: "Elfatatry | Egyptian Feteer & Home Cooking in Mississauga",
    description: siteConfig.description,
    manifest: "/manifest.json",
    openGraph: {
        title: "Elfatatry | Egyptian Feteer & Home Cooking",
        description: siteConfig.description,
        images: ["/images/site/hero.webp"],
        type: "website",
        locale: "en_CA",
    },
};

export const viewport: Viewport = {
    themeColor: "#121212",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: 'Elfatatry',
        description: siteConfig.description,
        servesCuisine: 'Egyptian',
        url: 'https://elfatatry.com',
        hasMenu: 'https://elfatatry.com/menu',
        image: 'https://elfatatry.com/images/site/hero.webp',
        telephone: `+1 ${siteConfig.phone}`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: siteConfig.address.street,
            addressLocality: siteConfig.address.city,
            addressRegion: siteConfig.address.province,
            postalCode: siteConfig.address.postalCode,
            addressCountry: siteConfig.address.country,
        },
        geo: { '@type': 'GeoCoordinates', latitude: siteConfig.geo.lat, longitude: siteConfig.geo.lng },
        openingHoursSpecification: siteConfig.openingHoursSpec.map((h) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.days,
            opens: h.opens,
            closes: h.closes,
        })),
    };

    return (
        <html lang="en" className={`${jakarta.variable} ${cairo.variable}`}>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="antialiased font-sans text-main-text bg-background">{children}</body>
        </html>
    );
}
