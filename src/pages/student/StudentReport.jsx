import React, { useState } from 'react';
import axios from 'axios';
import {
    Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Grid, FormControl, InputLabel, Select, MenuItem,
    TextField, Chip, CircularProgress, Alert, CardContent, Card
} from '@mui/material';
import { Assessment, Print } from '@mui/icons-material';

const API = '/api';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const REPORT_TYPES = [
    { value: 'students', label: 'Student List Report', color: '#3b82f6' },
    { value: 'attendance', label: 'Attendance Report', color: '#10b981' },
    { value: 'fees', label: 'Fee Report', color: '#f59e0b' },
    { value: 'leaves', label: 'Leave Report', color: '#8b5cf6' },
    { value: 'courses', label: 'Course Report', color: '#14b8a6' },
    { value: 'performance', label: 'Overall Performance Report', color: '#ec4899' },
];

const renderTable = (type, data) => {
    if (!data?.length) return <Typography color="text.secondary" p={2}>No data found</Typography>;

    switch (type) {
        case 'students':
            return (
                <Table size="small">
                    <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Course</TableCell><TableCell>Enrollment</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                    <TableBody>{data.map(r => (<TableRow key={r._id}><TableCell><Chip label={r.studentId} size="small" variant="outlined" /></TableCell><TableCell fontWeight={600}>{r.name}</TableCell><TableCell>{r.email || '—'}</TableCell><TableCell>{r.course?.courseName || '—'}</TableCell><TableCell>{r.enrollmentDate ? new Date(r.enrollmentDate).toLocaleDateString() : '—'}</TableCell><TableCell><Chip label={r.status} size="small" color={r.status === 'Active' ? 'success' : 'default'} /></TableCell></TableRow>))}</TableBody>
                </Table>
            );
        case 'attendance':
            return (
                <Table size="small">
                    <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell align="center">Total</TableCell><TableCell align="center">Present</TableCell><TableCell align="center">Absent</TableCell><TableCell align="center">Late</TableCell><TableCell align="center">%</TableCell></TableRow></TableHead>
                    <TableBody>{data.map(r => (<TableRow key={r._id}><TableCell>{r.studentId}</TableCell><TableCell>{r.name}</TableCell><TableCell align="center">{r.total}</TableCell><TableCell align="center"><Chip label={r.present} size="small" color="success" variant="outlined" /></TableCell><TableCell align="center"><Chip label={r.absent} size="small" color="error" variant="outlined" /></TableCell><TableCell align="center"><Chip label={r.late} size="small" color="warning" variant="outlined" /></TableCell><TableCell align="center"><Chip label={`${r.percentage?.toFixed(1)}%`} size="small" color={r.percentage >= 75 ? 'success' : 'error'} /></TableCell></TableRow>))}</TableBody>
                </Table>
            );
        case 'fees':
            return (
                <Table size="small">
                    <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Fee Type</TableCell><TableCell>Amount</TableCell><TableCell>Paid</TableCell><TableCell>Balance</TableCell><TableCell>Due Date</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                    <TableBody>{data.map(r => (<TableRow key={r._id}><TableCell>{r.student?.name} ({r.student?.studentId})</TableCell><TableCell>{r.feeType}</TableCell><TableCell>₹{r.amount?.toLocaleString()}</TableCell><TableCell>₹{r.paidAmount?.toLocaleString()}</TableCell><TableCell sx={{ color: r.amount - r.paidAmount > 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>₹{(r.amount - r.paidAmount).toLocaleString()}</TableCell><TableCell>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}</TableCell><TableCell><Chip label={r.status} size="small" color={{ Paid: 'success', Pending: 'warning', Partial: 'info', Overdue: 'error' }[r.status]} /></TableCell></TableRow>))}</TableBody>
                </Table>
            );
        case 'leaves':
            return (
                <Table size="small">
                    <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Type</TableCell><TableCell>From</TableCell><TableCell>To</TableCell><TableCell>Days</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                    <TableBody>{data.map(r => (<TableRow key={r._id}><TableCell>{r.student?.name} ({r.student?.studentId})</TableCell><TableCell>{r.leaveType}</TableCell><TableCell>{new Date(r.startDate).toLocaleDateString()}</TableCell><TableCell>{new Date(r.endDate).toLocaleDateString()}</TableCell><TableCell>{r.totalDays}</TableCell><TableCell><Chip label={r.status} size="small" color={{ Pending: 'warning', Approved: 'success', Rejected: 'error' }[r.status]} /></TableCell></TableRow>))}</TableBody>
                </Table>
            );
        case 'courses':
            return (
                <Table size="small">
                    <TableHead><TableRow><TableCell>Course Name</TableCell><TableCell>Code</TableCell><TableCell>Faculty</TableCell><TableCell>Year</TableCell><TableCell>Duration</TableCell><TableCell>Students</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                    <TableBody>{data.map(r => (<TableRow key={r._id}><TableCell fontWeight={600}>{r.courseName}</TableCell><TableCell><Chip label={r.courseCode} size="small" variant="outlined" /></TableCell><TableCell>{r.faculty || '—'}</TableCell><TableCell>{r.academicYear || '—'}</TableCell><TableCell>{r.duration || '—'}</TableCell><TableCell>{(r.enrolledStudents || []).length}</TableCell><TableCell><Chip label={r.status} size="small" color={r.status === 'Active' ? 'success' : 'default'} /></TableCell></TableRow>))}</TableBody>
                </Table>
            );
        case 'performance':
            return (
                <Table size="small">
                    <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Course</TableCell><TableCell align="center">Attendance %</TableCell><TableCell align="center">Fees Pending</TableCell><TableCell align="center">Leaves Approved</TableCell></TableRow></TableHead>
                    <TableBody>{data.map(r => (<TableRow key={r.studentId}><TableCell>{r.studentId}</TableCell><TableCell fontWeight={600}>{r.name}</TableCell><TableCell>{r.course}</TableCell><TableCell align="center"><Chip label={`${r.attendancePercentage}%`} size="small" color={r.attendancePercentage >= 75 ? 'success' : 'error'} /></TableCell><TableCell align="center"><Chip label={r.feesPending} size="small" color={r.feesPending > 0 ? 'warning' : 'success'} /></TableCell><TableCell align="center">{r.leavesApproved}</TableCell></TableRow>))}</TableBody>
                </Table>
            );
        default:
            return null;
    }
};

export default function StudentReport() {
    const [reportType, setReportType] = useState('students');
    const [reportData, setReportData] = useState(null);
    const [summary, setSummary] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedAt, setGeneratedAt] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (status) params.status = status;
            const res = await axios.get(`${API}/student-reports/${reportType}`, { headers: headers(), params });
            setReportData(res.data.data || []);
            setSummary(res.data.summary || null);
            setGeneratedAt(res.data.generatedAt);
        } catch (err) {
            setError('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const chosen = REPORT_TYPES.find(r => r.value === reportType);

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} color="primary.dark" mb={3}>📊 Reports</Typography>

            {/* Report Type Cards */}
            <Grid container spacing={2} mb={3}>
                {REPORT_TYPES.map(r => (
                    <Grid item xs={12} sm={6} md={4} key={r.value}>
                        <Card
                            variant={reportType === r.value ? 'elevation' : 'outlined'}
                            onClick={() => { setReportType(r.value); setReportData(null); }}
                            sx={{
                                cursor: 'pointer',
                                border: reportType === r.value ? `2px solid ${r.color}` : undefined,
                                background: reportType === r.value ? `${r.color}10` : undefined,
                                transition: 'all 0.2s',
                                '&:hover': { boxShadow: `0 4px 12px ${r.color}30`, transform: 'translateY(-2px)' }
                            }}
                        >
                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Assessment sx={{ color: r.color }} />
                                    <Typography variant="body2" fontWeight={600} color={reportType === r.value ? r.color : 'text.primary'}>{r.label}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    {['attendance', 'leaves', 'fees'].includes(reportType) && (
                        <>
                            <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
                        </>
                    )}
                    {['students', 'fees', 'leaves'].includes(reportType) && (
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    {reportType === 'students' && ['Active', 'Inactive'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    {reportType === 'fees' && ['Paid', 'Pending', 'Partial', 'Overdue'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    {reportType === 'leaves' && ['Pending', 'Approved', 'Rejected'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                    <Grid item xs={12} sm={3}>
                        <Button variant="contained" startIcon={<Assessment />} onClick={handleGenerate} fullWidth disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Report'}
                        </Button>
                    </Grid>
                    {reportData && (
                        <Grid item xs={12} sm={3}>
                            <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()} fullWidth>Print / PDF</Button>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {reportData && (
                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={700} color={chosen?.color}>{chosen?.label}</Typography>
                        <Box display="flex" gap={1}>
                            <Chip label={`${reportData.length} records`} size="small" />
                            {generatedAt && <Chip label={`Generated: ${new Date(generatedAt).toLocaleString()}`} size="small" variant="outlined" />}
                        </Box>
                    </Box>

                    {summary && (
                        <Paper sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #86efac' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={4}><Typography variant="body2" color="text.secondary">Total Amount</Typography><Typography variant="h6" fontWeight={700}>₹{summary.totalAmount?.toLocaleString()}</Typography></Grid>
                                <Grid item xs={4}><Typography variant="body2" color="text.secondary">Total Paid</Typography><Typography variant="h6" fontWeight={700} color="success.main">₹{summary.totalPaid?.toLocaleString()}</Typography></Grid>
                                <Grid item xs={4}><Typography variant="body2" color="text.secondary">Total Pending</Typography><Typography variant="h6" fontWeight={700} color="error.main">₹{summary.totalPending?.toLocaleString()}</Typography></Grid>
                            </Grid>
                        </Paper>
                    )}

                    <TableContainer component={Paper}>{renderTable(reportType, reportData)}</TableContainer>
                </Box>
            )}

            {!reportData && !loading && (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f9fafb' }}>
                    <Assessment sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Select a report type and click "Generate Report"</Typography>
                </Paper>
            )}
        </Box>
    );
}
