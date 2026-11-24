'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Add, Close, Remove } from '@mui/icons-material';
import { formatCents, type CartLine, type OrderItem } from '@/lib/order-types';

interface Props {
    item: OrderItem;
    onClose: () => void;
    onAdd: (line: Omit<CartLine, 'key'>) => void;
}

export default function ItemSheet({ item, onClose, onAdd }: Props) {
    const [variantIndex, setVariantIndex] = useState(0);
    const [chosen, setChosen] = useState<Record<string, string[]>>({});
    const [qty, setQty] = useState(1);
    const [note, setNote] = useState('');
    const [showErrors, setShowErrors] = useState(false);

    const variant = item.variants[variantIndex];

    const toggle = (groupId: string, modId: string, max: number) => {
        setChosen((prev) => {
            const current = prev[groupId] || [];
            if (current.includes(modId)) return { ...prev, [groupId]: current.filter((x) => x !== modId) };
            if (max === 1) return { ...prev, [groupId]: [modId] };
            if (max > 1 && current.length >= max) return prev;
            return { ...prev, [groupId]: [...current, modId] };
        });
    };

    const unitCents = useMemo(() => {
        let sum = variant.priceCents;
        for (const g of variant.groups) for (const m of g.modifiers) if ((chosen[g.id] || []).includes(m.id)) sum += m.priceCents;
        return sum;
    }, [variant, chosen]);

    const missing = variant.groups.filter((g) => (chosen[g.id] || []).length < g.min);

    const add = () => {
        if (missing.length) {
            setShowErrors(true);
            return;
        }
        const ids: string[] = [];
        const names: string[] = [];
        for (const g of variant.groups) for (const m of g.modifiers) if ((chosen[g.id] || []).includes(m.id)) { ids.push(m.id); names.push(m.name); }
        onAdd({
            cloverId: variant.cloverId,
            qty,
            modifierIds: ids,
            note: note.trim() || undefined,
            itemName: item.name,
            variantLabel: variant.label,
            modifierNames: names,
            unitCents,
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={item.name}>
            <button className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Close" />
            <div className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-background md:rounded-card">
                <div className="flex items-start gap-3 border-b border-border p-4">
                    {item.image && (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-control bg-surface-elevated">
                            <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-extrabold leading-tight text-main-text">{item.name}</h2>
                        {item.description && <p className="mt-1 line-clamp-3 text-sm text-muted-text">{item.description}</p>}
                    </div>
                    <button onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-main-text active:scale-95" aria-label="Close">
                        <Close />
                    </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto p-4">
                    {item.variants.length > 1 && (
                        <fieldset>
                            <legend className="mb-2 text-sm font-bold text-main-text">Size</legend>
                            <div className="grid gap-2">
                                {item.variants.map((v, i) => (
                                    <label key={v.cloverId} className={`flex min-h-[48px] cursor-pointer items-center justify-between rounded-control border px-4 ${i === variantIndex ? 'border-accent-gold bg-accent-gold/10' : 'border-border bg-surface'}`}>
                                        <span className="flex items-center gap-3 text-main-text">
                                            <input type="radio" name="variant" checked={i === variantIndex} onChange={() => { setVariantIndex(i); setChosen({}); }} className="accent-[#D4AF37]" />
                                            {v.label || item.name}
                                        </span>
                                        <span className="font-bold text-accent-gold">{formatCents(v.priceCents)}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    {variant.groups.map((g) => {
                        const selected = chosen[g.id] || [];
                        const required = g.min > 0;
                        const hint = g.max === 1 ? 'Choose 1' : g.max > 1 ? `Choose up to ${g.max}` : 'Choose any';
                        const isMissing = showErrors && selected.length < g.min;
                        return (
                            <fieldset key={g.id}>
                                <legend className="mb-2 flex w-full items-baseline justify-between text-sm font-bold text-main-text">
                                    <span>{g.name}</span>
                                    <span className={`text-xs font-semibold ${isMissing ? 'text-red-300' : 'text-muted-text'}`}>{required ? `Required · ${hint}` : `Optional · ${hint}`}</span>
                                </legend>
                                <div className="grid gap-2">
                                    {g.modifiers.map((m) => {
                                        const on = selected.includes(m.id);
                                        return (
                                            <label key={m.id} className={`flex min-h-[48px] cursor-pointer items-center justify-between rounded-control border px-4 ${on ? 'border-accent-gold bg-accent-gold/10' : 'border-border bg-surface'}`}>
                                                <span className="flex items-center gap-3 text-main-text">
                                                    <input
                                                        type={g.max === 1 ? 'radio' : 'checkbox'}
                                                        name={g.id}
                                                        checked={on}
                                                        onChange={() => toggle(g.id, m.id, g.max)}
                                                        onClick={() => g.max === 1 && on && !required && toggle(g.id, m.id, g.max)}
                                                        className="accent-[#D4AF37]"
                                                    />
                                                    {m.name}
                                                </span>
                                                {m.priceCents > 0 && <span className="text-sm font-semibold text-muted-text">+{formatCents(m.priceCents)}</span>}
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        );
                    })}

                    <div>
                        <label htmlFor="item-note" className="mb-2 block text-sm font-bold text-main-text">Special instructions <span className="font-normal text-muted-text">(optional)</span></label>
                        <textarea id="item-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} rows={2} placeholder="Allergies or requests for the kitchen"
                            className="w-full rounded-control border border-border bg-surface p-3 text-base text-main-text placeholder:text-muted-text/60" />
                        <p className="mt-1 text-xs text-muted-text">For allergies, please also call us to confirm.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t border-border p-4">
                    <div className="flex items-center rounded-full border border-border">
                        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-12 w-12 items-center justify-center text-main-text active:scale-95" aria-label="Fewer"><Remove fontSize="small" /></button>
                        <span className="w-6 text-center font-bold text-main-text">{qty}</span>
                        <button onClick={() => setQty((q) => Math.min(20, q + 1))} className="flex h-12 w-12 items-center justify-center text-main-text active:scale-95" aria-label="More"><Add fontSize="small" /></button>
                    </div>
                    <button onClick={add} className="h-12 flex-1 rounded-full bg-accent-gold font-bold text-background active:scale-[0.98]">
                        Add to order · {formatCents(unitCents * qty)}
                    </button>
                </div>
            </div>
        </div>
    );
}
