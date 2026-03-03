import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    TextField,
    Tabs,
    Tab
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { leaveAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LeaveRequest from '../components/leaves/LeaveRequest';
import LeaveList from '../components/leaves/LeaveList';
import AccessDenied from '../components/access/AccessDenied';

const LeaveManagement = () => {
    const { user, isHR } = useAuth();
    const [loading, setLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [filters, setFilters] = useState({ status: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            if (isHR) {
                // Load all leaves for HR
                const response = await leaveAPI.getAll(filters);
                setLeaves(response.data);
            } else {
                // Load employee's own leaves and balance
                // Extract employeeId as string (handle both object and string formats)
                const employeeId = typeof user.employeeId === 'object'
                    ? user.employeeId._id || user.employeeId.id
                    : user.employeeId;

                if (!employeeId) {
                    throw new Error('Employee ID not found');
                }

                const [leavesResponse, balanceResponse] = await Promise.all([
                    leaveAPI.getByEmployee(employeeId),
                    leaveAPI.getBalance(employeeId)
                ]);

                setLeaves(leavesResponse.data);
                setLeaveBalance(balanceResponse.data);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load leave data'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyLeave = () => {
        setEditingLeave(null);
        setRequestDialogOpen(true);
    };

    const handleEditLeave = (leave) => {
        setEditingLeave(leave);
        setRequestDialogOpen(true);
    };

    const handleDeleteLeave = async (leaveId) => {
        try {
            await leaveAPI.delete(leaveId);
            setMessage({
                type: 'success',
                text: 'Leave request deleted successfully'
            });
            loadData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to delete leave request'
            });
        }
    };

    const handleReviewLeave = async (leaveId, reviewData) => {
        try {
            await leaveAPI.review(leaveId, reviewData);
            setMessage({
                type: 'success',
                text: 'Leave request reviewed successfully'
            });
            loadData();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to review leave request'
            });
        }
    };

    const handleRequestSuccess = () => {
        setMessage({
            type: 'success',
            text: editingLeave ? 'Leave request updated successfully' : 'Leave request submitted successfully'
        });
        loadData();
    };

    const getFilteredLeaves = () => {
        if (tabValue === 0) return leaves;
        if (tabValue === 1) return leaves.filter(l => l.status === 'Pending');
        if (tabValue === 2) return leaves.filter(l => l.status === 'Approved');
        if (tabValue === 3) return leaves.filter(l => l.status === 'Rejected');
        return leaves;
    };

    // Check if employee has data access
    if (!isHR && user && !user.hasDataAccess) {
        return <AccessDenied />;
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                    Leave Management
                </Typography>
                {!isHR && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleApplyLeave}
                    >
                        Apply for Leave
                    </Button>
                )}
            </Box>

            {message.text && (
                <Alert
                    severity={message.type}
                    onClose={() => setMessage({ type: '', text: '' })}
                    sx={{ mb: 2 }}
                >
                    {message.text}
                </Alert>
            )}

            {/* Employee View - Leave Balance */}
            {!isHR && leaveBalance && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Casual Leave
                                </Typography>
                                <Typography variant="h5">
                                    {leaveBalance.casualLeave?.balance || 0} / {leaveBalance.casualLeave?.total || 0}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Used: {leaveBalance.casualLeave?.used || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Sick Leave
                                </Typography>
                                <Typography variant="h5">
                                    {leaveBalance.sickLeave?.balance || 0} / {leaveBalance.sickLeave?.total || 0}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Used: {leaveBalance.sickLeave?.used || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Earned Leave
                                </Typography>
                                <Typography variant="h5">
                                    {leaveBalance.earnedLeave?.balance || 0} / {leaveBalance.earnedLeave?.total || 0}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Used: {leaveBalance.earnedLeave?.used || 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Leave List with Tabs */}
            <Paper sx={{ p: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    sx={{ mb: 2 }}
                >
                    <Tab label="All Leaves" />
                    <Tab label="Pending" />
                    <Tab label="Approved" />
                    <Tab label="Rejected" />
                </Tabs>

                <LeaveList
                    leaves={getFilteredLeaves()}
                    onEdit={handleEditLeave}
                    onDelete={handleDeleteLeave}
                    onRefresh={loadData}
                    isHR={isHR}
                    onReview={isHR ? handleReviewLeave : null}
                />
            </Paper>

            {/* Leave Request Dialog */}
            <LeaveRequest
                open={requestDialogOpen}
                onClose={() => {
                    setRequestDialogOpen(false);
                    setEditingLeave(null);
                }}
                onSuccess={handleRequestSuccess}
                editLeave={editingLeave}
            />
        </Box>
    );
};

export default LeaveManagement;
