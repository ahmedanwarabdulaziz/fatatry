"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import MobileContainer from "@/components/MobileContainer";
import { ArrowBack, Search, FilterList } from "@mui/icons-material";
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

export default function MenuClient({ categories, items }: MenuClientProps) {
    const [activeCategory, setActiveCategory] = useState<string>("ALL");
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter items based on active category
    const filteredItems = items.filter(item =>
        (activeCategory === "ALL" || item.categoryId === activeCategory) &&
        (searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeCategoryName = activeCategory === "ALL" ? "All Menu" : (categories.find(c => c.id === activeCategory)?.name || "Menu");

    // Helper to render item card
    const MenuItemCard = ({ item, index }: { item: MenuItem, index: number }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative group w-full"
        >
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex gap-4 overflow-hidden relative">
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Image */}
                <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden relative bg-white/5">
                    {item.squareImage ? (
                        <Image
                            src={item.squareImage}
                            alt={item.name}
                            fill
                            sizes="96px"
                            priority={index < 6}
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                            <span className="text-xs">No Image</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="text-white font-bold text-lg leading-tight truncate">
                                {item.name}
                            </h3>
                            {/* Show base price or 'start from' if variations exist */}
                            <div className="flex flex-col items-end">
                                <span className="text-amber-500 font-bold text-lg">
                                    {item.sizes && item.sizes.length > 0
                                        ? Math.min(...item.sizes.map(s => s.price)).toFixed(2)
                                        : item.price.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                            {item.description || "Authentic Egyptian delicacy prepared with premium ingredients."}
                        </p>

                        {/* Professional Compact Variations Grid */}
                        {item.sizes && item.sizes.length > 0 && (
                            <div className="mt-3">
                                <div className="grid grid-cols-3 gap-2">
                                    {item.sizes.map((s, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-1.5 flex flex-col items-center justify-center text-center">
                                            <span className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">{s.name}</span>
                                            <span className="text-amber-500 font-bold text-xs">{s.price.toFixed(2)}</span>
                                            {/* Variation Details */}
                                            {s.servingDetails && (
                                                <div className="mt-1 flex flex-wrap justify-center gap-0.5 text-white">
                                                    {s.servingDetails.weightGrams && <span className="text-[8px] bg-white/10 px-1 rounded">{s.servingDetails.weightGrams}g</span>}
                                                    {s.servingDetails.pieceCount && <span className="text-[8px] bg-white/10 px-1 rounded">{s.servingDetails.pieceCount}pcs</span>}
                                                    {s.servingDetails.skewerCount && <span className="text-[8px] bg-white/10 px-1 rounded">{s.servingDetails.skewerCount}skw</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Compact Addons Grid */}
                        {item.addons && item.addons.length > 0 && (
                            <div className="mt-2 border-t border-white/10 pt-2">
                                <p className="text-[10px] uppercase tracking-wider text-amber-500/80 font-bold mb-1">Extras</p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {item.addons.map((a, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[10px] bg-white/5 px-2 py-1 rounded border border-white/5">
                                            <span className="text-gray-300 truncate mr-2">{a.name}</span>
                                            <span className="text-amber-500 font-medium whitespace-nowrap">+ {a.price.toFixed(2)}</span>
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
                                <span className="text-[10px] bg-black/40 border border-amber-500/30 text-white/90 px-2 py-0.5 rounded-md">
                                    {item.servingDetails.weightGrams}g
                                </span>
                            )}
                            {item.servingDetails?.pieceCount && (
                                <span className="text-[10px] bg-black/40 border border-amber-500/30 text-white/90 px-2 py-0.5 rounded-md">
                                    {item.servingDetails.pieceCount} Piece{item.servingDetails.pieceCount > 1 ? 's' : ''}
                                </span>
                            )}
                            {item.servingDetails?.skewerCount && item.servingDetails.skewerCount > 0 && (
                                <span className="text-[10px] bg-black/40 border border-amber-500/30 text-white/90 px-2 py-0.5 rounded-md">
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
            <main className="flex-1 w-full relative flex flex-col min-h-screen bg-black">

                {/* 1. Background Layer */}
                <div
                    className="fixed inset-0 z-0 opacity-100"
                    style={{
                        backgroundImage: 'url(/images/general/BG.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed'
                    }}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                </div>

                {/* 2. Header - Floating */}
                <div className="sticky top-0 z-50 px-4 pt-6 pb-2">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3">

                        {/* Top Bar */}
                        <div className="flex items-center justify-between">
                            <Link href="/" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                                <ArrowBack fontSize="small" />
                            </Link>
                            <span className="text-amber-500 font-bold tracking-widest text-sm uppercase">
                                Elfatatry Menu
                            </span>
                            <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <FilterList fontSize="small" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Categories - Collapsible Section */}
                <div className="sticky top-[80px] z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300">

                    {/* Toggle Header */}
                    <button
                        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                        className="w-full px-4 py-3 flex items-center justify-between text-white group"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">
                                Current View:
                            </span>
                            <span className="font-bold text-sm">
                                {activeCategoryName}
                            </span>
                        </div>
                        <div className={`
                            h-6 w-6 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300
                            ${isCategoriesOpen ? 'rotate-180 bg-amber-500 text-black' : 'group-hover:bg-white/20'}
                        `}>
                            <span className="text-[10px]">▼</span>
                        </div>
                    </button>

                    {/* Expandable Grid */}
                    <AnimatePresence>
                        {isCategoriesOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden border-t border-white/5"
                            >
                                <div className="p-4 pt-2">
                                    <div className="grid grid-cols-4 gap-2">
                                        <button
                                            onClick={() => {
                                                setActiveCategory("ALL");
                                                setIsCategoriesOpen(false);
                                            }}
                                            className={`
                                                px-2 py-2.5 rounded-xl text-[10px] font-bold tracking-wide transition-all duration-200 border uppercase flex items-center justify-center text-center
                                                ${activeCategory === "ALL"
                                                    ? 'bg-amber-500 text-black border-amber-500 shadow-lg'
                                                    : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:bg-white/10'}
                                            `}
                                        >
                                            All
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setActiveCategory(cat.id);
                                                    setIsCategoriesOpen(false);
                                                }}
                                                className={`
                                                    px-2 py-2.5 rounded-xl text-[10px] font-bold tracking-wide transition-all duration-200 border uppercase flex items-center justify-center text-center break-words leading-tight
                                                    ${activeCategory === cat.id
                                                        ? 'bg-amber-500 text-black border-amber-500 shadow-lg'
                                                        : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:bg-white/10'}
                                                `}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Menu Items List */}
                <div className="px-4 pb-24 z-10 flex-1 overflow-y-auto w-full max-w-full">
                    <div className="space-y-4">
                        <AnimatePresence mode="wait">
                            {activeCategory === "ALL" ? (
                                <div className="space-y-8 pt-2">
                                    {categories.map((cat) => {
                                        const catItems = items.filter(item =>
                                            item.categoryId === cat.id &&
                                            (searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        );

                                        if (catItems.length === 0) return null;

                                        return (
                                            <div key={cat.id} className="space-y-2">
                                                <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md py-3 -mx-4 px-4 border-b border-white/10 shadow-lg">
                                                    <h2 className="text-amber-500 font-bold text-lg border-l-4 border-amber-500 pl-3 tracking-wider uppercase">
                                                        {cat.name}
                                                    </h2>
                                                </div>
                                                <div className="space-y-4 pt-1">
                                                    {catItems.map((item, i) => (
                                                        <MenuItemCard key={item.id} item={item} index={i} />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Empty state for ALL view if search yields no results across all categories */}
                                    {items.filter(item => searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                        <div className="text-center py-20">
                                            <div className="text-white/30 text-6xl mb-4">🍽️</div>
                                            <h3 className="text-white/50 text-lg font-light">No items found</h3>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4 pt-2">
                                    {filteredItems.map((item, i) => (
                                        <MenuItemCard key={item.id} item={item} index={i} />
                                    ))}

                                    {filteredItems.length === 0 && (
                                        <div className="text-center py-20">
                                            <div className="text-white/30 text-6xl mb-4">🍽️</div>
                                            <h3 className="text-white/50 text-lg font-light">No items found in {categories.find(c => c.id === activeCategory)?.name}</h3>
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
