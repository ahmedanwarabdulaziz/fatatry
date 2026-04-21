import Link from "next/link";
import MobileContainer from "@/components/MobileContainer";
import { ArrowForward } from "@mui/icons-material";
import Image from "next/image";
import { getHomepageSettings } from "./admin/settings/actions";

export default async function Home() {
    const settings = await getHomepageSettings();

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
                        <div className="relative w-80 h-80 sm:w-96 sm:h-96 drop-shadow-2xl">
                            <Image
                                src="/images/general/logo.png"
                                alt="Elfatatry Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Centered Content Block */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full py-4 space-y-6">

                        {/* Main Headline */}
                        <div className="space-y-1.5 text-center px-4 w-full">
                            <h1 className="text-2xl min-[375px]:text-[28px] sm:text-4xl font-extrabold text-main-text leading-[1.1] tracking-tight drop-shadow-md whitespace-nowrap">
                                Authentic <span className="font-light text-accent-gold">Egyptian</span> Taste
                            </h1>
                            <p className="text-muted-text text-sm font-medium leading-relaxed max-w-[280px] mx-auto opacity-90">
                                Crafting traditional feteer with a modern touch.
                            </p>
                        </div>

                        {/* Top Ad Poster Card */}
                        <div className="w-full relative rounded-card overflow-hidden border border-accent-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] aspect-[16/9] bg-gradient-to-br from-accent-gold/10 via-surface/80 to-accent-gold/5 flex flex-col items-center justify-center transition-all duration-300 hover:border-accent-gold hover:shadow-[0_4px_25px_rgba(212,175,55,0.25)] cursor-pointer group">
                            {settings?.topAdImage ? (
                                <>
                                    <Image src={settings.topAdImage} alt="Top Ad Banner" fill className="object-cover" />
                                    {(settings.topAdTitle || settings.topAdDesc) && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-start pointer-events-none">
                                            {settings.topAdTitle && <h3 className="text-accent-gold font-bold text-lg sm:text-xl drop-shadow-md leading-tight pointer-events-auto">{settings.topAdTitle}</h3>}
                                            {settings.topAdDesc && <p className="text-white/95 text-xs sm:text-sm mt-0.5 leading-relaxed drop-shadow-sm pointer-events-auto">{settings.topAdDesc}</p>}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-accent-gold/80 text-xs font-bold tracking-widest uppercase mb-1 group-hover:text-accent-gold transition-colors drop-shadow-sm">Ad Space</span>
                                    <span className="text-accent-gold/50 text-[10px] font-medium">Top Banner Placeholder</span>
                                </>
                            )}
                        </div>

                        {/* Middle Ad Poster Card */}
                        <div className="w-full relative rounded-card overflow-hidden border border-accent-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] aspect-[16/9] bg-gradient-to-br from-accent-gold/10 via-surface/80 to-accent-gold/5 flex flex-col items-center justify-center transition-all duration-300 hover:border-accent-gold hover:shadow-[0_4px_25px_rgba(212,175,55,0.25)] cursor-pointer group">
                            {settings?.middleAdImage ? (
                                <>
                                    <Image src={settings.middleAdImage} alt="Middle Ad Banner" fill className="object-cover" />
                                    {(settings.middleAdTitle || settings.middleAdDesc) && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-start pointer-events-none">
                                            {settings.middleAdTitle && <h3 className="text-accent-gold font-bold text-lg sm:text-xl drop-shadow-md leading-tight pointer-events-auto">{settings.middleAdTitle}</h3>}
                                            {settings.middleAdDesc && <p className="text-white/95 text-xs sm:text-sm mt-0.5 leading-relaxed drop-shadow-sm pointer-events-auto">{settings.middleAdDesc}</p>}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-accent-gold/80 text-xs font-bold tracking-widest uppercase mb-1 group-hover:text-accent-gold transition-colors drop-shadow-sm">Ad Space</span>
                                    <span className="text-accent-gold/50 text-[10px] font-medium">Middle Banner Placeholder</span>
                                </>
                            )}
                        </div>

                        {/* Bottom Ad Poster Card */}
                        <div className="w-full relative rounded-card overflow-hidden border border-accent-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] aspect-[16/9] bg-gradient-to-br from-accent-gold/10 via-surface/80 to-accent-gold/5 flex flex-col items-center justify-center transition-all duration-300 hover:border-accent-gold hover:shadow-[0_4px_25px_rgba(212,175,55,0.25)] cursor-pointer group">
                            {settings?.bottomAdImage ? (
                                <>
                                    <Image src={settings.bottomAdImage} alt="Bottom Ad Banner" fill className="object-cover" />
                                    {(settings.bottomAdTitle || settings.bottomAdDesc) && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-start pointer-events-none">
                                            {settings.bottomAdTitle && <h3 className="text-accent-gold font-bold text-lg sm:text-xl drop-shadow-md leading-tight pointer-events-auto">{settings.bottomAdTitle}</h3>}
                                            {settings.bottomAdDesc && <p className="text-white/95 text-xs sm:text-sm mt-0.5 leading-relaxed drop-shadow-sm pointer-events-auto">{settings.bottomAdDesc}</p>}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-accent-gold/80 text-xs font-bold tracking-widest uppercase mb-1 group-hover:text-accent-gold transition-colors drop-shadow-sm">Ad Space</span>
                                    <span className="text-accent-gold/50 text-[10px] font-medium">Bottom Banner Placeholder</span>
                                </>
                            )}
                        </div>

                    </div>

                </div>

                {/* 3. Sticky Action Area (always visible at bottom) */}
                <div className="sticky bottom-0 w-full z-20 px-6 pb-8 pt-6 bg-gradient-to-t from-background via-background/95 to-transparent mt-auto">
                    <Link href="/menu" className="block group w-full">
                        <button className="w-full relative bg-gradient-to-b from-yellow-400 to-accent-gold text-background font-extrabold py-3.5 rounded-full text-base sm:text-lg shadow-[0_8px_20px_rgba(212,175,55,0.35),inset_0_-4px_0_rgba(150,100,0,0.4),inset_0_2px_0_rgba(255,255,255,0.6)] flex items-center justify-center transition-all transform active:translate-y-1 active:shadow-[0_2px_10px_rgba(212,175,55,0.3),inset_0_-1px_0_rgba(150,100,0,0.4),inset_0_1px_0_rgba(255,255,255,0.6)] duration-150">
                            <span className="drop-shadow-sm tracking-wide">View Full Menu</span>
                            <div className="absolute right-2 bg-background/95 text-yellow-600 h-9 w-9 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                                <ArrowForward fontSize="small" />
                            </div>
                        </button>
                    </Link>
                </div>

            </main>
        </MobileContainer>
    );
}
