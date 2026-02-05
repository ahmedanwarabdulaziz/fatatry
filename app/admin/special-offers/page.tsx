'use client';

import { useState, useEffect } from 'react';
import {
    Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';
import { getSpecialOffers, saveSpecialOffer, deleteSpecialOffer, SpecialOffer } from './actions';
import FileUpload from '../../../components/FileUpload';

export default function SpecialOffersPage() {
    const [offers, setOffers] = useState<SpecialOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentOffer, setCurrentOffer] = useState<Partial<SpecialOffer>>({});
    const [saving, setSaving] = useState(false);

    const fetchOffers = async () => {
        setLoading(true);
        const data = await getSpecialOffers();
        setOffers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleOpen = (offer?: SpecialOffer) => {
        setCurrentOffer(offer || {
            headline: '',
            text: '',
            priceBefore: 0,
            priceAfter: 0,
            isActive: true,
            squareImage: ''
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentOffer({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        if (currentOffer.id) formData.append('id', currentOffer.id);
        formData.append('existingSquareImage', currentOffer.squareImage || '');
        formData.append('isActive', String(currentOffer.isActive));

        await saveSpecialOffer(formData);
        await fetchOffers();
        setSaving(false);
        handleClose();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this offer?')) {
            await deleteSpecialOffer(id);
            fetchOffers();
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Special Offers</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Offer
                </Button>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell width={100}>Image</TableCell>
                                <TableCell>Headline</TableCell>
                                <TableCell>Text</TableCell>
                                <TableCell>Price Before</TableCell>
                                <TableCell>Price After</TableCell>
                                <TableCell>Active</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {offers.map((offer) => (
                                <TableRow key={offer.id}>
                                    <TableCell>
                                        {offer.squareImage ? (
                                            <Box sx={{ position: 'relative', width: 60, height: 60 }}>
                                                <Image
                                                    src={offer.squareImage}
                                                    alt={offer.headline}
                                                    fill
                                                    style={{ objectFit: 'cover', borderRadius: 4 }}
                                                />
                                            </Box>
                                        ) : (
                                            <Box sx={{ width: 60, height: 60, bgcolor: 'grey.200', borderRadius: 1 }} />
                                        )}
                                    </TableCell>
                                    <TableCell>{offer.headline}</TableCell>
                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {offer.text}
                                    </TableCell>
                                    <TableCell>${offer.priceBefore.toFixed(2)}</TableCell>
                                    <TableCell>${offer.priceAfter.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {offer.isActive ? '✓ Active' : '✗ Inactive'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="small" onClick={() => handleOpen(offer)} sx={{ mr: 1 }}>
                                            <EditIcon fontSize="small" />
                                        </Button>
                                        <Button size="small" color="error" onClick={() => handleDelete(offer.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {offers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No offers found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{currentOffer.id ? 'Edit Offer' : 'Add Offer'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Headline"
                            name="headline"
                            defaultValue={currentOffer.headline}
                            required
                            fullWidth
                            onFocus={(e) => e.target.select()}
                        />

                        <TextField
                            label="Description Text"
                            name="text"
                            defaultValue={currentOffer.text}
                            required
                            fullWidth
                            multiline
                            rows={3}
                            onFocus={(e) => e.target.select()}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Price Before"
                                name="priceBefore"
                                type="number"
                                inputProps={{ step: "0.01" }}
                                defaultValue={currentOffer.priceBefore}
                                required
                                fullWidth
                                onFocus={(e) => e.target.select()}
                            />
                            <TextField
                                label="Price After (Sale)"
                                name="priceAfter"
                                type="number"
                                inputProps={{ step: "0.01" }}
                                defaultValue={currentOffer.priceAfter}
                                required
                                fullWidth
                                onFocus={(e) => e.target.select()}
                            />
                        </Box>

                        <FileUpload
                            label="Offer Image (Square)"
                            name="squareImageFile"
                            currentImage={currentOffer.squareImage}
                            isUploading={saving}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={currentOffer.isActive || false}
                                    onChange={(e) => setCurrentOffer({ ...currentOffer, isActive: e.target.checked })}
                                />
                            }
                            label="Active (Show on Homepage)"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
