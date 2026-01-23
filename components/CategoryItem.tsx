'use client';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell, IconButton, Switch, Avatar, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Category } from "@/app/admin/categories/actions";

interface CategoryItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
}

export function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'default',
    };

    return (
        <TableRow ref={setNodeRef} style={style}>
            <TableCell>
                <IconButton {...attributes} {...listeners} size="small" style={{ cursor: 'grab' }}>
                    <DragIndicatorIcon />
                </IconButton>
            </TableCell>
            <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {category.heroImage && <Avatar src={category.heroImage} variant="rounded" alt="Hero" />}
                    {category.squareImage && <Avatar src={category.squareImage} variant="square" alt="Square" />}
                </Box>
            </TableCell>
            <TableCell component="th" scope="row">
                {category.name}
            </TableCell>
            <TableCell>{category.isFeatured ? "Yes" : "No"}</TableCell>
            <TableCell align="right">
                <IconButton onClick={() => onEdit(category)} color="primary">
                    <EditIcon />
                </IconButton>
                <IconButton onClick={() => onDelete(category.id)} color="error">
                    <DeleteIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
