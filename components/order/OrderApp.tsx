'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ShoppingBag } from '@mui/icons-material';
import ItemSheet from './ItemSheet';
import CartSheet from './CartSheet';
import { formatCents, type CartLine, type OrderItem, type OrderMenu, type PickupInfo } from '@/lib/order-types';

interface Props {
    menu: OrderMenu;
    pickup: PickupInfo;
    clover: { publicKey: string; merchantId: string; sdkUrl: string };
    previewMode: boolean;
}

const CART_KEY = 'elf-cart-v1';

export default function OrderApp({ menu, pickup, clover, previewMode }: Props) {
    const [lines, setLines] = useState<CartLine[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [active, setActive] = useState(menu.categories[0]?.id || '');
    const [openItem, setOpenItem] = useState<OrderItem | null>(null);
    const [cartOpen, setCartOpen] = useState(false);

    const validIds = useMemo(() => {
        const set = new Set<string>();
        menu.categories.forEach((c) => c.items.forEach((i) => i.variants.forEach((v) => set.add(v.cloverId))));
        return set;
    }, [menu]);

    // Restore the cart for this device (dropping anything that is no longer on the menu)
    useEffect(() => {
        try {
            const saved: CartLine[] = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
            setLines(saved.filter((l) => validIds.has(l.cloverId)));
        } catch { /* ignore */ }
        setLoaded(true);
    }, [validIds]);

    useEffect(() => {
        if (!loaded) return;
        try { localStorage.setItem(CART_KEY, JSON.stringify(lines)); } catch { /* ignore */ }
    }, [lines, loaded]);

    useEffect(() => {
        document.body.style.overflow = openItem || cartOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [openItem, cartOpen]);

    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.unitCents * l.qty, 0);

    const addLine = (line: Omit<CartLine, 'key'>) => {
        setLines((prev) => {
            const same = prev.find((l) => l.cloverId === line.cloverId && l.note === line.note && l.modifierIds.slice().sort().join() === line.modifierIds.slice().sort().join());
            if (same) return prev.map((l) => (l === same ? { ...l, qty: Math.min(20, l.qty + line.qty) } : l));
            return [...prev, { ...line, key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }];
        });
        setOpenItem(null);
    };

    const jumpTo = (id: string) => {
        setActive(id);
        const el = document.getElementById(`cat-${id}`);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: 'smooth' });
    };

    return (
        <div className="pb-28">
            {previewMode && (
                <div className="bg-accent-gold px-4 py-2 text-center text-sm font-bold text-background">
                    Admin preview: customers can&apos;t see ordering yet. Orders placed here are REAL and use a real card.
                </div>
            )}

            {/* Pickup banner */}
            <div className="border-b border-border bg-surface/60 px-4 py-3 text-center text-sm text-main-text/90">
                {pickup.open ? (
                    <>Pickup only · {pickup.asapLabel ? `ready in ${pickup.asapLabel}` : 'choose a pickup time later today'} · prices before tax</>
                ) : (
                    <span className="font-semibold text-accent-gold">{pickup.message}</span>
                )}
            </div>

            {/* Category chips */}
            <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur md:top-20">
                <div className="no-scrollbar mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3">
                    {menu.categories.map((c) => (
                        <button key={c.id} onClick={() => jumpTo(c.id)}
                            className={`h-11 shrink-0 rounded-full border px-4 text-sm font-bold active:scale-95 ${active === c.id ? 'border-accent-gold bg-accent-gold text-background' : 'border-border bg-surface text-main-text'}`}>
                            {c.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mx-auto max-w-3xl space-y-10 px-4 pt-6">
                {menu.categories.map((cat) => (
                    <section key={cat.id} id={`cat-${cat.id}`} aria-label={cat.name}>
                        <h2 className="mb-3 text-xl font-extrabold capitalize text-main-text">{cat.name}</h2>
                        <div className="grid gap-3">
                            {cat.items.map((item) => {
                                const from = Math.min(...item.variants.map((v) => v.priceCents));
                                return (
                                    <button key={item.id} onClick={() => setOpenItem(item)}
                                        className="flex gap-3 rounded-card border border-border bg-surface p-3 text-left transition-colors active:scale-[0.99] hover:border-accent-gold/50">
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-surface-elevated">
                                            {item.image && <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />}
                                        </div>
                                        <div className="min-w-0 flex-1 py-0.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="font-bold leading-tight text-main-text">{item.name}</h3>
                                                <span className="shrink-0 text-right font-bold text-accent-gold">
                                                    {item.variants.length > 1 && <span className="block text-[10px] uppercase tracking-wider text-muted-text">From</span>}
                                                    {formatCents(from)}
                                                </span>
                                            </div>
                                            {item.description && <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-text">{item.description}</p>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                ))}
                {!menu.categories.length && <p className="py-20 text-center text-muted-text">The online menu is being prepared. Please check back soon.</p>}
            </div>

            {/* Cart bar */}
            {count > 0 && !openItem && !cartOpen && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur">
                    <button onClick={() => setCartOpen(true)} className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between rounded-full bg-accent-gold px-6 font-bold text-background active:scale-[0.99]">
                        <span className="flex items-center gap-2"><ShoppingBag fontSize="small" /> View order ({count})</span>
                        <span>{formatCents(subtotal)}</span>
                    </button>
                </div>
            )}

            {openItem && <ItemSheet item={openItem} onClose={() => setOpenItem(null)} onAdd={addLine} />}
            {cartOpen && (
                <CartSheet
                    lines={lines}
                    taxRate={menu.taxRate}
                    pickup={pickup}
                    clover={clover}
                    onChangeQty={(key, qty) => setLines((prev) => (qty < 1 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(20, qty) } : l))))}
                    onRemove={(key) => setLines((prev) => prev.filter((l) => l.key !== key))}
                    onClear={() => { setLines([]); setCartOpen(false); }}
                    onClose={() => setCartOpen(false)}
                />
            )}
        </div>
    );
}
