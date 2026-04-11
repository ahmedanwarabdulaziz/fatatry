import Link from "next/link";
import MobileContainer from "@/components/MobileContainer";
import { ArrowForward } from "@mui/icons-material";
import Image from "next/image";
import { getActiveOffers } from "./admin/special-offers/actions";

export default async function Home() {
    const offers = await getActiveOffers(3);

    return (
        <MobileContainer disablePadding>
            <main className="w-full min-h-screen relative flex flex-col bg-background overflow-y-auto no-scrollbar">

                {/* 1. Background Layer - Cinematic */}
                <div className="absolute inset-0 z-0 opacity-80 overflow-hidden">
                    <Image src="/images/general/BG.png" alt="Background" fill priority className="object-cover" />
                    {/* Sophisticated Gradient: Clear top, dark bottom to blend into background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
                </div>

                {/* 2. Content Layer */}
                <div className="relative z-10 flex flex-col px-6 pt-8 pb-8 flex-1">

                    {/* Top Brand Area */}
                    <div className="flex flex-col items-center justify-center space-y-2 mt-4">
                        <div className="relative w-40 h-40 sm:w-48 sm:h-48 drop-shadow-2xl">
                            <Image
                                src="/images/general/logo.png"
                                alt="Elfatatry Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Spacer to push content down gently */}
                    <div className="flex-1 min-h-[30px]" />

                    {/* Main Headline */}
                    <div className="mb-6 space-y-1.5 text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-main-text leading-[1.1] tracking-tight drop-shadow-md">
                            Authentic <span className="font-light text-accent-gold">Egyptian</span> Taste
                        </h1>
                        <p className="text-muted-text text-sm font-medium leading-relaxed max-w-[280px] mx-auto opacity-90">
                            Crafting traditional feteer with a modern touch.
                        </p>
                    </div>

                    {/* Special Offers Section */}
                    {offers.length > 0 && (
                        <div className="mb-4 w-full space-y-3">
                            {offers.map((offer) => (
                                <div key={offer.id} className="w-full bg-surface/80 backdrop-blur-md rounded-card border border-border flex items-center px-4 py-4 relative shadow-lg active:scale-[0.98] transition-transform">

                                    {offer.squareImage && (
                                        <div className="relative w-20 h-20 rounded-control overflow-hidden mr-4 shrink-0 bg-surface-elevated">
                                            <Image
                                                src={offer.squareImage}
                                                alt={offer.headline}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <span className="text-accent-gold font-bold block text-base leading-tight">{offer.headline}</span>
                                        <span className="text-muted-text text-xs line-clamp-2 leading-relaxed mt-1">{offer.text}</span>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-muted-text/50 text-xs line-through">${offer.priceBefore.toFixed(2)}</span>
                                            <span className="text-accent-gold font-bold text-sm">${offer.priceAfter.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Sticky Action Area (always visible at bottom) */}
                <div className="sticky bottom-0 w-full z-20 px-6 pb-8 pt-6 bg-gradient-to-t from-background via-background/95 to-transparent mt-auto">
                    <Link href="/menu" className="block group w-full">
                        <button className="w-full bg-accent-gold text-background font-bold py-3.5 rounded-full text-base sm:text-lg shadow-xl flex items-center justify-between px-2 pl-6 transition-transform transform active:scale-[0.98] duration-200">
                            <span>View Full Menu</span>
                            <div className="bg-background/90 text-accent-gold h-9 w-9 rounded-full flex items-center justify-center shadow-sm">
                                <ArrowForward fontSize="small" />
                            </div>
                        </button>
                    </Link>
                </div>

            </main>
        </MobileContainer>
    );
}
