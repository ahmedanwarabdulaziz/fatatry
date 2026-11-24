'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, FormControlLabel, MenuItem, Paper, Select, Stack, Switch, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getOrdersData, retryDelivery, setFulfilment, setOrderingPaused, AdminOrder } from './actions';

const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const STAGES = ['new', 'preparing', 'ready', 'picked-up', 'cancelled'] as const;

export default function AdminOrdersPage() {
    const [data, setData] = useState<{ orders: AdminOrder[]; paused: boolean; switchedOn: boolean } | null>(null);
    const [busy, setBusy] = useState(false);

    const load = async () => setData(await getOrdersData());

    useEffect(() => {
        load();
        const timer = setInterval(load, 30_000); // new orders appear without refreshing
        return () => clearInterval(timer);
    }, []);

    if (!data) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Online Orders</Typography>
                    <Typography color="text.secondary">Refreshes every 30 seconds. Orders also appear in Clover.</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControlLabel
                        control={
                            <Switch
                                checked={data.paused}
                                disabled={busy}
                                onChange={async (e) => { setBusy(true); await setOrderingPaused(e.target.checked); await load(); setBusy(false); }}
                            />
                        }
                        label="Pause online orders"
                    />
                    <Button startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
                </Stack>
            </Stack>

            {!data.switchedOn && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Online ordering is <b>not public yet</b>. Only signed-in admins can use /order. To launch, set ORDERING_ENABLED=true on the server.
                </Alert>
            )}
            {data.paused && <Alert severity="warning" sx={{ mb: 2 }}>Online ordering is paused. Customers see a call-us message.</Alert>}

            <Stack spacing={2}>
                {data.orders.length === 0 && <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No orders yet.</Paper>}
                {data.orders.map((o) => (
                    <Paper key={o.id} sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                    <Typography variant="h6" fontWeight={700}>{o.orderCode}</Typography>
                                    <Chip size="small" color={o.status === 'paid' ? 'success' : o.status === 'failed' ? 'error' : 'default'} label={o.status} />
                                    {o.placedByAdmin && <Chip size="small" variant="outlined" label="test / admin" />}
                                    {o.delivery && <Chip size="small" color="info" label="DELIVERY" />}
                                    <Typography color="text.secondary" variant="body2">{new Date(o.createdAt).toLocaleString('en-CA', { timeZone: 'America/Toronto' })}</Typography>
                                </Stack>
                                <Typography sx={{ mt: 0.5 }}><b>{o.delivery ? 'Ready for courier: ' : 'Pickup: '}{o.pickupLabel}</b> · {o.customer.name} · {o.customer.phone}</Typography>
                                {o.delivery && (
                                    <Typography sx={{ mt: 0.5 }} color="text.secondary">
                                        To: {o.delivery.address} · Uber status: <b>{o.delivery.status || 'unknown'}</b>
                                        {o.delivery.courier ? ' · Courier: ' + o.delivery.courier : ''}
                                        {o.delivery.trackingUrl && <> · <a href={o.delivery.trackingUrl} target="_blank" rel="noopener noreferrer">Track</a></>}
                                    </Typography>
                                )}
                            </Box>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="h6" fontWeight={700}>{money(o.totalCents)}</Typography>
                                {o.status === 'paid' && (
                                    <Select size="small" value={o.fulfilment} onChange={async (e) => { await setFulfilment(o.id, e.target.value as (typeof STAGES)[number]); await load(); }}>
                                        {STAGES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </Select>
                                )}
                            </Stack>
                        </Stack>
                        <Box component="ul" sx={{ m: 0, mt: 1, pl: 3 }}>
                            {o.lines.map((l, i) => (
                                <li key={i}>
                                    {l.qty} × {l.name}{l.variant ? ` (${l.variant})` : ''}
                                    {l.options?.length ? ` — ${l.options.join(', ')}` : ''}
                                    {l.note ? ` — “${l.note}”` : ''}
                                </li>
                            ))}
                        </Box>
                        {o.failure && <Alert severity="error" sx={{ mt: 1 }}>{o.failure}</Alert>}
                        {o.delivery && (o.delivery.canRetry || o.delivery.error) && (
                            <Alert severity="error" sx={{ mt: 1 }}
                                action={o.delivery.canRetry ? (
                                    <Button color="inherit" size="small" onClick={async () => { const r = await retryDelivery(o.id); if (!r.ok) alert(r.error); await load(); }}>Book courier again</Button>
                                ) : undefined}>
                                The customer has PAID but no Uber courier is booked. Book again, or call the customer.{o.delivery.error ? ' Last error: ' + o.delivery.error : ''}
                            </Alert>
                        )}
                        {o.printError && <Alert severity="warning" sx={{ mt: 1 }}>Kitchen print failed: {o.printError}</Alert>}
                        {o.followUpError && <Alert severity="warning" sx={{ mt: 1 }}>Paid, but a follow-up step failed: {o.followUpError}</Alert>}
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
}
