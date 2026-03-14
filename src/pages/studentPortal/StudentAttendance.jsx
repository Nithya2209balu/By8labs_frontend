import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Card, CardContent, CircularProgress,
    Alert, Grid, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { EventAvailable, Cancel, CheckCircle } from '@mui/icons-material';
import { attendanceAPI } from '../../services/studentPortalAPI';

const StudentAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState(null);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                setLoading(true);
                const [summaryRes, recordsRes] = await Promise.all([
                    attendanceAPI.getSummary(),
                    attendanceAPI.getMyAttendance()
                ]);

                if (summaryRes.data.success) {
                    setSummary(summaryRes.data.data);
                }
                
                if (recordsRes.data.success) {
                    setRecords(recordsRes.data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch attendance:', err);
                setError(err.response?.data?.message || 'Failed to load attendance data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    My Attendance
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Review your attendance summary and detailed history.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Summary Cards */}
            {summary && (
                <Grid container spacing={3} mb={5}>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: '100%' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                                <EventAvailable sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h3" fontWeight="bold">{summary.totalClasses || 0}</Typography>
                                <Typography variant="subtitle1">Total Classes</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText', height: '100%' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                                <CheckCircle sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h3" fontWeight="bold">{summary.attended || 0}</Typography>
                                <Typography variant="subtitle1">Attended</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ bgcolor: summary.percentage >= 75 ? 'info.main' : 'warning.main', color: '#fff', height: '100%' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                                <Typography variant="h3" fontWeight="bold">
                                    {summary.percentage ? summary.percentage.toFixed(1) : 0}%
                                </Typography>
                                <Typography variant="subtitle1">Attendance Rate</Typography>
                                {summary.percentage < 75 && (
                                    <Typography variant="caption" sx={{ mt: 1, opacity: 0.9 }}>
                                        Warning: Below 75% threshold
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Detailed Records Table */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Attendance History
            </Typography>
            <TableContainer component={Paper} elevation={2}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Course / Subject</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    No attendance records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record) => (
                                <TableRow key={record._id} hover>
                                    <TableCell>
                                        {new Date(record.date).toLocaleDateString(undefined, {
                                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell>{record.course?.title || record.courseName || 'General'}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={record.status} 
                                            color={record.status?.toLowerCase() === 'present' ? 'success' : record.status?.toLowerCase() === 'absent' ? 'error' : 'warning'} 
                                            size="small" 
                                            variant={record.status?.toLowerCase() === 'present' ? 'filled' : 'outlined'}
                                            icon={record.status?.toLowerCase() === 'present' ? <CheckCircle fontSize="small" /> : record.status?.toLowerCase() === 'absent' ? <Cancel fontSize="small" /> : undefined}
                                        />
                                    </TableCell>
                                    <TableCell>{record.remarks || '—'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default StudentAttendance;
