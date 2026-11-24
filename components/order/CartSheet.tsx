'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Add, ArrowBack, Close, Delete, Remove } from '@mui/icons-material';
import CloverCard, { type CloverCardHandle } from './CloverCard';
import { getDeliveryQuote, loadPickup, placeOrder } from '@/app/order/actions';
import { POSTAL_CODE } from '@/lib/delivery-config';
import { formatCents, type CartLine, type Fulfilment, type PickupInfo } from '@/lib/order-types';

interface Props {
    lines: CartLine[];
    taxRate: number;
    pickup: PickupInfo;
    clover: { publicKey: string; merchantId: string; sdkUrl: string };
    delivery: { available: boolean; minOrderCents: number; taxFee: boolean };
    onChangeQty: (key: string, qty: number) => void;
    onRemove: (key: string) => void;
    onClear: () => void;
    onClose: () => void;
}

type Quote = { state: 'idle' } | { state: 'loading' } | { state: 'ok'; feeCents: number; eta: number } | { state: 'error'; message: string };

export default function CartSheet({ lines, taxRate, pickup: initialPickup, clover, delivery, onChangeQty, onRemove, onClear, onClose }: Props) {
    const router = useRouter();
    const cardRef = useRef<CloverCardHandle>(null);
    const [step, setStep] = useState<'cart' | 'pay'>('cart');
    const [mode, setMode] = useState<Fulfilment>('pickup');
    const [pickup, setPickup] = useState<PickupInfo>(initialPickup);
    const [choice, setChoice] = useState<string>(initialPickup.asapLabel ? 'asap' : String(initialPickup.slots[0]?.minutes ?? ''));
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState('');
    const [unit, setUnit] = useState('');
    const [city, setCity] = useState('Mississauga');
    const [postal, setPostal] = useState('');
    const [notes, setNotes] = useState('');
    const [quote, setQuote] = useState<Quote>({ state: 'idle' });
    const [website, setWebsite] = useState(''); // honeypot
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isDelivery = mode === 'delivery';
    const subtotal = lines.reduce((s, l) => s + l.unitCents * l.qty, 0);
    const fee = isDelivery && quote.state === 'ok' ? quote.feeCents : 0;
    const feeTax = delivery.taxFee ? Math.round(fee * taxRate) : 0;
    const tax = Math.round(subtotal * taxRate) + feeTax;
    const total = subtotal + fee + tax;
    const belowMinimum = isDelivery && subtotal < delivery.minOrderCents;
    const addressReady = street.trim().length >= 3 && POSTAL_CODE.test(postal.trim());

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('elf-customer') || '{}');
            if (saved.name) setName(saved.name);
            if (saved.phone) setPhone(saved.phone);
            if (saved.email) setEmail(saved.email);
            const a = JSON.parse(localStorage.getItem('elf-address') || '{}');
            if (a.street) setStreet(a.street);
            if (a.unit) setUnit(a.unit);
            if (a.city) setCity(a.city);
            if (a.postal) setPostal(a.postal);
        } catch { /* ignore */ }
    }, []);

    // Ask for the delivery fee once the address looks complete (waits for the customer to stop typing)
    useEffect(() => {
        if (!isDelivery) return;
        if (!addressReady) { setQuote({ state: 'idle' }); return; }
        let cancelled = false;
        setQuote({ state: 'loading' });
        const timer = setTimeout(async () => {
            const r = await getDeliveryQuote({ address: { street, unit, city, postalCode: postal, notes: '' }, phone, subtotalCents: subtotal });
            if (cancelled) return;
            setQuote(r.ok ? { state: 'ok', feeCents: r.feeCents ?? 0, eta: r.etaMinutes ?? 0 } : { state: 'error', message: r.error || "We can't deliver to that address." });
        }, 700);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [isDelivery, addressReady, street, unit, city, postal, subtotal, phone]);

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
        if (isDelivery && quote.state !== 'ok') {
            setError('Please enter your delivery address and wait for the delivery fee to appear.');
            return;
        }
        setSubmitting(true);
        try {
            const card = await cardRef.current?.createToken();
            if (!card?.token) {
                setError(card?.error || 'Please check your card details.');
                return;
            }
            try {
                localStorage.setItem('elf-customer', JSON.stringify({ name, phone, email }));
                if (isDelivery) localStorage.setItem('elf-address', JSON.stringify({ street, unit, city, postal }));
            } catch { /* ignore */ }
            const result = await placeOrder({
                lines: lines.map((l) => ({ cloverId: l.cloverId, qty: l.qty, modifierIds: l.modifierIds, note: l.note })),
                customer: { name, phone, email },
                pickup: choice === 'asap' ? { asap: true } : { asap: false, minutes: Number(choice) },
                cardToken: card.token,
                website,
                fulfilment: mode,
                delivery: isDelivery ? { street, unit, city, postalCode: postal, notes } : undefined,
                expectedFeeCents: isDelivery && quote.state === 'ok' ? quote.feeCents : undefined,
            });
            if (!result.ok) {
                if (typeof result.feeChangedTo === 'number') setQuote((q) => (q.state === 'ok' ? { ...q, feeCents: result.feeChangedTo as number } : q));
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
    const label = 'mb-1 block text-xs font-semibold text-muted-text';

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label="Your order">
            <button className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Close" />
            <div className="relative flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-background md:rounded-card">
                <div className="flex items-center gap-2 border-b border-border p-4">
                    {step === 'pay' && (
                        <button onClick={() => setStep('cart')} className="flex h-11 w-11 items-center justify-center rounded-full text-main-text active:scale-95" aria-label="Back to cart"><ArrowBack /></button>
                    )}
                    <h2 className="flex-1 text-lg font-extrabold text-main-text">{step === 'cart' ? 'Your order' : isDelivery ? 'Delivery & payment' : 'Pickup & payment'}</h2>
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
                            <Totals subtotal={subtotal} fee={0} tax={Math.round(subtotal * taxRate)} total={subtotal + Math.round(subtotal * taxRate)} taxRate={taxRate} />
                            {!pickup.open && <p className="rounded-control border border-border bg-surface p-3 text-sm text-muted-text">{pickup.message}</p>}
                            <button onClick={goToPay} disabled={!lines.length || !pickup.open} className="h-14 w-full rounded-full bg-accent-gold font-bold text-background disabled:opacity-40 active:scale-[0.98]">
                                Continue to checkout
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
                                    {delivery.available && (
                                        <div className="grid grid-cols-2 gap-2 rounded-full border border-border bg-surface p-1" role="group" aria-label="Pickup or delivery">
                                            {(['pickup', 'delivery'] as const).map((m) => (
                                                <button key={m} type="button" onClick={() => setMode(m)}
                                                    className={`h-11 rounded-full text-sm font-bold ${mode === m ? 'bg-accent-gold text-background' : 'text-main-text'}`}>
                                                    {m === 'pickup' ? 'Pickup' : 'Delivery'}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid gap-3">
                                        <div>
                                            <label htmlFor="o-name" className={label}>Name</label>
                                            <input id="o-name" className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={60} />
                                        </div>
                                        <div>
                                            <label htmlFor="o-phone" className={label}>Phone</label>
                                            <input id="o-phone" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" required maxLength={25} />
                                        </div>
                                        <div>
                                            <label htmlFor="o-email" className={label}>Email (for your receipt)</label>
                                            <input id="o-email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" type="email" required maxLength={120} />
                                        </div>
                                        <div className="hidden" aria-hidden="true">
                                            <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
                                        </div>
                                    </div>

                                    {isDelivery && (
                                        <div className="grid gap-3">
                                            <p className="text-sm font-bold text-main-text">Delivery address</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="col-span-2">
                                                    <label htmlFor="o-street" className={label}>Street address</label>
                                                    <input id="o-street" className={input} value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="address-line1" required maxLength={80} placeholder="123 Main St" />
                                                </div>
                                                <div>
                                                    <label htmlFor="o-unit" className={label}>Unit</label>
                                                    <input id="o-unit" className={input} value={unit} onChange={(e) => setUnit(e.target.value)} autoComplete="address-line2" maxLength={15} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label htmlFor="o-city" className={label}>City</label>
                                                    <input id="o-city" className={input} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" required maxLength={40} />
                                                </div>
                                                <div>
                                                    <label htmlFor="o-postal" className={label}>Postal code</label>
                                                    <input id="o-postal" className={input} value={postal} onChange={(e) => setPostal(e.target.value.toUpperCase())} autoComplete="postal-code" required maxLength={7} placeholder="L5M 1K7" />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="o-notes" className={label}>Delivery instructions (optional)</label>
                                                <input id="o-notes" className={input} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={200} placeholder="Buzzer code, leave at door, etc." />
                                            </div>
                                            {belowMinimum && (
                                                <p className="rounded-control border border-accent-gold/40 bg-accent-gold/10 p-3 text-sm text-main-text">
                                                    Delivery needs a minimum order of {formatCents(delivery.minOrderCents)} before tax. Add {formatCents(delivery.minOrderCents - subtotal)} more, or choose pickup.
                                                </p>
                                            )}
                                            {quote.state === 'loading' && <p className="text-sm text-muted-text">Checking delivery to your address…</p>}
                                            {quote.state === 'ok' && (
                                                <p className="rounded-control border border-border bg-surface p-3 text-sm text-main-text">
                                                    Delivery fee <b>{formatCents(quote.feeCents)}</b>{quote.eta > 0 && <> · about {quote.eta} minutes</>}
                                                </p>
                                            )}
                                            {quote.state === 'error' && <p role="alert" className="rounded-control border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{quote.message}</p>}
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="o-pickup" className={label}>{isDelivery ? 'Ready for the courier at (today)' : 'Pickup time (today)'}</label>
                                        <select id="o-pickup" className={input} value={choice} onChange={(e) => setChoice(e.target.value)}>
                                            {pickup.asapLabel && <option value="asap">ASAP ({pickup.asapLabel})</option>}
                                            {pickup.slots.map((s) => <option key={s.minutes} value={s.minutes}>{s.label}</option>)}
                                        </select>
                                        <p className="mt-1 text-xs text-muted-text">
                                            {isDelivery ? 'An Uber courier collects your order from us at this time. You can follow your delivery after you order.' : 'Pickup only. Please come to the counter and give your name.'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-sm font-bold text-main-text">Card</p>
                                        <CloverCard ref={cardRef} publicKey={clover.publicKey} merchantId={clover.merchantId} sdkUrl={clover.sdkUrl} />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="space-y-3 border-t border-border p-4">
                            <Totals subtotal={subtotal} fee={isDelivery ? fee : 0} tax={tax} total={total} taxRate={taxRate} showFee={isDelivery} />
                            {error && <p role="alert" className="rounded-control border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
                            <button type="submit" disabled={submitting || !pickup.open || belowMinimum || (isDelivery && quote.state !== 'ok')}
                                className="h-14 w-full rounded-full bg-accent-gold font-bold text-background disabled:opacity-40 active:scale-[0.98]">
                                {submitting ? 'Placing your order…' : `Pay ${formatCents(total)}`}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function Totals({ subtotal, fee, tax, total, taxRate, showFee = false }: { subtotal: number; fee: number; tax: number; total: number; taxRate: number; showFee?: boolean }) {
    return (
        <dl className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-text"><dt>Subtotal</dt><dd>{formatCents(subtotal)}</dd></div>
            {showFee && <div className="flex justify-between text-muted-text"><dt>Delivery fee</dt><dd>{fee > 0 ? formatCents(fee) : '—'}</dd></div>}
            <div className="flex justify-between text-muted-text"><dt>HST ({Math.round(taxRate * 100)}%)</dt><dd>{formatCents(tax)}</dd></div>
            <div className="flex justify-between text-base font-extrabold text-main-text"><dt>Total</dt><dd>{formatCents(total)}</dd></div>
        </dl>
    );
}
