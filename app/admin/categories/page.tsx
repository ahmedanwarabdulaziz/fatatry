'use client';

import { useState, useEffect } from 'react';
import {
    Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch, CircularProgress,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getCategories, saveCategory, deleteCategory, reorderCategories, Category } from './actions';
import { CategoryItem } from '../../../components/CategoryItem';
import FileUpload from '../../../components/FileUpload';

// Helper to determine URL (bucket handling can be done properly here later)
const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // VERY BASIC placeholder logic. 
    // In production, we'd use a public R2 domain or Signed URLs.
    // For now, assume the path IS the full URL or a relative path we can't easily resolve without config.
    // However, the user provided keys, implying we are responsible for the full URL construction logic in the upload util or here.
    // I returned just the key in upload util. 
    // Let's assume for this step we might need a public domain env var or similar.
    // But since one wasn't provided, I'll display the raw path which might be broken images until that's fixed.
    // Wait, let's use a dummy prefix if local, or just show the path text if it's not a valid URL.
    return path;
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
    const [saving, setSaving] = useState(false);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchData = async () => {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpen = (category?: Category) => {
        setCurrentCategory(category || { name: '', description: '', isFeatured: false, heroImage: '', squareImage: '' });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentCategory({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        // Add existing images if not replaced (logic handled in server action but we pass IDs to update)
        if (currentCategory.id) formData.append('id', currentCategory.id);
        formData.append('existingHeroImage', currentCategory.heroImage || '');
        formData.append('existingSquareImage', currentCategory.squareImage || '');
        formData.append('isFeatured', String(currentCategory.isFeatured));

        await saveCategory(formData);
        await fetchData();
        setSaving(false);
        handleClose();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            await deleteCategory(id);
            fetchData();
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setCategories((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Optimistic UI update, then sync to server
                const reordered = newItems.map((item, index) => ({ id: item.id, order: index }));
                reorderCategories(reordered);

                return newItems;
            });
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Categories</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
                    Add Category
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
                                    <TableCell>Images</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Featured</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    {categories.map((row) => (
                                        <CategoryItem key={row.id} category={row} onEdit={handleOpen} onDelete={handleDelete} />
                                    ))}
                                </SortableContext>
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No categories found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DndContext>
            )}

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{currentCategory.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Name"
                            name="name"
                            defaultValue={currentCategory.name}
                            required
                            fullWidth
                            onFocus={(e) => e.target.select()}
                        />
                        <TextField
                            label="Description"
                            name="description"
                            defaultValue={currentCategory.description}
                            fullWidth
                            multiline
                            rows={2}
                            onFocus={(e) => e.target.select()}
                        />

                        <FileUpload
                            label="Hero Image"
                            name="heroImageFile"
                            currentImage={currentCategory.heroImage}
                            isUploading={saving}
                        />

                        <FileUpload
                            label="Square Image"
                            name="squareImageFile"
                            currentImage={currentCategory.squareImage}
                            isUploading={saving}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={currentCategory.isFeatured || false}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, isFeatured: e.target.checked })}
                                />
                            }
                            label="Featured Category"
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
