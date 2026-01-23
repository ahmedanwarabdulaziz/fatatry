'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Box, Typography, Container, Paper } from '@mui/material';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = () => {
        // Hardcoded password as requested: 5550555
        if (password === '5550555') {
            router.push('/admin/dashboard');
        } else {
            alert('Invalid Password');
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Typography component="h1" variant="h5">
                    Admin Login
                </Typography>
                <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
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
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={handleLogin}
                    >
                        Sign In
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
