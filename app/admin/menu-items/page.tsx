'use client';

import { useState, useEffect } from 'react';
import {
    Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, CircularProgress,
    MenuItem as MuiMenuItem, Select, InputLabel, FormControl, Grid, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getMenuItems, saveMenuItem, deleteMenuItem, reorderMenuItems, MenuItem } from './actions';
import { getCategories, Category } from '../categories/actions';
import { MenuItemRow } from '../../../components/MenuItemRow';
import FileUpload from '../../../components/FileUpload';

export default function MenuItemsPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<MenuItem>>({});
    const [saving, setSaving] = useState(false);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchData = async () => {
        setLoading(true);
        const [itemsData, categoriesData] = await Promise.all([
            getMenuItems(),
            getCategories()
        ]);
        setItems(itemsData);
        setCategories(categoriesData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [hasSizes, setHasSizes] = useState(false);

    const handleOpen = (item?: MenuItem) => {
        const itemHasSizes = !!(item?.sizes && item.sizes.length > 0);
        setHasSizes(itemHasSizes);
        setCurrentItem(item || {
            name: '',
            description: '',
            price: 0,
            isFeatured: false,
            categoryId: '',
            servingDetails: { weightGrams: undefined, pieceCount: undefined, skewerCount: undefined },
            sizes: []
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentItem({});
        setHasSizes(false);
    };

    const addSize = () => {
        const newSizes = [...(currentItem.sizes || [])];
        newSizes.push({ name: '', price: 0, servingDetails: {} });
        setCurrentItem({ ...currentItem, sizes: newSizes });
    };

    const removeSize = (index: number) => {
        const newSizes = [...(currentItem.sizes || [])];
        newSizes.splice(index, 1);
        setCurrentItem({ ...currentItem, sizes: newSizes });
    };

    const updateSize = (index: number, field: string, value: any, isServing: boolean = false) => {
        const newSizes = [...(currentItem.sizes || [])];
        if (isServing) {
            newSizes[index] = {
                ...newSizes[index],
                servingDetails: { ...newSizes[index].servingDetails, [field]: value }
            };
        } else {
            newSizes[index] = { ...newSizes[index], [field]: value };
        }
        setCurrentItem({ ...currentItem, sizes: newSizes });
    };

    const addAddon = () => {
        const newAddons = [...(currentItem.addons || [])];
        newAddons.push({ name: '', price: 0 });
        setCurrentItem({ ...currentItem, addons: newAddons });
    };

    const removeAddon = (index: number) => {
        const newAddons = [...(currentItem.addons || [])];
        newAddons.splice(index, 1);
        setCurrentItem({ ...currentItem, addons: newAddons });
    };

    const updateAddon = (index: number, field: string, value: any) => {
        const newAddons = [...(currentItem.addons || [])];
        newAddons[index] = { ...newAddons[index], [field]: value };
        setCurrentItem({ ...currentItem, addons: newAddons });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        if (currentItem.id) formData.append('id', currentItem.id);
        formData.append('existingHeroImage', currentItem.heroImage || '');
        formData.append('existingSquareImage', currentItem.squareImage || '');
        formData.append('isFeatured', String(currentItem.isFeatured));
        formData.append('categoryId', currentItem.categoryId || '');

        if (hasSizes && currentItem.sizes) {
            formData.append('sizes', JSON.stringify(currentItem.sizes));
            // If has sizes, we might ignore the main price/serving, but let's send 0 or clears
            formData.set('price', '0'); // Override
        } else {
            // Ensure sizes is cleared if switched off
            formData.append('sizes', JSON.stringify([]));
        }

        // Add Add-ons
        if (currentItem.addons && currentItem.addons.length > 0) {
            formData.append('addons', JSON.stringify(currentItem.addons));
        } else {
            formData.append('addons', JSON.stringify([]));
        }

        await saveMenuItem(formData);
        await fetchData();
        setSaving(false);
        handleClose();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await deleteMenuItem(id);
            fetchData();
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                const reordered = newItems.map((item, index) => ({ id: item.id, order: index }));
                reorderMenuItems(reordered);

                return newItems;
            });
        }
    };

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Menu Items</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Item
                </Button>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={50}></TableCell>
                                    <TableCell width={100}>Image</TableCell>
                                    <TableCell>Name & Category</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Serving</TableCell>
                                    <TableCell>Featured</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    {items.map((row) => (
                                        <MenuItemRow
                                            key={row.id}
                                            item={row}
                                            categoryName={getCategoryName(row.categoryId)}
                                            onEdit={handleOpen}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </SortableContext>
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">No items found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DndContext>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>{currentItem.id ? 'Edit Item' : 'Add Item'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <Box>
                                <TextField
                                    label="Name"
                                    name="name"
                                    defaultValue={currentItem.name}
                                    required
                                    fullWidth
                                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                                    onFocus={(e) => e.target.select()}
                                />
                            </Box>
                            <Box>
                                <FormControl fullWidth required>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={currentItem.categoryId || ''}
                                        label="Category"
                                        onChange={(e) => setCurrentItem({ ...currentItem, categoryId: e.target.value as string })}
                                    >
                                        {categories.map((cat) => (
                                            <MuiMenuItem key={cat.id} value={cat.id}>{cat.name}</MuiMenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <TextField
                                    label="Description"
                                    name="description"
                                    defaultValue={currentItem.description}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    onFocus={(e) => e.target.select()}
                                />
                            </Box>

                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={hasSizes}
                                            onChange={(e) => setHasSizes(e.target.checked)}
                                        />
                                    }
                                    label="This item has multiple sizes/variations"
                                />
                            </Box>

                            {!hasSizes ? (
                                <>
                                    <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                                        <TextField
                                            label="Price"
                                            name="price"
                                            type="number"
                                            inputProps={{ step: "0.01" }}
                                            defaultValue={currentItem.price}
                                            required={!hasSizes}
                                            fullWidth
                                            onFocus={(e) => e.target.select()}
                                        />
                                    </Box>

                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: 'text.secondary' }}>Serving Details (Optional)</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <TextField
                                                label="Weight (g)"
                                                name="weightGrams"
                                                type="number"
                                                defaultValue={currentItem.servingDetails?.weightGrams}
                                                size="small"
                                                helperText="e.g. 125"
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <TextField
                                                label="Piece Count"
                                                name="pieceCount"
                                                type="number"
                                                defaultValue={currentItem.servingDetails?.pieceCount}
                                                size="small"
                                                helperText="e.g. 2"
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <TextField
                                                label="Skewer Count"
                                                name="skewerCount"
                                                type="number"
                                                defaultValue={currentItem.servingDetails?.skewerCount}
                                                size="small"
                                                helperText="e.g. 1"
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </Box>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ gridColumn: '1 / -1', border: '1px solid #ddd', p: 2, borderRadius: 1 }}>
                                    <Typography variant="h6" gutterBottom>Variations</Typography>
                                    {currentItem.sizes?.map((size, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                            <TextField
                                                label="Size Name"
                                                value={size.name}
                                                onChange={(e) => updateSize(idx, 'name', e.target.value)}
                                                size="small"
                                                required
                                                sx={{ width: 140 }}
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <TextField
                                                label="Price"
                                                type="number"
                                                value={size.price}
                                                onChange={(e) => updateSize(idx, 'price', parseFloat(e.target.value))}
                                                size="small"
                                                required
                                                sx={{ width: 100 }}
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <TextField
                                                label="Weight"
                                                type="number"
                                                value={size.servingDetails?.weightGrams || ''}
                                                onChange={(e) => updateSize(idx, 'weightGrams', e.target.value, true)}
                                                size="small"
                                                sx={{ width: 80 }}
                                                InputProps={{ endAdornment: <Typography variant="caption">g</Typography> }}
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <TextField
                                                label="Pieces"
                                                type="number"
                                                value={size.servingDetails?.pieceCount || ''}
                                                onChange={(e) => updateSize(idx, 'pieceCount', e.target.value, true)}
                                                size="small"
                                                sx={{ width: 80 }}
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <TextField
                                                label="Skewers"
                                                type="number"
                                                value={size.servingDetails?.skewerCount || ''}
                                                onChange={(e) => updateSize(idx, 'skewerCount', e.target.value, true)}
                                                size="small"
                                                sx={{ width: 80 }}
                                                onFocus={(e) => e.target.select()}
                                            />
                                            <Button color="error" onClick={() => removeSize(idx)}>Remove</Button>
                                        </Box>
                                    ))}
                                    <Button onClick={addSize} variant="outlined" size="small" startIcon={<AddIcon />}>Add Variation</Button>
                                </Box>
                            )}

                            {/* Add-ons Section */}
                            <Box sx={{ gridColumn: '1 / -1', border: '1px solid #ddd', p: 2, borderRadius: 1, mt: 2 }}>
                                <Typography variant="h6" gutterBottom>Optional Add-ons</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Add extra items that customers can choose (e.g. Extra Cheese, Sauce)
                                </Typography>

                                {currentItem.addons?.map((addon, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                                        <TextField
                                            label="Add-on Name"
                                            value={addon.name}
                                            onChange={(e) => updateAddon(idx, 'name', e.target.value)}
                                            size="small"
                                            required
                                            fullWidth
                                            onFocus={(e) => e.target.select()}
                                        />
                                        <TextField
                                            label="Price"
                                            type="number"
                                            value={addon.price}
                                            onChange={(e) => updateAddon(idx, 'price', parseFloat(e.target.value))}
                                            size="small"
                                            required
                                            sx={{ width: 150 }}
                                            onFocus={(e) => e.target.select()}
                                        />
                                        <Button color="error" onClick={() => removeAddon(idx)}>Remove</Button>
                                    </Box>
                                ))}
                                <Button onClick={addAddon} variant="outlined" size="small" startIcon={<AddIcon />}>Add Add-on</Button>
                            </Box>

                            <Box>
                                <FileUpload
                                    label="Hero Image"
                                    name="heroImageFile"
                                    currentImage={currentItem.heroImage}
                                    isUploading={saving}
                                />
                            </Box>
                            <Box>
                                <FileUpload
                                    label="Square Image"
                                    name="squareImageFile"
                                    currentImage={currentItem.squareImage}
                                    isUploading={saving}
                                />
                            </Box>

                            <Box sx={{ gridColumn: '1 / -1' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={currentItem.isFeatured || false}
                                            onChange={(e) => setCurrentItem({ ...currentItem, isFeatured: e.target.checked })}
                                        />
                                    }
                                    label="Featured Item"
                                />
                            </Box>
                        </Box>
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
