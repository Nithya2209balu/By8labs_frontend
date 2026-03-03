import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../services/api';
import {
    Container,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Box,
    Chip,
    Alert,
    Tooltip,
    TablePagination,
    InputAdornment,
    TableSortLabel,
    FormControl,
    InputLabel,
    Select,
    Grid,
    Card,
    CardContent,
    Divider,
    Stack
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Visibility,
    Search,
    FilterList,
    WorkOutline,
    AccessTime,
    School,
    People,
    Business
} from '@mui/icons-material';

// Employee category config
const CATEGORY_CONFIG = {
    'Full-Time': {
        label: 'Full-Time',
        color: 'success',
        icon: <WorkOutline fontSize="small" />,
        bgColor: '#f0fdf4',
        textColor: '#16a34a',
        borderColor: '#22c55e',
    },
    'Part-Time': {
        label: 'Part-Time',
        color: 'primary',
        icon: <AccessTime fontSize="small" />,
        bgColor: '#eff6ff',
        textColor: '#2563eb',
        borderColor: '#3b82f6',
    },
    'Internship': {
        label: 'Internship',
        color: 'warning',
        icon: <School fontSize="small" />,
        bgColor: '#fff7ed',
        textColor: '#d97706',
        borderColor: '#f59e0b',
    },
};

const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Support', 'Management', 'Artificial Intelligence'];

const defaultFormData = {
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    joiningDate: '',
    employmentStatus: 'Probation',
    employeeCategory: 'Full-Time',
    weeklyHours: '',
    internshipEndDate: '',
    stipend: '',
};

const EmployeeManagement = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState(null);
    const [formData, setFormData] = useState(defaultFormData);

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Sorting
    const [orderBy, setOrderBy] = useState('employeeId');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await employeeAPI.getAll();
            console.log('📋 Employees from API (first):', response.data?.[0]?.employeeCategory, response.data?.[0]);
            setEmployees(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (employee = null) => {
        if (employee) {
            setCurrentEmployee(employee);
            setFormData({
                employeeId: employee.employeeId || '',
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phone: employee.phone,
                department: employee.department,
                designation: employee.designation,
                joiningDate: employee.joiningDate?.split('T')[0] || '',
                employmentStatus: employee.employmentStatus,
                employeeCategory: employee.employeeCategory || 'Full-Time',
                weeklyHours: employee.weeklyHours || '',
                internshipEndDate: employee.internshipEndDate?.split('T')[0] || '',
                stipend: employee.stipend || '',
            });
        } else {
            setCurrentEmployee(null);
            setFormData(defaultFormData);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentEmployee(null);
    };

    const handleSubmit = async () => {
        try {
            // Build payload — always include employeeCategory
            const payload = {
                employeeId: formData.employeeId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                department: formData.department,
                designation: formData.designation,
                joiningDate: formData.joiningDate,
                employmentStatus: formData.employmentStatus,
                employeeCategory: formData.employeeCategory || 'Full-Time',
            };

            // Add type-specific fields
            if (formData.employeeCategory === 'Part-Time') {
                payload.weeklyHours = formData.weeklyHours;
            }
            if (formData.employeeCategory === 'Internship') {
                payload.internshipEndDate = formData.internshipEndDate;
                payload.stipend = formData.stipend;
            }

            console.log('📤 Submitting employee payload:', payload);

            if (currentEmployee) {
                const res = await employeeAPI.update(currentEmployee._id, payload);
                const updatedEmployee = res.data;
                console.log('✅ Server returned:', updatedEmployee?.employeeCategory, updatedEmployee);
                // Directly patch the local state so UI updates immediately with server data
                setEmployees(prev =>
                    prev.map(emp =>
                        emp._id === currentEmployee._id ? updatedEmployee : emp
                    )
                );
            } else {
                await employeeAPI.create(payload);
                await fetchEmployees();
            }
            handleCloseDialog();
        } catch (err) {
            console.error('❌ Employee submit error:', err.response?.data || err.message);
            setError(err.response?.data?.message || err.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await employeeAPI.delete(id);
                fetchEmployees();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete employee');
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Active': 'success',
            'Probation': 'warning',
            'Confirmed': 'success',
            'Resigned': 'error',
            'Terminated': 'error'
        };
        return colors[status] || 'default';
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    // Stats per category
    const categoryCounts = {
        'Full-Time': employees.filter(e => (e.employeeCategory || 'Full-Time') === 'Full-Time').length,
        'Part-Time': employees.filter(e => e.employeeCategory === 'Part-Time').length,
        'Internship': employees.filter(e => e.employeeCategory === 'Internship').length,
    };

    // Filter logic
    const filteredEmployees = employees.filter((emp) => {
        const searchMatch = searchTerm === '' ||
            emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());

        const deptMatch = departmentFilter === 'All' || emp.department === departmentFilter;
        const statusMatch = statusFilter === 'All' || emp.employmentStatus === statusFilter;
        const catMatch = categoryFilter === 'All' || (emp.employeeCategory || 'Full-Time') === categoryFilter;

        return searchMatch && deptMatch && statusMatch && catMatch;
    });

    // Sort
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        let aVal = orderBy === 'name' ? `${a.firstName} ${a.lastName}` : a[orderBy];
        let bVal = orderBy === 'name' ? `${b.firstName} ${b.lastName}` : b[orderBy];
        if (typeof aVal === 'string') {
            return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return order === 'asc' ? (aVal < bVal ? -1 : 1) : (aVal > bVal ? -1 : 1);
    });

    const paginatedEmployees = sortedEmployees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const SortHeader = ({ field, label }) => (
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
            <TableSortLabel
                active={orderBy === field}
                direction={orderBy === field ? order : 'asc'}
                onClick={() => handleRequestSort(field)}
                sx={{
                    color: 'white !important',
                    '&.Mui-active': { color: 'white !important' },
                    '& .MuiTableSortLabel-icon': { color: 'white !important' }
                }}
            >
                {label}
            </TableSortLabel>
        </TableCell>
    );

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 1 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', md: '1.75rem' } }}>Employee Management</Typography>
                    <Typography variant="body2" color="text.secondary">{employees.length} total employees</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    size="medium"
                >
                    Add Employee
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                    <Card sx={{
                        borderTop: '4px solid #22c55e',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: categoryFilter === 'Full-Time' ? '#f0fdf4' : 'white',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                    }} onClick={() => setCategoryFilter(categoryFilter === 'Full-Time' ? 'All' : 'Full-Time')}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Full-Time</Typography>
                                    <Typography variant="h3" fontWeight={700} color="#16a34a">{categoryCounts['Full-Time']}</Typography>
                                    <Typography variant="caption" color="text.secondary">Permanent employees</Typography>
                                </Box>
                                <Box sx={{ bgcolor: '#dcfce7', borderRadius: 3, p: 1.5 }}>
                                    <WorkOutline sx={{ fontSize: 32, color: '#16a34a' }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={4}>
                    <Card sx={{
                        borderTop: '4px solid #3b82f6',

                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: categoryFilter === 'Part-Time' ? '#eff6ff' : 'white',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                    }} onClick={() => setCategoryFilter(categoryFilter === 'Part-Time' ? 'All' : 'Part-Time')}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Part-Time</Typography>
                                    <Typography variant="h3" fontWeight={700} color="#2563eb">{categoryCounts['Part-Time']}</Typography>
                                    <Typography variant="caption" color="text.secondary">Flexible hours</Typography>
                                </Box>
                                <Box sx={{ bgcolor: '#dbeafe', borderRadius: 3, p: 1.5 }}>
                                    <AccessTime sx={{ fontSize: 32, color: '#2563eb' }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        borderTop: '4px solid #f59e0b',

                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: categoryFilter === 'Internship' ? '#fff7ed' : 'white',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
                    }} onClick={() => setCategoryFilter(categoryFilter === 'Internship' ? 'All' : 'Internship')}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Internship</Typography>
                                    <Typography variant="h3" fontWeight={700} color="#d97706">{categoryCounts['Internship']}</Typography>
                                    <Typography variant="caption" color="text.secondary">Trainees & interns</Typography>
                                </Box>
                                <Box sx={{ bgcolor: '#fef3c7', borderRadius: 3, p: 1.5 }}>
                                    <School sx={{ fontSize: 32, color: '#d97706' }} />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search and Filter */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by ID, Name, Email, Department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start"><Search /></InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select value={categoryFilter} label="Type" onChange={(e) => setCategoryFilter(e.target.value)}>
                                <MenuItem value="All">All Types</MenuItem>
                                <MenuItem value="Full-Time">Full-Time</MenuItem>
                                <MenuItem value="Part-Time">Part-Time</MenuItem>
                                <MenuItem value="Internship">Internship</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Department</InputLabel>
                            <Select value={departmentFilter} label="Department" onChange={(e) => setDepartmentFilter(e.target.value)}>
                                <MenuItem value="All">All Departments</MenuItem>
                                {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                                <MenuItem value="All">All Status</MenuItem>
                                {['Active', 'Probation', 'Confirmed', 'Resigned', 'Terminated'].map(s => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={12} md={2}>
                        <Typography variant="body2" color="text.secondary">
                            {filteredEmployees.length} of {employees.length} employees
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Employee Table */}
            <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            <SortHeader field="employeeId" label="ID" />
                            <SortHeader field="name" label="Name" />
                            <SortHeader field="email" label="Email" />
                            <SortHeader field="department" label="Department" />
                            <SortHeader field="designation" label="Designation" />
                            <SortHeader field="employeeCategory" label="Type" />
                            <SortHeader field="employmentStatus" label="Status" />
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <People sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="body1" color="text.secondary">
                                            {employees.length === 0
                                                ? 'No employees found. Add an employee to get started.'
                                                : 'No employees match your search criteria.'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedEmployees.map((emp) => {
                                const cat = emp.employeeCategory || 'Full-Time';
                                const catConfig = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['Full-Time'];
                                return (
                                    <TableRow key={emp._id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{emp.employeeId}</TableCell>
                                        <TableCell>{`${emp.firstName} ${emp.lastName}`}</TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                        <TableCell>{emp.department}</TableCell>
                                        <TableCell>{emp.designation}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={catConfig.icon}
                                                label={catConfig.label}
                                                size="small"
                                                sx={{
                                                    bgcolor: catConfig.bgColor,
                                                    color: catConfig.textColor,
                                                    fontWeight: 700,
                                                    border: `1px solid ${catConfig.borderColor}`,
                                                    '& .MuiChip-icon': { color: catConfig.textColor }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={emp.employmentStatus}
                                                color={getStatusColor(emp.employmentStatus)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="View Details">
                                                <IconButton size="small" color="info" onClick={() => navigate(`/employees/${emp._id}/details`)}>
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton size="small" color="primary" onClick={() => handleOpenDialog(emp)}>
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(emp._id)}>
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredEmployees.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Add / Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.2rem'
                }}>
                    {currentEmployee ? '✏️ Edit Employee' : '➕ Add New Employee'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        {/* Employee ID */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Employee ID"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                required
                                helperText="Enter unique Employee ID (e.g., B8LB1001)"
                            />
                        </Grid>

                        {/* Name */}
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                            />
                        </Grid>

                        {/* Contact */}
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </Grid>

                        {/* Department & Designation */}
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                select
                                label="Department"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                            >
                                {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Designation"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                required
                            />
                        </Grid>

                        {/* Joining Date & Status */}
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Joining Date"
                                type="date"
                                value={formData.joiningDate}
                                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                select
                                label="Employment Status"
                                value={formData.employmentStatus}
                                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                            >
                                {['Active', 'Probation', 'Confirmed', 'Resigned', 'Terminated'].map(s => (
                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Employee Category - highlighted section */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>
                                <Chip label="Employee Classification" size="small" />
                            </Divider>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Employee Type</InputLabel>
                                <Select
                                    value={formData.employeeCategory || 'Full-Time'}
                                    label="Employee Type"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, employeeCategory: val }));
                                    }}
                                    MenuProps={{
                                        disablePortal: false,
                                        sx: { zIndex: 1500 }
                                    }}
                                >
                                    <MenuItem value="Full-Time">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <WorkOutline sx={{ color: '#16a34a' }} />
                                            <Box>
                                                <Typography fontWeight={600}>Full-Time</Typography>
                                                <Typography variant="caption" color="text.secondary">Permanent, full working hours</Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="Part-Time">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTime sx={{ color: '#2563eb' }} />
                                            <Box>
                                                <Typography fontWeight={600}>Part-Time</Typography>
                                                <Typography variant="caption" color="text.secondary">Flexible or reduced hours</Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="Internship">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <School sx={{ color: '#d97706' }} />
                                            <Box>
                                                <Typography fontWeight={600}>Internship</Typography>
                                                <Typography variant="caption" color="text.secondary">Trainee or intern position</Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Part-Time specific */}
                        {formData.employeeCategory === 'Part-Time' && (
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#eff6ff', borderColor: '#3b82f6', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mb: 1.5 }}>
                                        ⏱️ Part-Time Details
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Weekly Hours"
                                        type="number"
                                        value={formData.weeklyHours}
                                        onChange={(e) => setFormData({ ...formData, weeklyHours: e.target.value })}
                                        inputProps={{ min: 1, max: 40 }}
                                        helperText="Number of hours per week (1–40)"
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">hrs/week</InputAdornment>
                                        }}
                                    />
                                </Paper>
                            </Grid>
                        )}

                        {/* Internship specific */}
                        {formData.employeeCategory === 'Internship' && (
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff7ed', borderColor: '#f59e0b', borderRadius: 2 }}>
                                    <Typography variant="subtitle2" color="warning.dark" fontWeight={700} sx={{ mb: 1.5 }}>
                                        🎓 Internship Details
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Internship End Date"
                                                type="date"
                                                value={formData.internshipEndDate}
                                                onChange={(e) => setFormData({ ...formData, internshipEndDate: e.target.value })}
                                                InputLabelProps={{ shrink: true }}
                                                helperText="Expected last working day"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Monthly Stipend"
                                                type="number"
                                                value={formData.stipend}
                                                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                                                inputProps={{ min: 0 }}
                                                helperText="Monthly stipend amount (₹)"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" size="large">
                        {currentEmployee ? 'Update Employee' : 'Add Employee'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EmployeeManagement;
