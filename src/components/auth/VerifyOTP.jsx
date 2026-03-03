import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Link,
    Container
} from '@mui/material';
import { MarkEmailRead, Refresh } from '@mui/icons-material';
import { authAPI } from '../../services/api';

const VerifyOTP = () => {
    const [otp, setOTP] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const location = useLocation();
    const navigate = useNavigate();

    const { userId, email } = location.state || {};

    useEffect(() => {
        if (!userId || !email) {
            navigate('/register');
        }
    }, [userId, email, navigate]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            setError('Please enter the 6-digit verification code');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const response = await authAPI.verifyOTP({ userId, otp });
            setSuccess(response.data.message);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Email verified! You can now login.' }
                });
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResendLoading(true);
            setError('');
            const response = await authAPI.resendOTP({ userId });
            setSuccess(response.data.message);
            setResendCooldown(60); // 60 second cooldown
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setResendLoading(false);
        }
    };

    const handleOTPChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only digits
        if (value.length <= 6) {
            setOTP(value);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: '100%',
                        maxWidth: 500
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <MarkEmailRead sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" gutterBottom>
                            Verify Your Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            We've sent a 6-digit verification code to
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                            {email}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleVerify}>
                        <TextField
                            fullWidth
                            label="Enter 6-Digit Code"
                            value={otp}
                            onChange={handleOTPChange}
                            placeholder="000000"
                            inputProps={{
                                maxLength: 6,
                                style: {
                                    fontSize: 24,
                                    letterSpacing: '10px',
                                    textAlign: 'center',
                                    fontWeight: 'bold'
                                }
                            }}
                            sx={{ mb: 3 }}
                            autoFocus
                            required
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading || otp.length !== 6}
                            startIcon={loading && <CircularProgress size={20} />}
                            sx={{ mb: 2 }}
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Didn't receive the code?
                            </Typography>
                            {resendCooldown > 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    Resend available in {resendCooldown}s
                                </Typography>
                            ) : (
                                <Link
                                    component="button"
                                    type="button"
                                    variant="body2"
                                    onClick={handleResend}
                                    disabled={resendLoading}
                                    sx={{ cursor: resendLoading ? 'not-allowed' : 'pointer' }}
                                >
                                    {resendLoading ? (
                                        <>
                                            <CircularProgress size={14} sx={{ mr: 1 }} />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Refresh sx={{ fontSize: 14, mr: 0.5 }} />
                                            Resend Code
                                        </>
                                    )}
                                </Link>
                            )}
                        </Box>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Link
                                component="button"
                                type="button"
                                variant="body2"
                                onClick={() => navigate('/register')}
                            >
                                Back to Registration
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default VerifyOTP;
