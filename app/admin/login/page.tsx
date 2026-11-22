'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Box, Typography, Container, Paper, Alert } from '@mui/material';
import { loginAdmin } from './actions';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError(null);
        const result = await loginAdmin(password);
        setLoading(false);
        if (!result.ok) {
            setError(result.error || 'Invalid password');
            return;
        }
        // Only allow redirects back into the admin area
        const next = new URLSearchParams(window.location.search).get('next');
        router.replace(next && next.startsWith('/admin') ? next : '/admin/dashboard');
        router.refresh();
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Typography component="h1" variant="h5">
                    Admin Login
                </Typography>
                <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading || !password}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
