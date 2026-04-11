import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jakarta",
});

export const metadata: Metadata = {
    title: "Elfatatry | Authentic Egyptian Taste",
    description: "Crafting traditional feteer with a modern touch.",
    manifest: "/manifest.json",
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
        description: 'Authentic Egyptian Taste. Crafting traditional feteer with a modern touch.',
        servesCuisine: 'Egyptian',
        hasMenu: '/menu'
    };

    return (
        <html lang="en" className={jakarta.variable}>
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
