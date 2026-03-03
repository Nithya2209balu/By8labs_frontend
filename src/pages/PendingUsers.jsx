import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Box,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField
} from '@mui/material';
import { CheckCircle, Cancel, Email, Person } from '@mui/icons-material';

const PendingUsers = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rejectDialog, setRejectDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://by8labs-backend.onrender.com/api/auth/pending-users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingUsers(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch pending users');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `https://by8labs-backend.onrender.com/api/auth/approve-user/${userId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('User approved successfully!');
            fetchPendingUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve user');
        }
    };

    const handleRejectClick = (user) => {
        setSelectedUser(user);
        setRejectDialog(true);
    };

    const handleRejectConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `https://by8labs-backend.onrender.com/api/auth/reject-user/${selectedUser._id}`,
                { reason: rejectionReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('User registration rejected');
            fetchPendingUsers();
            setRejectDialog(false);
            setRejectionReason('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject user');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Pending User Registrations</Typography>
                <Chip label={`${pendingUsers.length} Pending`} color="warning" />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review and approve/reject new user registration requests. Users cannot login until approved.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {pendingUsers.length === 0 && !loading ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No pending user registrations
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Username</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Registered</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingUsers.map((user) => (
                                <TableRow key={user._id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Person fontSize="small" />
                                            {user.username}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Email fontSize="small" />
                                            {user.email}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            color={user.role === 'HR' ? 'error' : user.role === 'Manager' ? 'warning' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={user.approvalStatus} color="warning" size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            color="success"
                                            onClick={() => handleApprove(user._id)}
                                            title="Approve User"
                                        >
                                            <CheckCircle />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleRejectClick(user)}
                                            title="Reject User"
                                        >
                                            <Cancel />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Reject Dialog */}
            <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)}>
                <DialogTitle>Reject User Registration</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to reject the registration for <strong>{selectedUser?.username}</strong>?
                        Please provide a reason:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Rejection Reason"
                        fullWidth
                        multiline
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g., Invalid email domain, Duplicate account, etc."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
                    <Button onClick={handleRejectConfirm} variant="contained" color="error">
                        Reject User
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PendingUsers;
