import Link from "next/link";
import MobileContainer from "@/components/MobileContainer";
import { ArrowForward } from "@mui/icons-material";
import Image from "next/image";
import { getHomepageSettings } from "./admin/settings/actions";

export default async function Home() {
    const settings = await getHomepageSettings();

    return (
        <MobileContainer disablePadding>
            <main className="w-full h-[100dvh] min-h-[100dvh] relative flex flex-col bg-background overflow-hidden">

                {/* 1. Background Layer - Cinematic */}
                <div className="absolute inset-0 z-0 opacity-80 overflow-hidden pointer-events-none">
                    <Image src="/images/general/BG.png" alt="Background" fill priority className="object-cover" />
                    {/* Sophisticated Gradient: Clear top, dark bottom to blend into background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
                </div>

                {/* 2. Content Layer */}
                <div className="relative z-10 flex flex-col px-5 pt-4 pb-0 flex-1 min-h-0">

                    {/* Top Brand Area */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="relative w-32 h-32 sm:w-48 sm:h-48 drop-shadow-xl">
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
                    <div className="flex-1 flex flex-col items-center w-full pt-2 pb-2 min-h-0">

                        {/* Main Headline */}
                        <div className="text-center px-2 w-full shrink-0">
                            <h1 className="text-xl min-[375px]:text-2xl sm:text-3xl font-extrabold text-main-text leading-[1.1] tracking-tight drop-shadow-md whitespace-nowrap">
                                Authentic <span className="font-light text-accent-gold">Egyptian</span> Taste
                            </h1>
                            <p className="text-muted-text text-[11px] sm:text-sm mt-0.5 font-medium max-w-[280px] mx-auto opacity-90 hidden min-[375px]:block">
                                Crafting traditional feteer with a modern touch.
                            </p>
                        </div>

                        {/* Ads Stack */}
                        <div className="flex flex-col flex-1 w-full gap-2.5 mt-3 min-h-0 mb-4">

                        {/* Top Ad Poster Card */}
                        <div className="flex-1 min-h-0 w-full relative rounded-card overflow-hidden border border-accent-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] bg-gradient-to-br from-accent-gold/10 via-surface/80 to-accent-gold/5 flex flex-col items-center justify-center transition-all duration-300 hover:border-accent-gold hover:shadow-[0_4px_25px_rgba(212,175,55,0.25)] cursor-pointer group">
                            {settings?.topAdImage ? (
                                <>
                                    <Image src={settings.topAdImage} alt="Top Ad Banner" fill className="object-cover" />
                                    {(settings.topAdTitle || settings.topAdDesc) && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-2.5 sm:p-4 flex flex-col justify-start pointer-events-none max-h-[100%] overflow-y-auto no-scrollbar">
                                            {settings.topAdTitle && <h3 className="text-accent-gold font-bold text-base sm:text-lg drop-shadow-md leading-tight shrink-0 pointer-events-auto uppercase tracking-wide">{settings.topAdTitle}</h3>}
                                            {settings.topAdDesc && <p className="text-white/95 text-[10px] min-[375px]:text-[11px] sm:text-sm mt-0.5 leading-snug drop-shadow-sm pointer-events-auto shrink-0">{settings.topAdDesc}</p>}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-accent-gold/80 text-xs font-bold tracking-widest uppercase mb-0.5 group-hover:text-accent-gold transition-colors drop-shadow-sm">Ad Space</span>
                                    <span className="text-accent-gold/50 text-[10px] font-medium hidden min-[375px]:block">Top Banner Placeholder</span>
                                </>
                            )}
                        </div>

                        {/* Middle Ad Poster Card */}
                        <div className="flex-1 min-h-0 w-full relative rounded-card overflow-hidden border border-accent-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] bg-gradient-to-br from-accent-gold/10 via-surface/80 to-accent-gold/5 flex flex-col items-center justify-center transition-all duration-300 hover:border-accent-gold hover:shadow-[0_4px_25px_rgba(212,175,55,0.25)] cursor-pointer group">
                            {settings?.middleAdImage ? (
                                <>
                                    <Image src={settings.middleAdImage} alt="Middle Ad Banner" fill className="object-cover" />
                                    {(settings.middleAdTitle || settings.middleAdDesc) && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-2.5 sm:p-4 flex flex-col justify-start pointer-events-none max-h-[100%] overflow-y-auto no-scrollbar">
                                            {settings.middleAdTitle && <h3 className="text-accent-gold font-bold text-base sm:text-lg drop-shadow-md leading-tight shrink-0 pointer-events-auto uppercase tracking-wide">{settings.middleAdTitle}</h3>}
                                            {settings.middleAdDesc && <p className="text-white/95 text-[10px] min-[375px]:text-[11px] sm:text-sm mt-0.5 leading-snug drop-shadow-sm pointer-events-auto shrink-0">{settings.middleAdDesc}</p>}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-accent-gold/80 text-xs font-bold tracking-widest uppercase mb-0.5 group-hover:text-accent-gold transition-colors drop-shadow-sm">Ad Space</span>
                                    <span className="text-accent-gold/50 text-[10px] font-medium hidden min-[375px]:block">Middle Banner Placeholder</span>
                                </>
                            )}
                        </div>

                        {/* Bottom Ad Poster Card */}
                        <div className="flex-1 min-h-0 w-full relative rounded-card overflow-hidden border border-accent-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] bg-gradient-to-br from-accent-gold/10 via-surface/80 to-accent-gold/5 flex flex-col items-center justify-center transition-all duration-300 hover:border-accent-gold hover:shadow-[0_4px_25px_rgba(212,175,55,0.25)] cursor-pointer group">
                            {settings?.bottomAdImage ? (
                                <>
                                    <Image src={settings.bottomAdImage} alt="Bottom Ad Banner" fill className="object-cover" />
                                    {(settings.bottomAdTitle || settings.bottomAdDesc) && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-2.5 sm:p-4 flex flex-col justify-start pointer-events-none max-h-[100%] overflow-y-auto no-scrollbar">
                                            {settings.bottomAdTitle && <h3 className="text-accent-gold font-bold text-base sm:text-lg drop-shadow-md leading-tight shrink-0 pointer-events-auto uppercase tracking-wide">{settings.bottomAdTitle}</h3>}
                                            {settings.bottomAdDesc && <p className="text-white/95 text-[10px] min-[375px]:text-[11px] sm:text-sm mt-0.5 leading-snug drop-shadow-sm pointer-events-auto shrink-0">{settings.bottomAdDesc}</p>}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="text-accent-gold/80 text-xs font-bold tracking-widest uppercase mb-0.5 group-hover:text-accent-gold transition-colors drop-shadow-sm">Ad Space</span>
                                    <span className="text-accent-gold/50 text-[10px] font-medium hidden min-[375px]:block">Bottom Banner Placeholder</span>
                                </>
                            )}
                        </div>

                        </div>

                    </div>

                </div>

                {/* 3. Bottom Action Area */}
                <div className="w-full z-20 px-6 pb-6 pt-2 shrink-0">
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
