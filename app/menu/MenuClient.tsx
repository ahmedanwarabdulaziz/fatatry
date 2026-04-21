"use client";

import { useState, useDeferredValue, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MobileContainer from "@/components/MobileContainer";
import { ArrowBack, Search, Clear, Restaurant } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
    id: string;
    name: string;
}

interface MenuItem {
    id: string;
    categoryId: string;
    name: string;
    price: number;
    description?: string;
    squareImage?: string;
    servingDetails?: {
        weightGrams?: number;
        pieceCount?: number;
        skewerCount?: number;
    };
    sizes?: {
        name: string;
        price: number;
        servingDetails?: {
            weightGrams?: number;
            pieceCount?: number;
            skewerCount?: number;
        };
    }[];
    addons?: { name: string; price: number }[];
}

interface MenuClientProps {
    categories: Category[];
    items: MenuItem[];
}

const ExpandableDescription = ({ text }: { text: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const checkTruncation = () => {
            if (textRef.current && !isExpanded) {
                // scrollHeight is the full uncut height. clientHeight is the rendered height.
                // If scrollHeight is strictly greater than clientHeight, it means line-clamp is active.
                setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight + 2);
            }
        };

        checkTruncation();
        // Add a small delay for full paint
        const timer = setTimeout(checkTruncation, 150);
        window.addEventListener('resize', checkTruncation);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkTruncation);
        };
    }, [text, isExpanded]);

    return (
        <motion.div layout className="mt-1.5 flex flex-col items-start w-full relative">
            <motion.p 
                layout="position"
                ref={textRef} 
                className={`text-muted-text text-xs leading-relaxed transition-all duration-300 w-full ${isExpanded ? '' : 'line-clamp-2'}`}
            >
                {text}
            </motion.p>
            {(isTruncated || isExpanded) && (
                <motion.button 
                    layout="position"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="text-accent-gold text-[10px] font-medium mt-1 hover:underline active:scale-95 inline-block py-0.5"
                >
                    {isExpanded ? "Show less" : "Read more"}
                </motion.button>
            )}
        </motion.div>
    );
};

export default function MenuClient({ categories, items }: MenuClientProps) {
    const [activeCategory, setActiveCategory] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const deferredSearchTerm = useDeferredValue(searchTerm);

    // Global filter first based on search
    const searchFilteredItems = items.filter(item => {
        const matchesSearch = deferredSearchTerm === "" || 
            item.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) || 
            (item.description && item.description.toLowerCase().includes(deferredSearchTerm.toLowerCase()));
        return matchesSearch;
    });

    // Then filter by category
    const activeItems = searchFilteredItems.filter(item => 
        activeCategory === "ALL" || item.categoryId === activeCategory
    );

    // Helper to render item card
    const MenuItemCard = ({ item, index }: { item: MenuItem, index: number }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full active:scale-[0.98] transition-transform duration-200"
        >
            <div className="bg-surface backdrop-blur-md border border-border rounded-card p-3 flex gap-4 overflow-hidden relative">
                {/* Image */}
                <div className="h-24 w-24 shrink-0 rounded-control overflow-hidden relative bg-surface-elevated">
                    {item.squareImage ? (
                        <Image
                            src={item.squareImage}
                            alt={item.name}
                            fill
                            sizes="96px"
                            priority={index < 6}
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-text/30 border border-border/30 rounded-control">
                            <Restaurant style={{ fontSize: 32 }} />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="text-main-text font-bold text-lg leading-tight">
                                {item.name}
                            </h3>
                            {/* Show base price or 'start from' if variations exist */}
                            <div className="flex flex-col items-end shrink-0">
                                {item.sizes && item.sizes.length > 0 ? (
                                    <>
                                        <span className="text-[10px] text-muted-text uppercase tracking-wider leading-none mb-0.5">From</span>
                                        <span className="text-accent-gold font-bold text-lg leading-none">
                                            ${Math.min(...item.sizes.map(s => s.price)).toFixed(2)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-accent-gold font-bold text-lg leading-none">
                                        ${item.price.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                        {item.description && (
                            <ExpandableDescription text={item.description} />
                        )}

                        {/* Professional Compact Variations Grid */}
                        {item.sizes && item.sizes.length > 0 && (
                            <div className="mt-3">
                                <div className="grid grid-cols-3 gap-2">
                                    {item.sizes.map((s, idx) => (
                                        <div key={idx} className="bg-surface-elevated border border-border rounded-control p-1.5 flex flex-col items-center justify-center text-center">
                                            <span className="text-[9px] text-muted-text uppercase tracking-wide mb-0.5">{s.name}</span>
                                            <span className="text-accent-gold font-bold text-xs leading-none mt-0.5">${s.price.toFixed(2)}</span>
                                            {/* Variation Details */}
                                            {s.servingDetails && (
                                                <div className="mt-1 flex flex-wrap justify-center gap-0.5 text-main-text">
                                                    {s.servingDetails.weightGrams && <span className="text-[8px] bg-white/10 px-1 rounded-sm">{s.servingDetails.weightGrams}g</span>}
                                                    {s.servingDetails.pieceCount && <span className="text-[8px] bg-white/10 px-1 rounded-sm">{s.servingDetails.pieceCount}pcs</span>}
                                                    {s.servingDetails.skewerCount && <span className="text-[8px] bg-white/10 px-1 rounded-sm">{s.servingDetails.skewerCount}skw</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Compact Addons Grid */}
                        {item.addons && item.addons.length > 0 && (
                            <div className="mt-2 border-t border-border pt-2">
                                <p className="text-[10px] uppercase tracking-wider text-accent-gold/80 font-bold mb-1">Extras</p>
                                <div className="flex flex-col gap-1.5">
                                    {item.addons.map((a, idx) => (
                                        <div key={idx} className="flex justify-between items-start text-[10px] bg-surface px-2 py-1 rounded-sm border border-border">
                                            <span className="text-muted-text mr-2 leading-tight flex-1">{a.name}</span>
                                            <span className="text-accent-gold font-medium whitespace-nowrap shrink-0 mt-0.5">+ ${a.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Meta */}
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {item.servingDetails?.weightGrams && (
                                <span className="text-[10px] bg-surface-elevated border border-border text-main-text px-2 py-0.5 rounded-control shadow-sm">
                                    {item.servingDetails.weightGrams}g
                                </span>
                            )}
                            {item.servingDetails?.pieceCount && (
                                <span className="text-[10px] bg-surface-elevated border border-border text-main-text px-2 py-0.5 rounded-control shadow-sm">
                                    {item.servingDetails.pieceCount} Piece{item.servingDetails.pieceCount > 1 ? 's' : ''}
                                </span>
                            )}
                            {item.servingDetails?.skewerCount && item.servingDetails.skewerCount > 0 && (
                                <span className="text-[10px] bg-surface-elevated border border-border text-main-text px-2 py-0.5 rounded-control shadow-sm">
                                    {item.servingDetails.skewerCount} Skewer{item.servingDetails.skewerCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <MobileContainer disablePadding>
            <main className="flex-1 w-full relative flex flex-col min-h-screen bg-background">

                {/* 1. Header and Navigation - Static in fixed-height layout */}
                <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
                    <div className="px-4 pt-4 pb-3 flex flex-col gap-4">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between">
                            <Link href="/" className="h-10 w-10 flex-shrink-0 rounded-control bg-surface border border-border flex items-center justify-center text-main-text hover:bg-surface-elevated active:scale-95 transition-all">
                                <ArrowBack fontSize="small" />
                            </Link>
                            <span className="text-main-text font-bold tracking-wide text-lg text-center absolute left-1/2 -translate-x-1/2">
                                Elfatatry
                            </span>
                            <div className="w-10"></div> {/* Spacer to center the title perfectly */}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-text">
                                <Search fontSize="small" />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-surface border border-border rounded-full py-2.5 pl-10 pr-10 text-main-text text-sm focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-colors placeholder:text-muted-text"
                                placeholder="Search menu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute inset-y-0 right-3 flex items-center text-muted-text hover:text-main-text active:scale-95 transition-all"
                                >
                                    <Clear fontSize="small" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Horizontal Categories Tabs */}
                    <div className="px-4 pb-3 pt-3 overflow-x-auto no-scrollbar flex gap-2 w-full">
                        <button
                            onClick={() => setActiveCategory("ALL")}
                            className={`flex-none px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                                activeCategory === "ALL"
                                    ? 'bg-accent-gold text-background shadow-md'
                                    : 'bg-surface text-muted-text border border-border hover:bg-surface-elevated'
                            }`}
                        >
                            All Menu
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex-none px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                                    activeCategory === cat.id
                                        ? 'bg-accent-gold text-background shadow-md'
                                        : 'bg-surface text-muted-text border border-border hover:bg-surface-elevated'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Menu Items List */}
                <div className="px-4 pb-24 z-10 flex-1 w-full pt-4">
                    <div className="space-y-4">
                        <AnimatePresence mode="wait">
                            {activeCategory === "ALL" ? (
                                <div className="space-y-8">
                                    {categories.map((cat) => {
                                        const catItems = searchFilteredItems.filter(item => item.categoryId === cat.id);

                                        if (catItems.length === 0) return null;

                                        return (
                                            <div key={cat.id} className="space-y-3">
                                                <h2 className="text-main-text font-bold text-lg px-1 pb-1 inline-block tracking-wide">
                                                    {cat.name}
                                                </h2>
                                                <div className="space-y-4">
                                                    {catItems.map((item, i) => (
                                                        <MenuItemCard key={item.id} item={item} index={i} />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Empty state for ALL view if search yields no results */}
                                    {searchFilteredItems.length === 0 && (
                                        <div className="text-center py-20 bg-surface rounded-card border border-border mt-4">
                                            <div className="text-muted-text mb-4 flex justify-center">
                                                <Search style={{ fontSize: 48 }} opacity={0.5} />
                                            </div>
                                            <h3 className="text-main-text text-lg font-medium">No items found</h3>
                                            <p className="text-muted-text text-sm mt-1">Try searching for something else</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeItems.map((item, i) => (
                                        <MenuItemCard key={item.id} item={item} index={i} />
                                    ))}

                                    {activeItems.length === 0 && (
                                        <div className="text-center py-20 bg-surface rounded-card border border-border mt-4">
                                            <div className="text-muted-text mb-4 flex justify-center">
                                                <Search style={{ fontSize: 48 }} opacity={0.5} />
                                            </div>
                                            <h3 className="text-main-text text-lg font-medium">No items found in {categories.find(c => c.id === activeCategory)?.name}</h3>
                                            <p className="text-muted-text text-sm mt-1">Try searching for something else</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </main>
        </MobileContainer>
    );
}
