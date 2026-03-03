import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import { LockOpen } from '@mui/icons-material';
import { accessRequestAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AccessDenied = () => {
    const { refreshUser } = useAuth();
    const [requestSubmitted, setRequestSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [existingRequest, setExistingRequest] = useState(null);

    useEffect(() => {
        const init = async () => {
            // First refresh user data to ensure we have latest info
            await refreshUser();
            // Then check for existing requests
            checkExistingRequest();
        };
        init();
    }, []);

    const checkExistingRequest = async () => {
        try {
            const response = await accessRequestAPI.getAll();
            const pendingRequest = response.data.find(req => req.status === 'Pending');
            if (pendingRequest) {
                setExistingRequest(pendingRequest);
                setRequestSubmitted(true);
            }
        } catch (err) {
            // Silently fail - user might not have any requests
        }
    };

    const handleRequestAccess = async () => {
        try {
            setLoading(true);
            setError('');
            await accessRequestAPI.create({
                message: 'Requesting access to view my attendance and submit leave requests'
            });
            setRequestSubmitted(true);
        } catch (err) {
            // Check if user already has access
            if (err.response?.data?.message?.includes('already have data access')) {
                // User already has access, refresh user data and reload
                await refreshUser();
                window.location.reload();
            } else {
                setError(err.response?.data?.message || 'Failed to submit access request');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                p: 3
            }}
        >
            <Card sx={{ maxWidth: 600, width: '100%' }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <LockOpen sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />

                    <Typography variant="h4" gutterBottom>
                        Access Required
                    </Typography>

                    {!requestSubmitted ? (
                        <>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                You currently don't have access to employee features such as attendance
                                tracking and leave management. Please request access from HR to proceed.
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleRequestAccess}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <LockOpen />}
                            >
                                {loading ? 'Submitting...' : 'Request Access from HR'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body1">
                                    Your access request has been submitted and is pending HR approval.
                                </Typography>
                                {existingRequest && (
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        Requested on: {new Date(existingRequest.createdAt).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Alert>

                            <Typography variant="body2" color="text.secondary">
                                You will be notified once HR reviews your request.
                                Please check back later or contact HR for more information.
                            </Typography>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AccessDenied;
