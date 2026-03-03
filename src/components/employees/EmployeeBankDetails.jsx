import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    TextField,
    MenuItem,
    Button,
    Alert,
    Snackbar
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { employeeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EmployeeBankDetails = ({ employee, onUpdate, isOwnProfile = false }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bankDetails: { ...(employee.bankDetails || {}) },
        pfAccountNumber: employee.pfAccountNumber || '',
        uanNumber: employee.uanNumber || '',
        esiNumber: employee.esiNumber || ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    // HR can edit, but employees cannot edit their own profile
    const canEdit = user?.role === 'HR' && !isOwnProfile;

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails,
                [field]: value
            }
        }));
    };

    const handleRootChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        try {
            await employeeAPI.update(employee._id, formData);
            setMessage({ type: 'success', text: 'Bank details updated successfully' });
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update' });
        }
    };

    const handleCancel = () => {
        setFormData({
            bankDetails: { ...(employee.bankDetails || {}) },
            pfAccountNumber: employee.pfAccountNumber || '',
            uanNumber: employee.uanNumber || '',
            esiNumber: employee.esiNumber || ''
        });
        setIsEditing(false);
    };

    const bankDetails = formData.bankDetails || {};

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Bank Details</Typography>
                {canEdit && !isEditing && (
                    <Button variant="contained" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                )}
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This information is used for salary processing and payroll generation.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Account Holder Name"
                        value={bankDetails.accountHolderName || ''}
                        onChange={(e) => handleChange('accountHolderName', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Bank Name"
                        value={bankDetails.bankName || ''}
                        onChange={(e) => handleChange('bankName', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Account Number"
                        value={bankDetails.accountNumber || ''}
                        onChange={(e) => handleChange('accountNumber', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="IFSC Code"
                        value={bankDetails.ifscCode || ''}
                        onChange={(e) => handleChange('ifscCode', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Branch Name"
                        value={bankDetails.branch || ''}
                        onChange={(e) => handleChange('branch', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        select
                        label="Account Type"
                        value={bankDetails.accountType || ''}
                        onChange={(e) => handleChange('accountType', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    >
                        {['Savings', 'Current'].map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="PAN Number"
                        value={bankDetails.panNumber || ''}
                        onChange={(e) => handleChange('panNumber', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="UPI ID (Optional)"
                        value={bankDetails.upiId || ''}
                        onChange={(e) => handleChange('upiId', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                {/* Statutory Details Section */}
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Statutory Details</Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="PF Account Number"
                        value={formData.pfAccountNumber || ''}
                        onChange={(e) => handleRootChange('pfAccountNumber', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="UAN Number"
                        value={formData.uanNumber || ''}
                        onChange={(e) => handleRootChange('uanNumber', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="ESI Number"
                        value={formData.esiNumber || ''}
                        onChange={(e) => handleRootChange('esiNumber', e.target.value)}
                        InputProps={{ readOnly: !isEditing }}
                        variant="outlined"
                    />
                </Grid>

                {/* Action Buttons */}
                {isEditing && (
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
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
                )}
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" color="info.dark">
                    <strong>Note:</strong> Only HR can add or edit bank details. This information is confidential and used solely for salary processing.
                </Typography>
            </Box>

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

export default EmployeeBankDetails;
