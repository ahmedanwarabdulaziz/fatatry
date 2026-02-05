import Link from "next/link";
import MobileContainer from "@/components/MobileContainer";
import { ArrowForward } from "@mui/icons-material";
import Image from "next/image";
import { getActiveOffers } from "./admin/special-offers/actions";

export default async function Home() {
    const offers = await getActiveOffers(3);

    return (
        <MobileContainer disablePadding>
            <main className="w-full h-screen relative flex flex-col bg-black overflow-hidden">

                {/* 1. Background Layer - Cinematic */}
                <div
                    className="absolute inset-0 z-0 opacity-90 transition-opacity duration-1000"
                    style={{
                        backgroundImage: 'url(/images/general/BG.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Sophisticated Gradient: Clear top, dark bottom for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
                </div>

                {/* 2. Content Layer */}
                <div className="relative z-10 h-full flex flex-col px-6 py-4">

                    {/* Top Brand Area */}
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="relative w-40 h-40 sm:w-52 sm:h-52 drop-shadow-2xl">
                            <Image
                                src="/images/general/logo.png"
                                alt="Elfatatry Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Spacer to push content down */}
                    <div className="flex-1 min-h-0" />

                    {/* Main Headline */}
                    <div className="mb-3 space-y-1">
                        <h1 className="text-3xl sm:text-4xl font-medium text-white leading-[1.1] tracking-tight">
                            Authentic <span className="font-light text-amber-500">Egyptian</span> Taste.
                        </h1>
                        <p className="text-gray-400 text-xs font-light leading-relaxed max-w-[280px]">
                            Crafting traditional feteer with a modern touch.
                        </p>
                    </div>

                    {/* Special Offers Section */}
                    {offers.length > 0 && (
                        <div className="mb-5 w-full space-y-3">
                            {offers.map((offer) => (
                                <div key={offer.id} className="w-full bg-gradient-to-r from-white/10 to-transparent backdrop-blur-md rounded-2xl border border-white/10 flex items-center px-4 py-4 relative overflow-hidden">

                                    {offer.squareImage && (
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden mr-4 shrink-0">
                                            <Image
                                                src={offer.squareImage}
                                                alt={offer.headline}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <span className="text-amber-500 font-bold block text-base leading-tight">{offer.headline}</span>
                                        <span className="text-white/70 text-xs line-clamp-2 leading-relaxed mt-1">{offer.text}</span>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-white/50 text-xs line-through">${offer.priceBefore.toFixed(2)}</span>
                                            <span className="text-amber-500 font-bold text-sm">${offer.priceAfter.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="pb-2">
                        <Link href="/menu" className="block group">
                            <button className="w-full bg-white text-black font-semibold py-3.5 rounded-full text-base sm:text-lg shadow-lg flex items-center justify-between px-2 pl-6 transition-transform transform active:scale-95 duration-200">
                                <span>Menu</span>
                                <div className="bg-black text-white h-9 w-9 rounded-full flex items-center justify-center">
                                    <ArrowForward fontSize="small" />
                                </div>
                            </button>
                        </Link>
                    </div>
                </div>

            </main>
        </MobileContainer>
    );
}
