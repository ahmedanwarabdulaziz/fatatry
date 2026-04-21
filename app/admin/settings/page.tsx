'use client';

import { useState, useEffect } from 'react';
import { Typography, Box, Button, CircularProgress, Paper, Divider, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FileUpload from '../../../components/FileUpload';
import { getHomepageSettings, saveHomepageSettings, HomepageSettings } from './actions';

export default function SettingsPage() {
    const [settings, setSettings] = useState<HomepageSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            const data = await getHomepageSettings();
            setSettings(data || { topAdImage: '', middleAdImage: '', bottomAdImage: '' });
            setLoading(false);
        }
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        formData.append('existingTopAdImage', settings?.topAdImage || '');
        formData.append('existingMiddleAdImage', settings?.middleAdImage || '');
        formData.append('existingBottomAdImage', settings?.bottomAdImage || '');

        await saveHomepageSettings(formData);
        
        // Refresh local state to reflect new images
        const data = await getHomepageSettings();
        setSettings(data);
        
        setSaving(false);
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ maxWidth: 800 }}>
            <Typography variant="h4" mb={4}>Global Settings</Typography>

            <Paper sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" gutterBottom>Homepage Ad Banners</Typography>
                    <Typography color="text.secondary" variant="body2" mb={4}>
                        Upload placeholder images for the top, middle, and bottom ad sections on the homepage. 
                        Recommended aspect ratio is 21:9 (cinematic wide).
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ flex: '1 1 300px' }}>
                                <FileUpload
                                    label="Top Ad Banner"
                                    name="topAdImageFile"
                                    currentImage={settings?.topAdImage}
                                    isUploading={saving}
                                />
                            </Box>
                            <Box sx={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Top Ad Title"
                                    name="topAdTitle"
                                    defaultValue={settings?.topAdTitle || ''}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Top Ad Description"
                                    name="topAdDesc"
                                    defaultValue={settings?.topAdDesc || ''}
                                />
                            </Box>
                        </Box>

                        <Divider />

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ flex: '1 1 300px' }}>
                                <FileUpload
                                    label="Middle Ad Banner"
                                    name="middleAdImageFile"
                                    currentImage={settings?.middleAdImage}
                                    isUploading={saving}
                                />
                            </Box>
                            <Box sx={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Middle Ad Title"
                                    name="middleAdTitle"
                                    defaultValue={settings?.middleAdTitle || ''}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Middle Ad Description"
                                    name="middleAdDesc"
                                    defaultValue={settings?.middleAdDesc || ''}
                                />
                            </Box>
                        </Box>

                        <Divider />

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ flex: '1 1 300px' }}>
                                <FileUpload
                                    label="Bottom Ad Banner"
                                    name="bottomAdImageFile"
                                    currentImage={settings?.bottomAdImage}
                                    isUploading={saving}
                                />
                            </Box>
                            <Box sx={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Bottom Ad Title"
                                    name="bottomAdTitle"
                                    defaultValue={settings?.bottomAdTitle || ''}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Bottom Ad Description"
                                    name="bottomAdDesc"
                                    defaultValue={settings?.bottomAdDesc || ''}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            size="large" 
                            startIcon={<SaveIcon />}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}
