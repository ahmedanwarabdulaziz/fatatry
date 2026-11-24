'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

// Card number, expiry, CVV and postal code are Clover-hosted fields: the card details go
// straight to Clover and never pass through our server. We only receive a one-time token.

declare global {
    interface Window {
        Clover?: new (key: string, opts: { merchantId: string; locale?: string }) => any;
    }
}

export interface CloverCardHandle {
    createToken(): Promise<{ token?: string; error?: string }>;
}

interface Props {
    publicKey: string;
    merchantId: string;
    sdkUrl: string;
}

const FIELDS = [
    { type: 'CARD_NUMBER', id: 'clover-card-number', label: 'Card number', span: 'col-span-2' },
    { type: 'CARD_DATE', id: 'clover-card-date', label: 'Expiry', span: '' },
    { type: 'CARD_CVV', id: 'clover-card-cvv', label: 'CVV', span: '' },
    { type: 'CARD_POSTAL_CODE', id: 'clover-card-postal', label: 'Postal code', span: 'col-span-2' },
] as const;

const CloverCard = forwardRef<CloverCardHandle, Props>(function CloverCard({ publicKey, merchantId, sdkUrl }, ref) {
    const cloverRef = useRef<any>(null);
    const [ready, setReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        let cancelled = false;

        const init = () => {
            if (cancelled || !window.Clover) return;
            try {
                const clover = new window.Clover(publicKey, { merchantId, locale: 'en-CA' });
                const elements = clover.elements();
                const style = { body: { fontFamily: 'Arial, sans-serif', fontSize: '16px' }, input: { fontSize: '16px' } };
                FIELDS.forEach((f) => {
                    const el = elements.create(f.type, style);
                    el.mount(`#${f.id}`);
                    el.addEventListener('change', (event: any) => {
                        const state = event?.[f.type];
                        setFieldErrors((prev) => ({ ...prev, [f.type]: state?.error || '' }));
                    });
                });
                cloverRef.current = clover;
                setReady(true);
            } catch {
                setLoadError('The secure card form could not start. Please refresh the page or call us to order.');
            }
        };

        if (window.Clover) {
            init();
        } else {
            const existing = document.querySelector<HTMLScriptElement>(`script[src="${sdkUrl}"]`);
            const script = existing || document.createElement('script');
            script.addEventListener('load', init);
            script.addEventListener('error', () => !cancelled && setLoadError('The secure card form could not load. Please check your connection or call us to order.'));
            if (!existing) {
                script.src = sdkUrl;
                script.async = true;
                document.body.appendChild(script);
            }
        }
        return () => {
            cancelled = true;
        };
    }, [publicKey, merchantId, sdkUrl]);

    useImperativeHandle(ref, () => ({
        async createToken() {
            if (!cloverRef.current) return { error: 'The card form is not ready yet.' };
            try {
                const result = await cloverRef.current.createToken();
                if (result?.errors) {
                    const first = Object.values(result.errors as Record<string, string>)[0];
                    return { error: first ? String(first) : 'Please check your card details.' };
                }
                if (!result?.token) return { error: 'Please check your card details.' };
                return { token: String(result.token) };
            } catch {
                return { error: 'Please check your card details.' };
            }
        },
    }));

    if (loadError) return <p className="rounded-control border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{loadError}</p>;

    return (
        <div>
            <div className="grid grid-cols-2 gap-3">
                {FIELDS.map((f) => (
                    <div key={f.id} className={f.span}>
                        <label htmlFor={f.id} className="mb-1 block text-xs font-semibold text-muted-text">{f.label}</label>
                        <div id={f.id} className="h-12 rounded-control border border-border bg-white px-3 py-2" />
                        {fieldErrors[f.type] && <p className="mt-1 text-xs text-red-300">{fieldErrors[f.type]}</p>}
                    </div>
                ))}
            </div>
            {!ready && <p className="mt-2 text-xs text-muted-text">Loading secure card form…</p>}
            <p className="mt-3 text-xs text-muted-text">🔒 Card details are entered into Clover&apos;s secure fields. We never see or store your card number.</p>
        </div>
    );
});

export default CloverCard;
