'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { HomepageSettings } from '../app/admin/settings/actions';

interface AdCarouselProps {
    settings: HomepageSettings | null;
}

export default function AdCarousel({ settings }: AdCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Structure the raw settings into an exact array of 3 slides for the carousel.
    const slides = [
        {
            id: 'top',
            image: settings?.topAdImage,
            title: settings?.topAdTitle,
            desc: settings?.topAdDesc,
            placeholderSlot: 'Top',
        },
        {
            id: 'middle',
            image: settings?.middleAdImage,
            title: settings?.middleAdTitle,
            desc: settings?.middleAdDesc,
            placeholderSlot: 'Middle',
        },
        {
            id: 'bottom',
            image: settings?.bottomAdImage,
            title: settings?.bottomAdTitle,
            desc: settings?.bottomAdDesc,
            placeholderSlot: 'Bottom',
        }
    ];

    const nextSlide = useCallback(() => {
        setActiveIndex((current) => (current + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = () => {
        setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
    };

    // Auto-swipe every 3 seconds
    useEffect(() => {
        const timer = setInterval(nextSlide, 3000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <div className="relative w-full h-full flex-1 rounded-card overflow-hidden border border-accent-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] group bg-surface/50">
            
            {/* Sliding Track */}
            <div 
                className="flex w-full h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="min-w-full h-full relative flex-shrink-0 bg-gradient-to-br from-accent-gold/10 via-surface/80 to-accent-gold/5 flex flex-col items-center justify-center">
                        {slide.image ? (
                            <>
                                <Image src={slide.image} alt={`${slide.placeholderSlot} Ad Banner`} fill className="object-cover" />
                                {(slide.title || slide.desc) && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pt-4 pb-10 flex flex-col justify-end pointer-events-none max-h-[100%] overflow-y-auto no-scrollbar">
                                        {slide.title && <h3 className="text-accent-gold font-bold text-lg sm:text-2xl drop-shadow-md leading-tight shrink-0 pointer-events-auto uppercase tracking-wide">{slide.title}</h3>}
                                        {slide.desc && <p className="text-white/95 text-[11px] sm:text-sm mt-1 leading-snug drop-shadow-sm pointer-events-auto shrink-0">{slide.desc}</p>}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="text-accent-gold/80 text-sm font-bold tracking-widest uppercase mb-1 drop-shadow-sm">Ad Space</span>
                                <span className="text-accent-gold/50 text-xs font-medium">{slide.placeholderSlot} Banner Placeholder</span>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button 
                onClick={prevSlide}
                className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-accent-gold hover:text-black z-10"
                aria-label="Previous Ad"
            >
                <ChevronLeft fontSize="small" />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-accent-gold hover:text-black z-10"
                aria-label="Next Ad"
            >
                <ChevronRight fontSize="small" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10 p-1.5 rounded-full bg-black/30 backdrop-blur-sm">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            idx === activeIndex ? 'bg-accent-gold w-3' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>

        </div>
    );
}
