import type { Metadata } from "next";
import LandingPage from "@/components/site/LandingPage";
import { landingPages } from "@/lib/landing-pages";

const page = landingPages.halal;

export const metadata: Metadata = {
    title: page.metaTitle,
    description: page.subheadline,
    robots: { index: false, follow: true },
};

export default function HalalLandingPage() {
    return <LandingPage page={page} />;
}
