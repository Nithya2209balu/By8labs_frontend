import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper,
    TextField,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Card,
    CardContent,
    Alert
} from '@mui/material';
import {
    PictureAsPdf,
    TableChart,
    Description,
    Print,
    Search
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import jsPDF from 'jspdf';

const Reports = () => {
    const { user, isHR, role } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [reportType, setReportType] = useState('');
    const [reportData, setReportData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Filter state
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        month: '',
        date: '',
        department: '',
        status: '',
        search: ''
    });

    const reportCategories = [
        { label: 'Employee Reports', value: 0, roles: ['HR'] },
        { label: 'Attendance Reports', value: 1, roles: ['HR', 'Manager', 'Employee'] },
        { label: 'Payroll Reports', value: 2, roles: ['HR', 'Manager', 'Employee'] },
        { label: 'Recruitment Reports', value: 3, roles: ['HR'] },
    ];

    const employeeReportTypes = [
        { label: 'Employee List', value: 'employee-list' },
        { label: 'Department-wise Report', value: 'department-wise' },
        { label: 'Active/Inactive Report', value: 'status-report' }
    ];

    const attendanceReportTypes = [
        { label: 'Daily Attendance', value: 'daily' },
        { label: 'Monthly Summary', value: 'monthly' },
        { label: 'Absent/Late Report', value: 'absent-late' }
    ];

    const payrollReportTypes = [
        { label: 'Monthly Salary Report', value: 'monthly-salary' },
        { label: 'LOP Report', value: 'lop' },
        { label: 'Bank Payment Report', value: 'bank-payment' }
    ];

    const recruitmentReportTypes = [
        { label: 'Candidate List', value: 'candidates' },
        { label: 'Interview Schedule', value: 'interviews' },
        { label: 'Selected/Rejected', value: 'selections' },
        { label: 'Interviewer-wise', value: 'interviewer-wise' }
    ];

    const getReportTypes = () => {
        switch (tabValue) {
            case 0: return employeeReportTypes;
            case 1: return attendanceReportTypes;
            case 2: return payrollReportTypes;
            case 3: return recruitmentReportTypes;
            default: return [];
        }
    };

    const generateReport = async () => {
        if (!reportType) {
            setMessage({ type: 'error', text: 'Please select a report type' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            let endpoint = '';
            let params = {};

            // Build endpoint based on tab and report type
            switch (tabValue) {
                case 0: // Employee
                    if (reportType === 'employee-list') {
                        endpoint = '/reports/employees/list';
                        params = { department: filters.department, search: filters.search };
                    } else if (reportType === 'department-wise') {
                        endpoint = '/reports/employees/department-wise';
                        params = { search: filters.search };
                    } else if (reportType === 'status-report') {
                        endpoint = '/reports/employees/status';
                        params = { search: filters.search };
                    }
                    break;

                case 1: // Attendance
                    if (reportType === 'daily') {
                        endpoint = '/reports/attendance/daily';
                        params = { date: filters.date, search: filters.search };
                    } else if (reportType === 'monthly') {
                        endpoint = '/reports/attendance/monthly';
                        params = { month: filters.month, search: filters.search };
                    } else if (reportType === 'absent-late') {
                        endpoint = '/reports/attendance/absent-late';
                        params = { startDate: filters.startDate, endDate: filters.endDate, search: filters.search };
                    }
                    break;

                case 2: // Payroll
                    if (reportType === 'monthly-salary') {
                        endpoint = '/reports/payroll/monthly';
                        params = { month: filters.month, search: filters.search };
                    } else if (reportType === 'lop') {
                        endpoint = '/reports/payroll/lop';
                        params = { startDate: filters.startDate, endDate: filters.endDate, search: filters.search };
                    } else if (reportType === 'bank-payment') {
                        endpoint = '/reports/payroll/bank-payment';
                        params = { month: filters.month, search: filters.search };
                    }
                    break;

                case 3: // Recruitment
                    if (reportType === 'candidates') {
                        endpoint = '/reports/recruitment/candidates';
                        params = { status: filters.status, search: filters.search };
                    } else if (reportType === 'interviews') {
                        endpoint = '/reports/recruitment/interviews';
                        params = { startDate: filters.startDate, endDate: filters.endDate, search: filters.search };
                    } else if (reportType === 'selections') {
                        endpoint = '/reports/recruitment/selections';
                        params = { startDate: filters.startDate, endDate: filters.endDate, search: filters.search };
                    } else if (reportType === 'interviewer-wise') {
                        endpoint = '/reports/recruitment/interviewer-wise';
                        params = { search: filters.search };
                    }
                    break;

                default:
                    break;
            }

            const response = await api.get(endpoint, { params });
            setReportData(response.data.data || []);
            setSummary(response.data.summary || null);
            setMessage({ type: 'success', text: 'Report generated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate report' });
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        if (reportData.length === 0) {
            setMessage({ type: 'error', text: 'No data to export' });
            return;
        }

        try {
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(16);
            const reportTitles = {
                'employee-list': 'Employee List Report',
                'department-wise': 'Department-wise Report',
                'status-report': 'Employee Status Report',
                'daily': 'Daily Attendance Report',
                'monthly': 'Monthly Attendance Summary',
                'absent-late': 'Absent/Late Report',
                'monthly-salary': 'Monthly Salary Report',
                'lop': 'Loss of Pay Report',
                'bank-payment': 'Bank Payment Report',
                'candidates': 'Candidate List Report',
                'interviews': 'Interview Schedule Report',
                'selections': 'Selection/Rejection Report',
                'interviewer-wise': 'Interviewer-wise Report'
            };

            doc.text(reportTitles[reportType] || 'Report', 14, 15);

            // Add date
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

            // Add summary if available
            let yPosition = 30;
            if (summary) {
                doc.setFontSize(12);
                doc.text('Summary:', 14, yPosition);
                doc.setFontSize(10);
                yPosition += 7;

                Object.entries(summary).forEach(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    doc.text(`${label}: ${value}`, 14, yPosition);
                    yPosition += 5;
                });

                yPosition += 5;
            }

            // Add note about data
            doc.setFontSize(10);
            doc.text(`Total Records: ${reportData.length}`, 14, yPosition);
            yPosition += 10;

            // Add instructions
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text('For detailed tabular data, please use the CSV export option.', 14, yPosition);
            doc.setTextColor(0);

            // Add first few records as sample (up to 20)
            yPosition += 10;
            doc.setFontSize(8);
            const sampleSize = Math.min(reportData.length, 20);

            for (let i = 0; i < sampleSize; i++) {
                const row = reportData[i];
                const rowText = Object.entries(row)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' | ');

                // Split long text to fit page width
                const lines = doc.splitTextToSize(rowText, 180);
                lines.forEach(line => {
                    if (yPosition > 280) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, 14, yPosition);
                    yPosition += 5;
                });
                yPosition += 2;
            }

            if (reportData.length > sampleSize) {
                yPosition += 5;
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(`... and ${reportData.length - sampleSize} more records. Use CSV export for complete data.`, 14, yPosition);
            }

            // Save PDF
            const fileName = `${reportTitles[reportType] || 'Report'}_${Date.now()}.pdf`;
            doc.save(fileName);

            setMessage({ type: 'success', text: 'Report exported to PDF successfully' });
        } catch (error) {
            console.error('PDF export error:', error);
            setMessage({ type: 'error', text: 'Failed to export PDF: ' + error.message });
        }
    };

    const exportToExcel = () => {
        // Simple CSV export
        if (reportData.length === 0) {
            setMessage({ type: 'error', text: 'No data to export' });
            return;
        }

        const headers = Object.keys(reportData[0]).join(',');
        const rows = reportData.map(row => Object.values(row).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage({ type: 'success', text: 'Report exported to CSV successfully' });
    };

    const handlePrint = () => {
        window.print();
    };

    const renderFilters = () => {
        return (
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Report Type"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            {getReportTypes().map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Always-visible search */}
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="Search by Name / ID / Keyword"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            InputProps={{
                                startAdornment: <Search />
                            }}
                        />
                    </Grid>

                    {/* Date filters based on report type */}
                    {(reportType === 'daily') && (
                        <Grid item xs={12} md={3}>
                            <TextField
                                type="date"
                                fullWidth
                                label="Date"
                                value={filters.date}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    )}

                    {(reportType === 'monthly' || reportType === 'monthly-salary' || reportType === 'bank-payment') && (
                        <Grid item xs={12} md={3}>
                            <TextField
                                type="month"
                                fullWidth
                                label="Month"
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    )}

                    {(reportType === 'absent-late' || reportType === 'lop' || reportType === 'interviews' || reportType === 'selections') && (
                        <>
                            <Grid item xs={12} md={2}>
                                <TextField
                                    type="date"
                                    fullWidth
                                    label="Start Date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <TextField
                                    type="date"
                                    fullWidth
                                    label="End Date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={generateReport}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    const renderSummary = () => {
        if (!summary) return null;

        return (
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {Object.entries(summary).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" variant="body2">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </Typography>
                                <Typography variant="h5" fontWeight="bold">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    const renderTable = () => {
        if (!reportData || reportData.length === 0) {
            return (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        No data available. Please select filters and generate a report.
                    </Typography>
                </Paper>
            );
        }

        // Additional safety check
        if (!reportData[0] || typeof reportData[0] !== 'object') {
            return (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">
                        Invalid data format. Please try generating the report again.
                    </Typography>
                </Paper>
            );
        }

        const columns = Object.keys(reportData[0]);

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map(col => (
                                <TableCell key={col} sx={{ fontWeight: 'bold' }}>
                                    {col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reportData.map((row, idx) => (
                            <TableRow key={idx}>
                                {columns.map(col => (
                                    <TableCell key={col}>
                                        {typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Reports Module
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate and export various HR reports with filters
            </Typography>

            {message.text && (
                <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => { setTabValue(newValue); setReportType(''); setReportData([]); }}>
                    {reportCategories
                        .filter(cat => isHR || cat.roles.includes(role))
                        .map(cat => (
                            <Tab key={cat.value} label={cat.label} />
                        ))}
                </Tabs>
            </Paper>

            {renderFilters()}

            {reportData.length > 0 && (
                <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
                    <Button startIcon={<PictureAsPdf />} onClick={exportToPDF} variant="outlined">
                        Export PDF
                    </Button>
                    <Button startIcon={<TableChart />} onClick={exportToExcel} variant="outlined">
                        Export CSV
                    </Button>
                    <Button startIcon={<Print />} onClick={handlePrint} variant="outlined">
                        Print
                    </Button>
                </Box>
            )}

            {renderSummary()}
            {renderTable()}
        </Container>
    );
};

export default Reports;
