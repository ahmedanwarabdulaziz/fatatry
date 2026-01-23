'use client';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell, IconButton, Avatar, Box, Typography, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { MenuItem } from "@/app/admin/menu-items/actions";

interface MenuItemRowProps {
    item: MenuItem;
    categoryName?: string;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
}

export function MenuItemRow({ item, categoryName, onEdit, onDelete }: MenuItemRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'default',
    };

    // Format Serving Details
    const servingInfo = [];
    if (item.servingDetails?.skewerCount) servingInfo.push(`${item.servingDetails.skewerCount} Skewers`);
    if (item.servingDetails?.pieceCount) servingInfo.push(`${item.servingDetails.pieceCount} Pieces`);
    if (item.servingDetails?.weightGrams) servingInfo.push(`${item.servingDetails.weightGrams}g`);

    // Calculate Price Display
    let priceDisplay = item.price.toFixed(2);
    if (item.sizes && item.sizes.length > 0) {
        const prices = item.sizes.map(s => s.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice !== maxPrice) {
            priceDisplay = `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`;
        } else {
            priceDisplay = minPrice.toFixed(2);
        }
    }

    return (
        <TableRow ref={setNodeRef} style={style}>
            <TableCell>
                <IconButton {...attributes} {...listeners} size="small" style={{ cursor: 'grab' }}>
                    <DragIndicatorIcon />
                </IconButton>
            </TableCell>
            <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {item.squareImage && <Avatar src={item.squareImage} variant="rounded" alt="Square" />}
                </Box>
            </TableCell>
            <TableCell component="th" scope="row">
                <Typography variant="body1" fontWeight="bold">{item.name}</Typography>
                <Typography variant="caption" color="text.secondary">{categoryName || 'Uncategorized'}</Typography>
            </TableCell>
            <TableCell>
                {priceDisplay}
            </TableCell>
            <TableCell>
                {item.sizes && item.sizes.length > 0 ? (
                    <Box>
                        <Chip label={`${item.sizes.length} Sizes`} size="small" variant="outlined" />
                    </Box>
                ) : (
                    servingInfo.length > 0 ? (
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            {servingInfo.join(' / ')}
                        </Typography>
                    ) : '-'
                )}
            </TableCell>
            <TableCell>{item.isFeatured ? <Chip label="Featured" color="primary" size="small" /> : null}</TableCell>
            <TableCell align="right">
                <IconButton onClick={() => onEdit(item)} color="primary">
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(item.id)} color="error">
                    <DeleteIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
