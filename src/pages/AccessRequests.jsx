import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { accessRequestAPI } from '../services/api';

const AccessRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await accessRequestAPI.getAll();
            setRequests(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch access requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            await accessRequestAPI.approve(requestId);
            setSuccess('Access request approved successfully');
            fetchRequests();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleRejectClick = (request) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = async () => {
        try {
            await accessRequestAPI.reject(selectedRequest._id, rejectionReason);
            setSuccess('Access request rejected');
            setRejectDialogOpen(false);
            fetchRequests();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject request');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'warning';
            case 'Approved':
                return 'success';
            case 'Rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Employee Access Requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review and manage employee requests for data access
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Request Date</TableCell>
                                    <TableCell>Message</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No pending access requests
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((request) => (
                                        <TableRow key={request._id}>
                                            <TableCell>{request.employeeId?.username || 'N/A'}</TableCell>
                                            <TableCell>{request.employeeId?.email || 'N/A'}</TableCell>
                                            <TableCell>
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{request.requestMessage}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={request.status}
                                                    color={getStatusColor(request.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {request.status === 'Pending' && (
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            startIcon={<CheckCircle />}
                                                            onClick={() => handleApprove(request._id)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<Cancel />}
                                                            onClick={() => handleRejectClick(request)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Box>
                                                )}
                                                {request.status !== 'Pending' && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {request.status} by {request.approvedBy?.username || 'System'}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
                <DialogTitle>Reject Access Request</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Rejecting access request for: {selectedRequest?.employeeId?.username}
                    </Typography>
                    <TextField
                        fullWidth
                        label="Rejection Reason (Optional)"
                        multiline
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRejectConfirm} color="error" variant="contained">
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AccessRequests;
