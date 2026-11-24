'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Add, ArrowBack, Close, Delete, Remove } from '@mui/icons-material';
import CloverCard, { type CloverCardHandle } from './CloverCard';
import { loadPickup, placeOrder } from '@/app/order/actions';
import { formatCents, type CartLine, type PickupInfo } from '@/lib/order-types';

interface Props {
    lines: CartLine[];
    taxRate: number;
    pickup: PickupInfo;
    clover: { publicKey: string; merchantId: string; sdkUrl: string };
    onChangeQty: (key: string, qty: number) => void;
    onRemove: (key: string) => void;
    onClear: () => void;
    onClose: () => void;
}

export default function CartSheet({ lines, taxRate, pickup: initialPickup, clover, onChangeQty, onRemove, onClear, onClose }: Props) {
    const router = useRouter();
    const cardRef = useRef<CloverCardHandle>(null);
    const [step, setStep] = useState<'cart' | 'pay'>('cart');
    const [pickup, setPickup] = useState<PickupInfo>(initialPickup);
    const [choice, setChoice] = useState<string>(initialPickup.asapLabel ? 'asap' : String(initialPickup.slots[0]?.minutes ?? ''));
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState(''); // honeypot
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subtotal = lines.reduce((s, l) => s + l.unitCents * l.qty, 0);
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('elf-customer') || '{}');
            if (saved.name) setName(saved.name);
            if (saved.phone) setPhone(saved.phone);
            if (saved.email) setEmail(saved.email);
        } catch { /* ignore */ }
    }, []);

    const goToPay = async () => {
        setError(null);
        const fresh = await loadPickup();
        setPickup(fresh);
        setChoice(fresh.asapLabel ? 'asap' : String(fresh.slots[0]?.minutes ?? ''));
        setStep('pay');
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);
        try {
            const card = await cardRef.current?.createToken();
            if (!card?.token) {
                setError(card?.error || 'Please check your card details.');
                return;
            }
            try { localStorage.setItem('elf-customer', JSON.stringify({ name, phone, email })); } catch { /* ignore */ }
            const result = await placeOrder({
                lines: lines.map((l) => ({ cloverId: l.cloverId, qty: l.qty, modifierIds: l.modifierIds, note: l.note })),
                customer: { name, phone, email },
                pickup: choice === 'asap' ? { asap: true } : { asap: false, minutes: Number(choice) },
                cardToken: card.token,
                website,
            });
            if (!result.ok) {
                setError(result.error || 'We could not place your order.');
                return;
            }
            onClear();
            router.push(`/order/${result.orderId}`);
        } finally {
            setSubmitting(false);
        }
    };

    const input = 'h-12 w-full rounded-control border border-border bg-surface px-3 text-base text-main-text placeholder:text-muted-text/60';

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label="Your order">
            <button className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Close" />
            <div className="relative flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-background md:rounded-card">
                <div className="flex items-center gap-2 border-b border-border p-4">
                    {step === 'pay' && (
                        <button onClick={() => setStep('cart')} className="flex h-11 w-11 items-center justify-center rounded-full text-main-text active:scale-95" aria-label="Back to cart"><ArrowBack /></button>
                    )}
                    <h2 className="flex-1 text-lg font-extrabold text-main-text">{step === 'cart' ? 'Your order' : 'Pickup & payment'}</h2>
                    <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-main-text active:scale-95" aria-label="Close"><Close /></button>
                </div>

                {step === 'cart' ? (
                    <>
                        <div className="flex-1 space-y-3 overflow-y-auto p-4">
                            {lines.length === 0 && <p className="py-10 text-center text-muted-text">Your cart is empty.</p>}
                            {lines.map((l) => (
                                <div key={l.key} className="rounded-card border border-border bg-surface p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-bold leading-tight text-main-text">{l.itemName}{l.variantLabel ? ` (${l.variantLabel})` : ''}</p>
                                            {l.modifierNames.length > 0 && <p className="mt-1 text-sm text-muted-text">{l.modifierNames.join(', ')}</p>}
                                            {l.note && <p className="mt-1 text-sm italic text-muted-text">“{l.note}”</p>}
                                        </div>
                                        <p className="shrink-0 font-bold text-accent-gold">{formatCents(l.unitCents * l.qty)}</p>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center rounded-full border border-border">
                                            <button onClick={() => onChangeQty(l.key, l.qty - 1)} className="flex h-10 w-10 items-center justify-center text-main-text" aria-label="Fewer"><Remove fontSize="small" /></button>
                                            <span className="w-6 text-center font-semibold text-main-text">{l.qty}</span>
                                            <button onClick={() => onChangeQty(l.key, l.qty + 1)} className="flex h-10 w-10 items-center justify-center text-main-text" aria-label="More"><Add fontSize="small" /></button>
                                        </div>
                                        <button onClick={() => onRemove(l.key)} className="flex h-10 items-center gap-1 px-2 text-sm text-muted-text hover:text-red-300"><Delete fontSize="small" /> Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3 border-t border-border p-4">
                            <Totals subtotal={subtotal} tax={tax} total={total} taxRate={taxRate} />
                            {!pickup.open && <p className="rounded-control border border-border bg-surface p-3 text-sm text-muted-text">{pickup.message}</p>}
                            <button onClick={goToPay} disabled={!lines.length || !pickup.open} className="h-14 w-full rounded-full bg-accent-gold font-bold text-background disabled:opacity-40 active:scale-[0.98]">
                                Continue to pickup & payment
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex-1 space-y-5 overflow-y-auto p-4">
                            {!pickup.open ? (
                                <p className="rounded-control border border-border bg-surface p-3 text-sm text-muted-text">{pickup.message}</p>
                            ) : (
                                <>
                                    <div className="grid gap-3">
                                        <div>
                                            <label htmlFor="o-name" className="mb-1 block text-xs font-semibold text-muted-text">Name</label>
                                            <input id="o-name" className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={60} />
                                        </div>
                                        <div>
                                            <label htmlFor="o-phone" className="mb-1 block text-xs font-semibold text-muted-text">Phone</label>
                                            <input id="o-phone" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" required maxLength={25} />
                                        </div>
                                        <div>
                                            <label htmlFor="o-email" className="mb-1 block text-xs font-semibold text-muted-text">Email (for your receipt)</label>
                                            <input id="o-email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" type="email" required maxLength={120} />
                                        </div>
                                        <div className="hidden" aria-hidden="true">
                                            <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="o-pickup" className="mb-1 block text-xs font-semibold text-muted-text">Pickup time (today)</label>
                                        <select id="o-pickup" className={input} value={choice} onChange={(e) => setChoice(e.target.value)}>
                                            {pickup.asapLabel && <option value="asap">ASAP ({pickup.asapLabel})</option>}
                                            {pickup.slots.map((s) => <option key={s.minutes} value={s.minutes}>{s.label}</option>)}
                                        </select>
                                        <p className="mt-1 text-xs text-muted-text">Pickup only. Please come to the counter and give your name.</p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-sm font-bold text-main-text">Card</p>
                                        <CloverCard ref={cardRef} publicKey={clover.publicKey} merchantId={clover.merchantId} sdkUrl={clover.sdkUrl} />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="space-y-3 border-t border-border p-4">
                            <Totals subtotal={subtotal} tax={tax} total={total} taxRate={taxRate} />
                            {error && <p role="alert" className="rounded-control border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
                            <button type="submit" disabled={submitting || !pickup.open} className="h-14 w-full rounded-full bg-accent-gold font-bold text-background disabled:opacity-40 active:scale-[0.98]">
                                {submitting ? 'Placing your order…' : `Pay ${formatCents(total)}`}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function Totals({ subtotal, tax, total, taxRate }: { subtotal: number; tax: number; total: number; taxRate: number }) {
    return (
        <dl className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-text"><dt>Subtotal</dt><dd>{formatCents(subtotal)}</dd></div>
            <div className="flex justify-between text-muted-text"><dt>HST ({Math.round(taxRate * 100)}%)</dt><dd>{formatCents(tax)}</dd></div>
            <div className="flex justify-between text-base font-extrabold text-main-text"><dt>Total</dt><dd>{formatCents(total)}</dd></div>
        </dl>
    );
}
