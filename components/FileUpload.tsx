'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Box, Typography, IconButton, Avatar, CircularProgress, LinearProgress, Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface FileUploadProps {
    label: string;
    name: string;
    currentImage?: string;
    isUploading?: boolean;
}

export default function FileUpload({ label, name, currentImage, isUploading = false }: FileUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    const handleClear = () => {
        setPreview(null);
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                {label}
            </Typography>

            <Box
                sx={{
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: '#f5f9ff'
                    },
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onClick={handleClick}
            >
                <input
                    type="file"
                    name={name}
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {preview ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', flexDirection: 'column' }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={preview}
                                variant="rounded"
                                sx={{ width: 100, height: 100, boxShadow: 2 }}
                            />
                            <IconButton
                                size="small"
                                color="error"
                                sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    '&:hover': { bgcolor: '#ffebee' }
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClear();
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                {fileName || 'Current Image'}
                            </Typography>
                            {isUploading && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, justifyContent: 'center' }}>
                                    <CircularProgress size={16} />
                                    <Typography variant="caption" color="primary">Uploading...</Typography>
                                </Box>
                            )}
                            {!isUploading && fileName && (
                                <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <CheckCircleIcon fontSize="inherit" /> Ready to upload
                                </Typography>
                            )}
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ color: 'text.secondary' }}>
                        <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: 'primary.light' }} />
                        <Typography variant="body2">Click to upload or drag and drop</Typography>
                        <Typography variant="caption" display="block">SVG, PNG, JPG (max. 5MB)</Typography>
                    </Box>
                )}

                {isUploading && <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />}
            </Box>
        </Box>
    );
}
