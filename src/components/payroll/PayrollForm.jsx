import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Button,
    Alert,
    CircularProgress,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Save, Add } from '@mui/icons-material';
import { payrollAPI, employeeAPI } from '../../services/api';

const PayrollForm = () => {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openNewEmployeeDialog, setOpenNewEmployeeDialog] = useState(false);
    const [newEmployeeData, setNewEmployeeData] = useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        joiningDate: '',
        employmentStatus: 'Active'
    });
    const [formData, setFormData] = useState({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        monthlySalary: '',
        incentives: 0,
        advance: 0,
        advanceDeduction: 0,
        lateArrivalMinutes: 0,
        earlyLeavingMinutes: 0,
        timeDeductions: 0,
        otherDeductions: 0,
        incomeTax: 0,
        basicSalary: 0,
        hra: 0,
        telephoneAllowance: 2000,
        conveyanceAllowance: 1600,
        medicalAllowance: 1250,
        specialAllowance: 0,
        providentFund: 1800,
        professionalTax: 200
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            const response = await employeeAPI.getAll();
            setEmployees(response.data);
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to load employees'
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSalaryChange = (e) => {
        const { name, value } = e.target;
        const numValue = parseFloat(value) || 0;

        if (name === 'monthlySalary') {
            const basic = Math.round(numValue * 0.50);
            const hra = Math.round(basic * 0.40);
            const telephone = 2000;
            const conveyance = 1600;
            const medical = 1250;
            const fixedComponents = basic + hra + telephone + conveyance + medical;
            const special = Math.round(Math.max(0, numValue - fixedComponents));

            setFormData(prev => ({
                ...prev,
                monthlySalary: value,
                basicSalary: basic,
                hra: hra,
                telephoneAllowance: telephone,
                conveyanceAllowance: conveyance,
                medicalAllowance: medical,
                specialAllowance: special
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEmployeeChange = (event, newValue) => {
        if (newValue) {
            setFormData(prev => ({ ...prev, employeeId: newValue._id }));
        } else {
            setFormData(prev => ({ ...prev, employeeId: '' }));
        }
    };

    const handleNewEmployeeChange = (e) => {
        const { name, value } = e.target;
        setNewEmployeeData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateNewEmployee = async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.create(newEmployeeData);

            setMessage({
                type: 'success',
                text: `Employee ${newEmployeeData.firstName} ${newEmployeeData.lastName} created successfully!`
            });

            // Reload employees list
            await loadEmployees();

            // Auto-select the newly created employee
            setFormData(prev => ({ ...prev, employeeId: response.data._id }));

            // Close dialog and reset
            setOpenNewEmployeeDialog(false);
            setNewEmployeeData({
                employeeId: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                department: '',
                designation: '',
                joiningDate: '',
                employmentStatus: 'Active'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to create employee'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.employeeId) {
            setMessage({ type: 'error', text: 'Please select an employee' });
            return;
        }

        if (!formData.monthlySalary || formData.monthlySalary <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid monthly salary' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            await payrollAPI.create(formData);

            setMessage({
                type: 'success',
                text: 'Payroll generated successfully! The system has automatically calculated LOP based on attendance.'
            });

            // Reset form
            setFormData({
                employeeId: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                monthlySalary: '',
                incentives: 0,
                advance: 0,
                advanceDeduction: 0,
                lateArrivalMinutes: 0,
                earlyLeavingMinutes: 0,
                timeDeductions: 0,
                otherDeductions: 0,
                incomeTax: 0,
                basicSalary: 0,
                hra: 0,
                telephoneAllowance: 2000,
                conveyanceAllowance: 1600,
                medicalAllowance: 1250,
                specialAllowance: 0,
                providentFund: 1800,
                professionalTax: 200
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to generate payroll'
            });
        } finally {
            setLoading(false);
        }
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

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Generate Payroll
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select an employee and enter salary details. The system will automatically calculate LOP based on attendance records.
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

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Employee Selection with Add New Button */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                                <Autocomplete
                                    options={employees}
                                    getOptionLabel={(option) =>
                                        `${option.employeeId || 'N/A'} - ${option.firstName} ${option.lastName} (${option.designation})`
                                    }
                                    onChange={handleEmployeeChange}
                                    value={employees.find(emp => emp._id === formData.employeeId) || null}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Employee"
                                            required
                                            placeholder="Search by employee ID, name, or designation"
                                        />
                                    )}
                                />
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => setOpenNewEmployeeDialog(true)}
                                sx={{ minWidth: '180px', height: '56px' }}
                            >
                                Add New Employee
                            </Button>
                        </Box>
                    </Grid>

                    {/* Month & Year */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            select
                            label="Month"
                            name="month"
                            value={formData.month}
                            onChange={handleChange}
                        >
                            {months.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                    {m.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            select
                            label="Year"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                        >
                            {years.map((y) => (
                                <MenuItem key={y} value={y}>
                                    {y}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Total Salary (Gross) */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>Earnings (INR)</Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            required
                            type="number"
                            label="Total Monthly Salary (Gross) ₹"
                            name="monthlySalary"
                            value={formData.monthlySalary}
                            onChange={handleSalaryChange}
                            inputProps={{ min: 0, step: 0.01 }}
                            helperText="Typing this will auto-fill the components below"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField fullWidth type="number" label="Basic (50%) ₹" name="basicSalary" value={formData.basicSalary} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="HRA (40% of Basic) ₹" name="hra" value={formData.hra} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="Telephone Allowance ₹" name="telephoneAllowance" value={formData.telephoneAllowance} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="Conveyance ₹" name="conveyanceAllowance" value={formData.conveyanceAllowance} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="Medical ₹" name="medicalAllowance" value={formData.medicalAllowance} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="Special Allowance ₹" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="Incentives ₹" name="incentives" value={formData.incentives} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>Deductions (INR)</Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="PF (Provident Fund) ₹" name="providentFund" value={formData.providentFund} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="PT (Professional Tax) ₹" name="professionalTax" value={formData.professionalTax} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth type="number" label="IT / Custom Income Tax ₹" name="incomeTax" value={formData.incomeTax} onChange={handleChange} inputProps={{ min: 0, step: 0.01 }} helperText="Overrides Auto Calc" />
                    </Grid>

                    {/* Advance */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="New Advance Taken (₹)"
                            name="advance"
                            value={formData.advance}
                            onChange={handleChange}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Advance Deduction this month (₹)"
                            name="advanceDeduction"
                            value={formData.advanceDeduction}
                            onChange={handleChange}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>

                    {/* Time-based Deductions */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>Time-based & Other Deductions</Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Late Arrival (minutes)"
                            name="lateArrivalMinutes"
                            value={formData.lateArrivalMinutes}
                            onChange={handleChange}
                            inputProps={{ min: 0 }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Early Leaving (minutes)"
                            name="earlyLeavingMinutes"
                            value={formData.earlyLeavingMinutes}
                            onChange={handleChange}
                            inputProps={{ min: 0 }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Time Deductions / LOP Amount (₹)"
                            name="timeDeductions"
                            value={formData.timeDeductions}
                            onChange={handleChange}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>

                    {/* Other Deductions & Tax */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Other Miscellaneous Deductions (₹)"
                            name="otherDeductions"
                            value={formData.otherDeductions}
                            onChange={handleChange}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? 'Generating Payroll...' : 'Generate Payroll'}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    <strong>Note:</strong> The system will automatically:
                </Typography>
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    <li>
                        <Typography variant="body2" color="text.secondary">
                            Fetch attendance records for the selected month to calculate absent days
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" color="text.secondary">
                            Calculate LOP amount based on: (Monthly Salary ÷ Total Days) × Absent Days
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" color="text.secondary">
                            Calculate Net Payable Salary = Actual Salary (after LOP) + Incentives - Total Deductions
                        </Typography>
                    </li>
                </ul>
            </Box>

            {/* New Employee Dialog */}
            <Dialog open={openNewEmployeeDialog} onClose={() => setOpenNewEmployeeDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
                        <TextField
                            label="Employee ID"
                            name="employeeId"
                            value={newEmployeeData.employeeId}
                            onChange={handleNewEmployeeChange}
                            required
                            helperText="Enter a unique employee ID (e.g., EMP001, 129, etc.)"
                        />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="First Name"
                                name="firstName"
                                value={newEmployeeData.firstName}
                                onChange={handleNewEmployeeChange}
                                required
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                value={newEmployeeData.lastName}
                                onChange={handleNewEmployeeChange}
                                required
                            />
                        </Box>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={newEmployeeData.email}
                            onChange={handleNewEmployeeChange}
                            required
                        />
                        <TextField
                            label="Phone"
                            name="phone"
                            value={newEmployeeData.phone}
                            onChange={handleNewEmployeeChange}
                            required
                        />
                        <TextField
                            select
                            label="Department"
                            name="department"
                            value={newEmployeeData.department}
                            onChange={handleNewEmployeeChange}
                            required
                        >
                            {['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Support', 'Management'].map((dept) => (
                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Designation"
                            name="designation"
                            value={newEmployeeData.designation}
                            onChange={handleNewEmployeeChange}
                            required
                        />
                        <TextField
                            label="Joining Date"
                            name="joiningDate"
                            type="date"
                            value={newEmployeeData.joiningDate}
                            onChange={handleNewEmployeeChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            select
                            label="Employment Status"
                            name="employmentStatus"
                            value={newEmployeeData.employmentStatus}
                            onChange={handleNewEmployeeChange}
                        >
                            {['Active', 'Probation', 'Resigned', 'Terminated'].map((status) => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNewEmployeeDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateNewEmployee}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Employee'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default PayrollForm;
