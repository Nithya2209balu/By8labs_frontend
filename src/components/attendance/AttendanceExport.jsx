import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    Grid,
    Alert,
    CircularProgress
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { attendanceAPI } from '../../services/api';

const AttendanceExport = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleExport = async () => {
        if (!startDate || !endDate) {
            setMessage({
                type: 'error',
                text: 'Please select both start and end dates'
            });
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setMessage({
                type: 'error',
                text: 'Start date must be before end date'
            });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const response = await attendanceAPI.exportExcel({
                startDate,
                endDate
            });

            // Create blob and download
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance-report-${startDate}-to-${endDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setMessage({
                type: 'success',
                text: 'Excel file downloaded successfully!'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to export attendance data'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuickExport = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Export Attendance Report
            </Typography>

            {message.text && (
                <Alert
                    severity={message.type}
                    onClose={() => setMessage({ type: '', text: '' })}
                    sx={{ mb: 2 }}
                >
                    {message.text}
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Quick Selection:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleQuickExport(7)}
                    >
                        Last 7 Days
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleQuickExport(30)}
                    >
                        Last 30 Days
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                            const now = new Date();
                            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                            setStartDate(firstDay.toISOString().split('T')[0]);
                            setEndDate(now.toISOString().split('T')[0]);
                        }}
                    >
                        Current Month
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                            const now = new Date();
                            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                            const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
                            setStartDate(lastMonth.toISOString().split('T')[0]);
                            setEndDate(lastDay.toISOString().split('T')[0]);
                        }}
                    >
                        Last Month
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="date"
                        label="Start Date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                            max: endDate || new Date().toISOString().split('T')[0]
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        type="date"
                        label="End Date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                            min: startDate,
                            max: new Date().toISOString().split('T')[0]
                        }}
                    />
                </Grid>
            </Grid>

            <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Download />}
                onClick={handleExport}
                disabled={loading || !startDate || !endDate}
            >
                {loading ? 'Generating Excel...' : 'Download Excel Report'}
            </Button>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Report Details:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    • The Excel file will contain two sheets
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    • Sheet 1: Detailed attendance records with employee information, dates, and status
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    • Sheet 2: Monthly summary with statistics including attendance percentage
                </Typography>
            </Box>
        </Paper>
    );
};

export default AttendanceExport;
