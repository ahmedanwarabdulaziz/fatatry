import Link from "next/link";
import MobileContainer from "@/components/MobileContainer";
import { Restaurant, ArrowForward } from "@mui/icons-material";
import Image from "next/image";

export default function Home() {
    return (
        <MobileContainer disablePadding>
            <main className="flex-1 w-full relative flex flex-col bg-black">

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
                <div className="relative z-10 flex-1 flex flex-col px-8 pb-12">

                    {/* Top Brand Area */}
                    <div className="pt-12 flex flex-col items-center justify-center space-y-6">
                        <div className="relative w-80 h-80 drop-shadow-2xl">
                            <Image
                                src="/images/general/logo.png"
                                alt="Elfatatry Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="px-4 py-1 border border-white/20 rounded-full backdrop-blur-sm bg-black/20 hidden">
                            <span className="text-[10px] font-bold tracking-[0.3em] text-white uppercase opacity-90">
                                Est. 1950
                            </span>
                        </div>
                    </div>

                    {/* Spacer to push content down */}
                    <div className="flex-1" />

                    {/* Main Headline */}
                    <div className="mb-6 space-y-2">
                        <h1 className="text-4xl font-medium text-white leading-[1.1] tracking-tight">
                            Authentic <span className="font-light text-amber-500">Egyptian</span> Taste.
                        </h1>
                        <p className="text-gray-400 text-xs font-light leading-relaxed max-w-[280px]">
                            Crafting traditional feteer with a modern touch.
                        </p>
                    </div>

                    {/* Offers Section */}
                    <div className="mb-8 w-full space-y-3">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="w-full h-16 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-md rounded-xl border border-white/10 flex items-center px-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex-1">
                                    <span className="text-amber-500 font-bold block text-sm">Special Offer {i + 1}</span>
                                    <span className="text-white/60 text-[10px] uppercase tracking-wider">Limited Time Only</span>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="text-white text-xs">→</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Area */}
                    <div className="space-y-6">
                        <Link href="/menu" className="block group">
                            <button className="w-full bg-white text-black font-semibold py-4 rounded-full text-lg shadow-lg flex items-center justify-between px-2 pl-8 transition-transform transform active:scale-95 duration-200">
                                <span>Order Now</span>
                                <div className="bg-black text-white h-10 w-10 rounded-full flex items-center justify-center">
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
