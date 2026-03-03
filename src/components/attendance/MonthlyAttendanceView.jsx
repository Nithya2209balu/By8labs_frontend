import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { attendanceAPI } from '../../services/api';

const MonthlyAttendanceView = () => {
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadMonthlySummary();
    }, [month, year]);

    const loadMonthlySummary = async () => {
        try {
            setLoading(true);
            const response = await attendanceAPI.monthlySummary({ month, year });
            setSummary(response.data.summary || []);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load monthly summary'
            });
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };

    const getStatusForDate = (attendanceRecords, date) => {
        const record = attendanceRecords.find(rec => {
            const recDate = new Date(rec.date);
            return recDate.getDate() === date;
        });
        return record?.status || null;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'success';
            case 'Absent': return 'error';
            case 'Half Day': return 'warning';
            case 'Work From Home': return 'info';
            case 'On Leave': return 'default';
            default: return 'default';
        }
    };

    const getStatusSymbol = (status) => {
        switch (status) {
            case 'Present': return 'P';
            case 'Absent': return 'A';
            case 'Half Day': return 'H';
            case 'Work From Home': return 'W';
            case 'On Leave': return 'L';
            default: return '-';
        }
    };

    const daysInMonth = getDaysInMonth(month, year);
    const dateArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {message.text && (
                <Alert
                    severity={message.type}
                    onClose={() => setMessage({ type: '', text: '' })}
                    sx={{ mb: 2 }}
                >
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                    <TextField
                        fullWidth
                        select
                        label="Month"
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        SelectProps={{ native: true }}
                    >
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={6} md={3}>
                    <TextField
                        fullWidth
                        select
                        label="Year"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        SelectProps={{ native: true }}
                    >
                        {[...Array(5)].map((_, i) => {
                            const y = currentDate.getFullYear() - 2 + i;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </TextField>
                </Grid>
            </Grid>

            {summary.length === 0 ? (
                <Paper sx={{ p: 3 }}>
                    <Typography color="textSecondary" align="center">
                        No attendance records found for this month
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        minWidth: 120,
                                        position: 'sticky',
                                        left: 0,
                                        background: 'white',
                                        zIndex: 2
                                    }}
                                >
                                    Employee
                                </TableCell>
                                <TableCell>Dept</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Present</TableCell>
                                <TableCell>Absent</TableCell>
                                <TableCell>%</TableCell>
                                {dateArray.map(date => (
                                    <TableCell
                                        key={date}
                                        align="center"
                                        sx={{ minWidth: 40 }}
                                    >
                                        {date}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {summary.map((employee) => (
                                <TableRow key={employee.employeeId}>
                                    <TableCell
                                        sx={{
                                            position: 'sticky',
                                            left: 0,
                                            background: 'white',
                                            zIndex: 1
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {employee.firstName} {employee.lastName}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {employee.employeeId}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{employee.department}</TableCell>
                                    <TableCell>{employee.totalDays}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={employee.present}
                                            color="success"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={employee.absent}
                                            color="error"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color={employee.attendancePercentage >= 75 ? 'success.main' : 'error.main'}
                                        >
                                            {employee.attendancePercentage}%
                                        </Typography>
                                    </TableCell>
                                    {dateArray.map(date => {
                                        const status = getStatusForDate(employee.attendanceRecords, date);
                                        return (
                                            <TableCell
                                                key={date}
                                                align="center"
                                                sx={{
                                                    bgcolor: status === 'Present' ? 'success.light' :
                                                        status === 'Absent' ? 'error.light' :
                                                            status === 'Work From Home' ? 'info.light' :
                                                                'transparent',
                                                    color: status ? 'white' : 'inherit',
                                                    fontWeight: status ? 'bold' : 'normal'
                                                }}
                                            >
                                                {status ? getStatusSymbol(status) : '-'}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                    <strong>Legend:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption">P - Present</Typography>
                    <Typography variant="caption">A - Absent</Typography>
                    <Typography variant="caption">H - Half Day</Typography>
                    <Typography variant="caption">W - Work From Home</Typography>
                    <Typography variant="caption">L - On Leave</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default MonthlyAttendanceView;
