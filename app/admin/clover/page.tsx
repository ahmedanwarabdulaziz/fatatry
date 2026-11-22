'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Alert, Autocomplete, Box, Button, Chip, CircularProgress, Paper, Stack, Tab, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Tabs, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { getCloverLinkData, saveCloverLink, saveCloverLinks, CloverLinkData, LinkRow } from './actions';
import type { CloverItemLite } from '@/lib/clover-match';

type View = 'review' | 'linked' | 'all';
type Menu = 'all' | 'dine-in' | 'catering';

const money = (n: number) => `$${n.toFixed(2)}`;

export default function CloverLinksPage() {
    const [data, setData] = useState<CloverLinkData | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [view, setView] = useState<View>('review');
    const [menu, setMenu] = useState<Menu>('all');
    const [search, setSearch] = useState('');
    const [picked, setPicked] = useState<Record<string, string | null>>({});
    const [message, setMessage] = useState<string | null>(null);

    const load = async (refresh = false) => {
        setLoading(true);
        const d = await getCloverLinkData(refresh);
        setData(d);
        setPicked({});
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const cloverById = useMemo(() => new Map((data?.cloverItems || []).map((c) => [c.id, c])), [data]);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (data?.rows || []).filter((r) => {
            if (view === 'review' && r.linkedId) return false;
            if (view === 'linked' && !r.linkedId) return false;
            if (menu === 'dine-in' && r.catering) return false;
            if (menu === 'catering' && !r.catering) return false;
            return !q || r.name.toLowerCase().includes(q) || r.categoryName.toLowerCase().includes(q);
        });
    }, [data, view, menu, search]);

    const total = data?.rows.length || 0;
    const linked = data?.rows.filter((r) => r.linkedId).length || 0;
    const strongPending = (data?.rows || []).filter((r) => !r.linkedId && r.strong);

    const updateRows = (changes: { key: string; linkedId: string | null }[]) => {
        setData((d) => d && { ...d, rows: d.rows.map((r) => {
            const c = changes.find((x) => x.key === r.key);
            return c ? { ...r, linkedId: c.linkedId } : r;
        }) });
    };

    const selectedFor = (r: LinkRow): string | null =>
        r.key in picked ? picked[r.key] : r.linkedId || r.suggestions[0]?.cloverId || null;

    const link = async (r: LinkRow) => {
        const id = selectedFor(r);
        if (!id) return;
        setBusy(true);
        await saveCloverLink(r.itemId, r.sizeName, id);
        updateRows([{ key: r.key, linkedId: id }]);
        setBusy(false);
    };

    const unlink = async (r: LinkRow) => {
        setBusy(true);
        await saveCloverLink(r.itemId, r.sizeName, null);
        updateRows([{ key: r.key, linkedId: null }]);
        setPicked((p) => {
            const next = { ...p };
            delete next[r.key]; // fall back to the suggestion
            return next;
        });
        setBusy(false);
    };

    const acceptStrong = async () => {
        setBusy(true);
        const links = strongPending.map((r) => ({ itemId: r.itemId, sizeName: r.sizeName, cloverId: r.suggestions[0].cloverId }));
        const n = await saveCloverLinks(links);
        updateRows(strongPending.map((r) => ({ key: r.key, linkedId: r.suggestions[0].cloverId })));
        setMessage(`Linked ${n} items with exact price and name matches.`);
        setBusy(false);
    };

    const optionLabel = (c: CloverItemLite) => `${c.name} · ${money(c.price)}${c.categories.length ? ` · ${c.categories.join(', ')}` : ' · (no category)'}`;

    const optionsFor = (r: LinkRow): CloverItemLite[] => {
        const suggested = r.suggestions.map((s) => cloverById.get(s.cloverId)).filter((c): c is CloverItemLite => !!c);
        const rest = (data?.cloverItems || []).filter((c) => !r.suggestions.some((s) => s.cloverId === c.id)).sort((a, b) => a.name.localeCompare(b.name));
        return [...suggested, ...rest];
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    }

    if (!data?.configured) {
        return <Alert severity="warning">Clover is not connected. Add CLOVER_MERCHANT_ID and CLOVER_API_TOKEN to the server settings.</Alert>;
    }
    if (data.error) {
        return <Alert severity="error" action={<Button onClick={() => load(true)}>Retry</Button>}>Could not read from Clover: {data.error}</Alert>;
    }

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Clover Links</Typography>
                    <Typography color="text.secondary">
                        Link each website menu item to its Clover item, so online orders use Clover&apos;s prices and options.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button startIcon={<RefreshIcon />} onClick={() => load(true)} disabled={busy}>Refresh from Clover</Button>
                    <Button variant="contained" startIcon={<DoneAllIcon />} onClick={acceptStrong} disabled={busy || !strongPending.length}>
                        Accept {strongPending.length} exact matches
                    </Button>
                </Stack>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                <Chip color={linked === total ? 'success' : 'default'} label={`${linked} of ${total} linked`} />
                <Chip variant="outlined" label={`${strongPending.length} exact matches ready`} />
                <Chip variant="outlined" label={`${data.cloverItems.length} Clover items`} />
            </Stack>

            {message && <Alert severity="success" onClose={() => setMessage(null)} sx={{ mb: 2 }}>{message}</Alert>}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
                <Tabs value={view} onChange={(_, v) => setView(v)}>
                    <Tab value="review" label="Needs linking" />
                    <Tab value="linked" label="Linked" />
                    <Tab value="all" label="All" />
                </Tabs>
                <ToggleButtonGroup size="small" exclusive value={menu} onChange={(_, v) => v && setMenu(v)}>
                    <ToggleButton value="all">All menus</ToggleButton>
                    <ToggleButton value="dine-in">Dine-in</ToggleButton>
                    <ToggleButton value="catering">Catering</ToggleButton>
                </ToggleButtonGroup>
                <TextField size="small" placeholder="Search items" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 220 }} />
            </Stack>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '30%' }}>Website item</TableCell>
                            <TableCell>Clover item</TableCell>
                            <TableCell sx={{ width: 200 }}>Status</TableCell>
                            <TableCell sx={{ width: 170 }} align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r) => {
                            const selectedId = selectedFor(r);
                            const selected = selectedId ? cloverById.get(selectedId) || null : null;
                            const linkedItem = r.linkedId ? cloverById.get(r.linkedId) : undefined;
                            const priceDiff = selected && Math.abs(selected.price - r.price) >= 0.01;
                            const changed = r.linkedId !== selectedId;
                            return (
                                <TableRow key={r.key} hover>
                                    <TableCell>
                                        <Typography fontWeight={600}>{r.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {r.categoryName}{r.catering ? ' · Catering' : ''} · {money(r.price)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Autocomplete
                                            size="small"
                                            options={optionsFor(r)}
                                            value={selected}
                                            getOptionLabel={optionLabel}
                                            isOptionEqualToValue={(a, b) => a.id === b.id}
                                            onChange={(_, v) => setPicked((p) => ({ ...p, [r.key]: v ? v.id : null }))}
                                            renderInput={(params) => <TextField {...params} placeholder="Choose Clover item" />}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={0.5} alignItems="flex-start">
                                            {r.linkedId && !changed && <Chip size="small" color="success" label="Linked" />}
                                            {r.linkedId && !linkedItem && <Chip size="small" color="error" label="Clover item missing" />}
                                            {!r.linkedId && selected && <Chip size="small" color={r.strong && selectedId === r.suggestions[0]?.cloverId ? 'primary' : 'warning'} label={r.strong && selectedId === r.suggestions[0]?.cloverId ? 'Exact match' : 'Please check'} />}
                                            {changed && r.linkedId && <Chip size="small" color="warning" label="Unsaved change" />}
                                            {priceDiff && <Chip size="small" color="error" variant="outlined" label={`Clover price ${money(selected!.price)}`} />}
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            {r.linkedId && (
                                                <Button size="small" color="inherit" onClick={() => unlink(r)} disabled={busy}>Unlink</Button>
                                            )}
                                            <Button size="small" variant="contained" onClick={() => link(r)} disabled={busy || !selectedId || !changed}>
                                                {r.linkedId ? 'Save' : 'Link'}
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {!rows.length && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    {view === 'review' ? 'Everything here is linked.' : 'No items.'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
