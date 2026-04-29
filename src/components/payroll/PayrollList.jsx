import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TablePagination,
    InputAdornment,
    TableSortLabel,
    FormControl,
    InputLabel,
    Select,
    Menu,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { Download, Visibility, Search, MoreVert, Close } from '@mui/icons-material';
import { payrollAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SalarySlipView from './SalarySlipView';

const PayrollList = () => {
    const { user, isHR } = useAuth();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    // Download menu state
    const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);
    const [selectedPayrollId, setSelectedPayrollId] = useState(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');

    // Sorting state
    const [orderBy, setOrderBy] = useState('employeeId');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        loadPayrolls();
    }, [filters]);

    const loadPayrolls = async () => {
        try {
            setLoading(true);
            let response;

            console.log('🔍 PayrollList Debug:', {
                isHR,
                userRole: user?.role,
                userEmail: user?.email
            });

            if (isHR) {
                console.log('✅ Fetching ALL employee payroll (HR view)');
                response = await payrollAPI.getAll(filters);
            } else {
                console.log('📊 Fetching own payroll only (Employee view)');
                // Fetch payroll by email - automatically finds employee record
                response = await payrollAPI.getMyPayroll();
            }

            console.log('📋 Payroll records received:', response.data.length);
            setPayrolls(response.data);
        } catch (error) {
            console.error('❌ Payroll load error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load payroll data'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewSlip = (payroll) => {
        setSelectedPayroll(payroll);
        setViewDialogOpen(true);
    };

    const handleDownloadMenuOpen = (event, payrollId) => {
        setDownloadMenuAnchor(event.currentTarget);
        setSelectedPayrollId(payrollId);
    };

    const handleDownloadMenuClose = () => {
        setDownloadMenuAnchor(null);
        setSelectedPayrollId(null);
    };

    const handleDownloadPDF = async (payrollId, withTax = true) => {
        handleDownloadMenuClose();

        try {
            const response = await payrollAPI.downloadSlip(payrollId, withTax);

            // Create blob from response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const taxSuffix = withTax ? 'WithTax' : 'WithoutTax';
            link.download = `Salary_Slip_${taxSuffix}_${payrollId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            const formatType = withTax ? 'with tax deductions' : 'without tax deductions';
            setMessage({ type: 'success', text: `Salary slip (${formatType}) downloaded successfully` });
        } catch (error) {
            // Log detailed error for debugging
            console.error('PDF Download Error:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);

            // If error.response.data is a Blob (JSON error from server), convert it to text
            if (error.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const errorData = JSON.parse(reader.result);
                        console.error('Error JSON:', errorData);

                        // Show detailed error in alert
                        const errorDetails = errorData.debug
                            ? `Step: ${errorData.debug.step}\nError: ${errorData.debug.error}\nUser: ${errorData.debug.user?.email}\nPayroll ID: ${errorData.debug.payrollId}`
                            : errorData.message || 'Unknown error';

                        alert(`PDF DOWNLOAD FAILED:\n\n${errorDetails}`);

                        setMessage({
                            type: 'error',
                            text: errorData.message || 'Failed to download salary slip'
                        });
                    } catch (e) {
                        console.error('Error parsing error blob:', e);
                        alert(`PDF DOWNLOAD FAILED:\n\nCould not parse error details`);
                        setMessage({ type: 'error', text: 'Failed to download salary slip' });
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                // Regular error handling
                const errorMsg = error.response?.data?.message || error.message || 'Failed to download salary slip';
                alert(`PDF DOWNLOAD FAILED:\n\n${errorMsg}`);
                setMessage({ type: 'error', text: errorMsg });
            }
        }
    };

    const formatMonth = (month, year) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[month - 1]} ${year}`;
    };



    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Sorting handler
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filter and search logic
    const filteredPayrolls = payrolls.filter((payroll) => {
        // Search filter (by employee name or ID)
        const searchMatch = searchTerm === '' ||
            payroll.employeeId?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${payroll.employeeId?.firstName} ${payroll.employeeId?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

        // Department filter
        const departmentMatch = departmentFilter === 'All' || payroll.employeeId?.department === departmentFilter;

        return searchMatch && departmentMatch;
    });

    // Sorting logic
    const sortedPayrolls = filteredPayrolls.sort((a, b) => {
        let aValue, bValue;

        if (orderBy === 'employeeId') {
            aValue = a.employeeId?.employeeId || '';
            bValue = b.employeeId?.employeeId || '';
        } else if (orderBy === 'employeeName') {
            aValue = `${a.employeeId?.firstName} ${a.employeeId?.lastName}`;
            bValue = `${b.employeeId?.firstName} ${b.employeeId?.lastName}`;
        } else if (orderBy === 'department') {
            aValue = a.employeeId?.department || '';
            bValue = b.employeeId?.department || '';
        } else {
            aValue = a[orderBy];
            bValue = b[orderBy];
        }

        // String comparison
        if (typeof aValue === 'string') {
            return order === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        // Numeric comparison
        return order === 'asc' ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
    });

    // Paginated data
    const paginatedPayrolls = sortedPayrolls.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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

            {isHR && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by Employee Name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Department</InputLabel>
                                <Select
                                    value={departmentFilter}
                                    label="Department"
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                >
                                    <MenuItem value="All">All Departments</MenuItem>
                                    <MenuItem value="IT">IT</MenuItem>
                                    <MenuItem value="HR">HR</MenuItem>
                                    <MenuItem value="Finance">Finance</MenuItem>
                                    <MenuItem value="Marketing">Marketing</MenuItem>
                                    <MenuItem value="Sales">Sales</MenuItem>
                                    <MenuItem value="Operations">Operations</MenuItem>
                                    <MenuItem value="Support">Support</MenuItem>
                                    <MenuItem value="Management">Management</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                select
                                label="Month"
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                            >
                                {months.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>
                                        {m.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                select
                                label="Year"
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                            >
                                {years.map((y) => (
                                    <MenuItem key={y} value={y}>
                                        {y}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Typography variant="body2" color="text.secondary">
                                {filteredPayrolls.length} of {payrolls.length} records
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            {isHR && (
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                    <TableSortLabel
                                        active={orderBy === 'employeeId'}
                                        direction={orderBy === 'employeeId' ? order : 'asc'}
                                        onClick={() => handleRequestSort('employeeId')}
                                        sx={{
                                            color: 'white !important',
                                            '&.Mui-active': { color: 'white !important' },
                                            '& .MuiTableSortLabel-icon': { color: 'white !important' }
                                        }}
                                    >
                                        Employee ID
                                    </TableSortLabel>
                                </TableCell>
                            )}
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={orderBy === 'employeeName'}
                                    direction={orderBy === 'employeeName' ? order : 'asc'}
                                    onClick={() => handleRequestSort('employeeName')}
                                    sx={{
                                        color: 'white !important',
                                        '&.Mui-active': { color: 'white !important' },
                                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                                    }}
                                >
                                    Employee Name
                                </TableSortLabel>
                            </TableCell>
                            {isHR && (
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                    <TableSortLabel
                                        active={orderBy === 'department'}
                                        direction={orderBy === 'department' ? order : 'asc'}
                                        onClick={() => handleRequestSort('department')}
                                        sx={{
                                            color: 'white !important',
                                            '&.Mui-active': { color: 'white !important' },
                                            '& .MuiTableSortLabel-icon': { color: 'white !important' }
                                        }}
                                    >
                                        Department
                                    </TableSortLabel>
                                </TableCell>
                            )}
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={orderBy === 'month'}
                                    direction={orderBy === 'month' ? order : 'asc'}
                                    onClick={() => handleRequestSort('month')}
                                    sx={{
                                        color: 'white !important',
                                        '&.Mui-active': { color: 'white !important' },
                                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                                    }}
                                >
                                    Month/Year
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={orderBy === 'monthlySalary'}
                                    direction={orderBy === 'monthlySalary' ? order : 'asc'}
                                    onClick={() => handleRequestSort('monthlySalary')}
                                    sx={{
                                        color: 'white !important',
                                        '&.Mui-active': { color: 'white !important' },
                                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                                    }}
                                >
                                    Monthly Salary
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={orderBy === 'netPayableSalary'}
                                    direction={orderBy === 'netPayableSalary' ? order : 'asc'}
                                    onClick={() => handleRequestSort('netPayableSalary')}
                                    sx={{
                                        color: 'white !important',
                                        '&.Mui-active': { color: 'white !important' },
                                        '& .MuiTableSortLabel-icon': { color: 'white !important' }
                                    }}
                                >
                                    Net Payable
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={isHR ? 7 : 5} align="center">
                                    <Typography>Loading...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : paginatedPayrolls.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isHR ? 7 : 5} align="center">
                                    <Typography>
                                        {payrolls.length === 0
                                            ? 'No payroll records found'
                                            : 'No payroll records match your search criteria'
                                        }
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedPayrolls.map((payroll) => (
                                <TableRow key={payroll._id} hover>
                                    {isHR && (
                                        <TableCell>
                                            {payroll.employeeId?.employeeId || 'N/A'}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        {payroll.employeeId?.firstName} {payroll.employeeId?.lastName}
                                    </TableCell>
                                    {isHR && (
                                        <TableCell>
                                            {payroll.employeeId?.department || 'N/A'}
                                        </TableCell>
                                    )}
                                    <TableCell>{formatMonth(payroll.month, payroll.year)}</TableCell>
                                    <TableCell align="right">
                                        ₹{payroll.monthlySalary?.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell align="right">
                                        ₹{payroll.netPayableSalary?.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleViewSlip(payroll)}
                                            title="View Salary Slip"
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            color="secondary"
                                            onClick={(e) => handleDownloadMenuOpen(e, payroll._id)}
                                            title="Download Options"
                                        >
                                            <Download />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredPayrolls.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Salary Slip View Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                    }
                }}
            >
                <DialogTitle sx={{ p: 0, position: 'relative' }}>
                    <IconButton
                        onClick={() => setViewDialogOpen(false)}
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            zIndex: 10,
                            bgcolor: 'rgba(0,0,0,0.3)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                        }}
                        size="small"
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {selectedPayroll && <SalarySlipView payroll={selectedPayroll} />}
                </DialogContent>
            </Dialog>

            {/* Download Format Menu */}
            <Menu
                anchorEl={downloadMenuAnchor}
                open={Boolean(downloadMenuAnchor)}
                onClose={handleDownloadMenuClose}
            >
                <MenuItem onClick={() => handleDownloadPDF(selectedPayrollId, true)}>
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="With Tax Deductions" />
                </MenuItem>
                <MenuItem onClick={() => handleDownloadPDF(selectedPayrollId, false)}>
                    <ListItemIcon>
                        <Download fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Without Tax Deductions" />
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default PayrollList;
