import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Button,
    Divider,
    Alert,
    Snackbar
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { employeeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EmployeeAbout = ({ employee, onUpdate, isOwnProfile = false }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...employee });
    const [message, setMessage] = useState({ type: '', text: '' });

    // HR can edit, but employees cannot edit their own profile
    const canEdit = user?.role === 'HR' && !isOwnProfile;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
    };

    const handleSave = async () => {
        try {
            await employeeAPI.update(employee._id, formData);
            setMessage({ type: 'success', text: 'Employee information updated successfully' });
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update' });
        }
    };

    const handleCancel = () => {
        setFormData({ ...employee });
        setIsEditing(false);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Employee Information</Typography>
                {canEdit && !isEditing && (
                    <Button variant="contained" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Personal Information
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        select
                        label="Prefix"
                        value={formData.prefix || ''}
                        onChange={(e) => handleChange('prefix', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    >
                        {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'].map(prefix => (
                            <MenuItem key={prefix} value={prefix}>{prefix}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName || ''}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Middle Name"
                        value={formData.middleName || ''}
                        onChange={(e) => handleChange('middleName', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName || ''}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth?.split('T')[0] || ''}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        select
                        label="Gender"
                        value={formData.gender || ''}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    >
                        {['Male', 'Female', 'Other'].map(gender => (
                            <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        select
                        label="Blood Group"
                        value={formData.bloodGroup || ''}
                        onChange={(e) => handleChange('bloodGroup', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'NA'].map(bg => (
                            <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Nationality"
                        value={formData.nationality || ''}
                        onChange={(e) => handleChange('nationality', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Contact Information */}
                <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Contact Information
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Work Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="ISD Code"
                        value={formData.isdCode || ''}
                        onChange={(e) => handleChange('isdCode', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Mobile Number"
                        value={formData.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Street Address"
                        value={formData.address?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="City"
                        value={formData.address?.city || ''}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="State"
                        value={formData.address?.state || ''}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Zip Code"
                        value={formData.address?.zipCode || ''}
                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Country"
                        value={formData.address?.country || ''}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Employment Details */}
                <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Employment Details
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Employee Code"
                        value={formData.employeeId || ''}
                        onChange={(e) => handleChange('employeeId', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        helperText={isEditing ? "Unique Employee ID (e.g., B8LB1001)" : "Official employee identifier"}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Date of Joining"
                        type="date"
                        value={formData.joiningDate?.split('T')[0] || ''}
                        onChange={(e) => handleChange('joiningDate', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        select
                        label="Employment Type"
                        value={formData.employmentType || ''}
                        onChange={(e) => handleChange('employmentType', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    >
                        {['Permanent', 'Contract', 'Intern', 'Temporary'].map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        select
                        label="Employment Status"
                        value={formData.employmentStatus || ''}
                        onChange={(e) => isEditing && handleChange('employmentStatus', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        sx={!isEditing ? {
                            pointerEvents: 'none',
                            '& .MuiSelect-icon': { display: 'none' }
                        } : {}}
                    >
                        {['Active', 'Probation', 'Confirmed', 'Resigned', 'Terminated'].map(status => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Employee Category */}
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        select
                        label="Employee Type"
                        value={formData.employeeCategory || 'Full-Time'}
                        onChange={(e) => isEditing && handleChange('employeeCategory', e.target.value)}
                        sx={!isEditing ? {
                            pointerEvents: 'none',
                            '& .MuiSelect-icon': { display: 'none' }
                        } : {}}
                    >
                        {['Full-Time', 'Part-Time', 'Internship'].map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Part-Time: Weekly Hours */}
                {(formData.employeeCategory === 'Part-Time') && (
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Weekly Hours"
                            type="number"
                            value={formData.weeklyHours || ''}
                            onChange={(e) => handleChange('weeklyHours', e.target.value)}
                            InputProps={{
                                readOnly: !isEditing,
                                endAdornment: <span style={{ color: '#888', marginRight: 4 }}>hrs/wk</span>
                            }}
                            inputProps={{ min: 1, max: 40 }}
                            helperText="Hours per week (1–40)"
                        />
                    </Grid>
                )}

                {/* Internship: End Date + Stipend */}
                {(formData.employeeCategory === 'Internship') && (
                    <>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Internship End Date"
                                type="date"
                                value={formData.internshipEndDate?.split('T')[0] || ''}
                                onChange={(e) => handleChange('internshipEndDate', e.target.value)}
                                InputProps={{ readOnly: !isEditing }}
                                InputLabelProps={{ shrink: true }}
                                helperText="Expected last working day"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Monthly Stipend (₹)"
                                type="number"
                                value={formData.stipend || ''}
                                onChange={(e) => handleChange('stipend', e.target.value)}
                                InputProps={{ readOnly: !isEditing }}
                                inputProps={{ min: 0 }}
                                helperText="Monthly stipend amount"
                            />
                        </Grid>
                    </>
                )}

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Date of Confirmation"
                        type="date"
                        value={formData.dateOfConfirmation?.split('T')[0] || ''}
                        onChange={(e) => handleChange('dateOfConfirmation', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Probation End Date"
                        type="date"
                        value={formData.probationEndDate?.split('T')[0] || ''}
                        onChange={(e) => handleChange('probationEndDate', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Date of Leaving"
                        type="date"
                        value={formData.dateOfLeaving?.split('T')[0] || ''}
                        onChange={(e) => handleChange('dateOfLeaving', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Date of Resignation"
                        type="date"
                        value={formData.dateOfResignation?.split('T')[0] || ''}
                        onChange={(e) => handleChange('dateOfResignation', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Date of Settlement"
                        type="date"
                        value={formData.dateOfSettlement?.split('T')[0] || ''}
                        onChange={(e) => handleChange('dateOfSettlement', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Company Details */}
                <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Company Details
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Company"
                        value={formData.company || ''}
                        onChange={(e) => handleChange('company', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Business Unit"
                        value={formData.businessUnit || ''}
                        onChange={(e) => handleChange('businessUnit', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        select
                        label="Department"
                        value={formData.department || ''}
                        onChange={(e) => handleChange('department', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        required
                    >
                        {['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Support', 'Management', 'Artificial Intelligence'].map(dept => (
                            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Sub Department"
                        value={formData.subDepartment || ''}
                        onChange={(e) => handleChange('subDepartment', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Designation"
                        value={formData.designation || ''}
                        onChange={(e) => handleChange('designation', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        required
                    />
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Location */}
                <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Location
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Region"
                        value={formData.region || ''}
                        onChange={(e) => handleChange('region', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Branch"
                        value={formData.branch || ''}
                        onChange={(e) => handleChange('branch', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Sub Branch"
                        value={formData.subBranch || ''}
                        onChange={(e) => handleChange('subBranch', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Reporting Structure */}
                <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Reporting Structure
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Reporting Manager"
                        value={formData.reportingManager || ''}
                        onChange={(e) => handleChange('reportingManager', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Functional Manager"
                        value={formData.functionalManager || ''}
                        onChange={(e) => handleChange('functionalManager', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Other Details */}
                <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Other Details
                    </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        select
                        label="Skill Type"
                        value={formData.skillType || ''}
                        onChange={(e) => handleChange('skillType', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    >
                        {['Skilled', 'Semi-Skilled', 'Unskilled'].map(skill => (
                            <MenuItem key={skill} value={skill}>{skill}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Biometric ID"
                        value={formData.biometricId || ''}
                        onChange={(e) => handleChange('biometricId', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Employee Other Status ID"
                        value={formData.employeeOtherStatusId || ''}
                        onChange={(e) => handleChange('employeeOtherStatusId', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Other Status Date"
                        type="date"
                        value={formData.otherStatusDate?.split('T')[0] || ''}
                        onChange={(e) => handleChange('otherStatusDate', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Other Status Remarks"
                        value={formData.otherStatusRemarks || ''}
                        onChange={(e) => handleChange('otherStatusRemarks', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                    />
                </Grid>

                {/* Action Buttons */}
                {isEditing && (
                    <>
                        <Grid item xs={12}><Divider /></Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        </Grid>
                    </>
                )}
            </Grid>

            <Snackbar
                open={!!message.text}
                autoHideDuration={6000}
                onClose={() => setMessage({ type: '', text: '' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default EmployeeAbout;
