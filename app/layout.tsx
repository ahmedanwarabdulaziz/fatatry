import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Restaurant Menu",
    description: "Restaurant Menu & Admin",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
