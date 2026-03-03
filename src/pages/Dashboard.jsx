import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Avatar,
    CircularProgress,
    Button,
    Alert,
    Snackbar
} from '@mui/material';
import {
    People,
    EventNote,
    AttachMoney,
    TrendingUp,
    LockOpen,
    Send,
    CheckCircle,
    Cancel,
    AccessTime,
    VerifiedUser
} from '@mui/icons-material';
import AttendanceCalendar from '../components/dashboard/AttendanceCalendar';
import { attendanceAPI } from '../services/api';

const Dashboard = () => {
    const { user, isHR } = useAuth();
    const [stats, setStats] = useState(null);
    const [employeeStats, setEmployeeStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Attendance specific state
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [markingAttendance, setMarkingAttendance] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [snackMessage, setSnackMessage] = useState({ open: false, text: '', severity: 'success' });

    useEffect(() => {
        fetchStats();
        if (user?.employeeId) {
            fetchTodayStatus();
            // Fetch personal stats for both Employee and HR if they have a profile
            fetchEmployeeStats();
        }
    }, [refreshTrigger]);

    const fetchTodayStatus = async () => {
        try {
            const response = await attendanceAPI.getTodayStatus();
            setTodayAttendance(response.data);
        } catch (error) {
            console.error('Error fetching today status:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://by8labs-backend.onrender.com/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async (status) => {
        try {
            setMarkingAttendance(true);
            await attendanceAPI.markAttendance({ status });
            setSnackMessage({ open: true, text: `Attendance marked as ${status} successfully!`, severity: 'success' });
            setRefreshTrigger(prev => prev + 1); // Trigger reload of stats and calendar
        } catch (error) {
            setSnackMessage({
                open: true,
                text: error.response?.data?.message || 'Failed to mark attendance',
                severity: 'error'
            });
        } finally {
            setMarkingAttendance(false);
        }
    };

    const handleCloseSnack = () => {
        setSnackMessage({ ...snackMessage, open: false });
    };

    const handleRequestAccess = async () => {
        try {
            setRequestLoading(true);
            const token = localStorage.getItem('token');
            await axios.post(
                'https://by8labs-backend.onrender.com/api/access-requests',
                { message: 'Requesting access to view my data (attendance, leaves, payroll)' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({
                type: 'success',
                text: '✅ Access request sent successfully! HR will review your request soon.'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to send request'
            });
        } finally {
            setRequestLoading(false);
        }
    };

    const fetchEmployeeStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://by8labs-backend.onrender.com/api/attendance/my-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployeeStats(response.data);
        } catch (error) {
            console.error('Error fetching employee stats:', error);
        }
    };

    const statsData = [
        {
            title: 'Total Employees',
            value: stats?.totalEmployees || 0,
            icon: <People />,
            color: '#1976d2',
            visible: isHR
        },
        {
            title: 'Pending Leaves',
            value: stats?.pendingLeaves || 0,
            icon: <EventNote />,
            color: '#ed6c02',
            visible: isHR
        },
        {
            title: 'Monthly Payroll',
            value: stats?.monthlyPayroll ? `₹${stats.monthlyPayroll}` : '₹0',
            icon: <AttachMoney />,
            color: '#2e7d32',
            visible: isHR
        },
        {
            title: 'Attendance Rate',
            value: stats?.attendanceRate ? `${stats.attendanceRate}%` : '0%',
            icon: <TrendingUp />,
            color: '#9c27b0',
            visible: true
        }
    ];

    const [accessRequests, setAccessRequests] = useState([]);
    const [requestActionLoading, setRequestActionLoading] = useState(null);

    useEffect(() => {
        fetchStats();
        if (user?.employeeId) {
            fetchTodayStatus();
            fetchEmployeeStats();
        }
        // Fetch requests for HR OR for restricted users (to check pending status)
        if (isHR || !user?.hasDataAccess) {
            fetchAccessRequests();
        }
    }, [refreshTrigger, isHR, user?.hasDataAccess]);

    const fetchAccessRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://by8labs-backend.onrender.com/api/access-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAccessRequests(response.data);
        } catch (error) {
            console.error('Error fetching access requests:', error);
        }
    };

    const handleApproveRequest = async (requestId) => {
        try {
            setRequestActionLoading(requestId);
            const token = localStorage.getItem('token');
            await axios.put(
                `https://by8labs-backend.onrender.com/api/access-requests/${requestId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Access request approved successfully' });
            fetchAccessRequests(); // Refresh list
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to approve request' });
        } finally {
            setRequestActionLoading(null);
        }
    };

    const handleRejectRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;
        try {
            setRequestActionLoading(requestId);
            const token = localStorage.getItem('token');
            await axios.put(
                `https://by8labs-backend.onrender.com/api/access-requests/${requestId}/reject`,
                { reason: 'HR rejected request' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'info', text: 'Access request rejected' });
            fetchAccessRequests(); // Refresh list
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reject request' });
        } finally {
            setRequestActionLoading(null);
        }
    };

    const hasPendingRequest = !isHR && !user?.hasDataAccess && accessRequests.some(req => req.status === 'Pending' && req.employeeId?._id === (user?._id || user?.id));

    const visibleStats = statsData.filter(stat => stat.visible);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Restricted Access View */}
            {!isHR && !user?.hasDataAccess ? (
                <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            maxWidth: 600,
                            textAlign: 'center'
                        }}
                    >
                        <LockOpen sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />

                        <Typography variant="h4" gutterBottom fontWeight="bold">
                            Access Required
                        </Typography>

                        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                            Welcome to BY8labs. To access your dashboard, employee details, and other features, you need to request approval from HR.
                        </Typography>

                        {hasPendingRequest ? (
                            <Alert
                                severity="info"
                                icon={<AccessTime fontSize="inherit" />}
                                sx={{ mb: 2, width: '100%' }}
                            >
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Request Pending
                                </Typography>
                                Your access request has been sent and is awaiting HR review. Please check back later.
                            </Alert>
                        ) : (
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Send />}
                                onClick={handleRequestAccess}
                                disabled={requestLoading}
                                sx={{ px: 4, py: 1.5 }}
                            >
                                {requestLoading ? 'Sending Request...' : 'Request Access'}
                            </Button>
                        )}
                    </Paper>
                </Box>
            ) : (
                /* Full Dashboard for HR or Approved Employees */
                <>
                    {/* Mark Attendance Buttons - Top Left */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            Mark Today's Attendance: {todayAttendance ? <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.9em' }}>
                                (Current: <strong>{todayAttendance.status}</strong>)
                            </Box> : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant={todayAttendance?.status === 'Present' ? "outlined" : "contained"}
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => handleMarkAttendance('Present')}
                                disabled={markingAttendance}
                                sx={{
                                    fontWeight: 'bold',
                                    backgroundColor: todayAttendance?.status === 'Present' ? 'transparent' : '#2e7d32',
                                    color: todayAttendance?.status === 'Present' ? '#2e7d32' : 'white',
                                    '&:hover': { backgroundColor: todayAttendance?.status === 'Present' ? 'rgba(46, 125, 50, 0.1)' : '#1b5e20' }
                                }}
                            >
                                Present
                            </Button>
                            <Button
                                variant={todayAttendance?.status === 'Permission' ? "outlined" : "contained"}
                                color="info"
                                startIcon={<AccessTime />}
                                onClick={() => handleMarkAttendance('Permission')}
                                disabled={markingAttendance}
                                sx={{
                                    fontWeight: 'bold',
                                    backgroundColor: todayAttendance?.status === 'Permission' ? 'transparent' : '#0288d1',
                                    color: todayAttendance?.status === 'Permission' ? '#0288d1' : 'white',
                                    '&:hover': { backgroundColor: todayAttendance?.status === 'Permission' ? 'rgba(2, 136, 209, 0.1)' : '#01579b' }
                                }}
                            >
                                Permission
                            </Button>
                            <Button
                                variant={todayAttendance?.status === 'Absent' ? "outlined" : "contained"}
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => handleMarkAttendance('Absent')}
                                disabled={markingAttendance}
                                sx={{
                                    fontWeight: 'bold',
                                    backgroundColor: todayAttendance?.status === 'Absent' ? 'transparent' : '#d32f2f',
                                    color: todayAttendance?.status === 'Absent' ? '#d32f2f' : 'white',
                                    '&:hover': { backgroundColor: todayAttendance?.status === 'Absent' ? 'rgba(211, 47, 47, 0.1)' : '#c62828' }
                                }}
                            >
                                Absent
                            </Button>
                        </Box>
                    </Box>

                    {/* HR: Pending Access Requests */}
                    {isHR && accessRequests.length > 0 && (
                        <Paper elevation={3} sx={{ p: 3, mb: 4, borderLeft: '6px solid #ed6c02' }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <LockOpen sx={{ mr: 1, color: '#ed6c02' }} />
                                Pending Access Requests ({accessRequests.length})
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                {accessRequests.map((req) => (
                                    <Box key={req._id} sx={{
                                        p: 2,
                                        mb: 1,
                                        bgcolor: 'background.default',
                                        borderRadius: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 2
                                    }}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {req.employeeId?.username} ({req.employeeId?.email})
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {req.employeeId?.role} • {new Date(req.createdAt).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                "{req.requestMessage}"
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleApproveRequest(req._id)}
                                                disabled={requestActionLoading === req._id}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleRejectRequest(req._id)}
                                                disabled={requestActionLoading === req._id}
                                            >
                                                Reject
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* Main Dashboard Layout with Calendar on Left */}
                    <Grid container spacing={3}>
                        {/* LEFT SIDE - Attendance Calendar */}
                        <Grid item xs={12} md={3}>
                            <AttendanceCalendar refreshTrigger={refreshTrigger} />
                        </Grid>

                        {/* RIGHT SIDE - Dashboard Content */}
                        <Grid item xs={12} md={9}>
                            <Grid container spacing={3}>
                                {visibleStats.map((stat, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card elevation={3}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                                                        {stat.icon}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h5" component="div">
                                                            {stat.value}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {stat.title}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Employee Stats - For both Employees and HR with employee profile */}
                            {user?.employeeId && employeeStats && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h5" gutterBottom>
                                        My Attendance & Leave Summary (This Month)
                                    </Typography>
                                    <Grid container spacing={3} sx={{ mb: 3 }}>
                                        {/* Present Days */}
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card elevation={3}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Avatar sx={{ bgcolor: '#2e7d32', mr: 2 }}>
                                                            <CheckCircle />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h5">
                                                                {employeeStats?.attendance?.present || 0}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Present Days
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        {/* Absent Days */}
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card elevation={3}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Avatar sx={{ bgcolor: '#d32f2f', mr: 2 }}>
                                                            <Cancel />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h5">
                                                                {employeeStats?.attendance?.absent || 0}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Absent Days
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        {/* Permission Days */}
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card elevation={3}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Avatar sx={{ bgcolor: '#ed6c02', mr: 2 }}>
                                                            <AccessTime />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h5">
                                                                {employeeStats?.attendance?.permission || 0}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Permission Days
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        {/* Total Annual Leave */}
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card elevation={3}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Avatar sx={{ bgcolor: '#9c27b0', mr: 2 }}>
                                                            <EventNote />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h5">
                                                                {employeeStats?.leave?.totalLeave || 12} days
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Total Leave (Per Year)
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        {/* Leave Taken */}
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card elevation={3}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Avatar sx={{ bgcolor: '#ed6c02', mr: 2 }}>
                                                            <EventNote />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h5">
                                                                {employeeStats?.leave?.usedLeave || 0}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Leave Taken
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        {/* Remaining Leave */}
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card elevation={3}>
                                                <CardContent>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                                                            <TrendingUp />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h5">
                                                                {employeeStats?.leave?.remainingLeave || 0}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Remaining Leave
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Grid>
                    </Grid>

                    {/* Additional Info Section */}
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={8}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Quick Actions
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isHR
                                        ? 'Manage employees, approve leaves, generate payroll, and view reports.'
                                        : 'View your attendance, apply for leaves, check payslips, and submit expense claims.'}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Recent Activity
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    No recent activity
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
            {/* Snackbar for Notifications */}
            <Snackbar
                open={snackMessage.open}
                autoHideDuration={6000}
                onClose={handleCloseSnack}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnack} severity={snackMessage.severity} sx={{ width: '100%' }}>
                    {snackMessage.text}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Dashboard;
