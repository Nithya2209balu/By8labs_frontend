import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Alert
} from '@mui/material';
import { leaveAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LeaveRequest = ({ open, onClose, onSuccess, editLeave = null }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Extract employeeId as string
    const getEmployeeId = () => {
        if (!user?.employeeId) return '';
        return typeof user.employeeId === 'object'
            ? user.employeeId._id || user.employeeId.id
            : user.employeeId;
    };

    const [formData, setFormData] = useState({
        employeeId: getEmployeeId(),
        subject: '',
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        numberOfDays: 0,
        reason: ''
    });

    useEffect(() => {
        if (editLeave) {
            setFormData({
                employeeId: editLeave.employeeId._id || editLeave.employeeId,
                subject: editLeave.subject || '',
                leaveType: editLeave.leaveType,
                startDate: new Date(editLeave.startDate).toISOString().split('T')[0],
                endDate: new Date(editLeave.endDate).toISOString().split('T')[0],
                numberOfDays: editLeave.numberOfDays,
                reason: editLeave.reason
            });
        } else {
            setFormData({
                employeeId: getEmployeeId(),
                subject: '',
                leaveType: 'Casual Leave',
                startDate: '',
                endDate: '',
                numberOfDays: 0,
                reason: ''
            });
        }
    }, [editLeave, user, open]);

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setFormData(prev => ({ ...prev, numberOfDays: diffDays }));
        }
    }, [formData.startDate, formData.endDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate that user has an employeeId
            if (!user?.employeeId) {
                setError('Your account is not linked to an employee record. Please contact HR to link your account.');
                setLoading(false);
                return;
            }

            // Prepare data with proper employeeId
            const submitData = {
                ...formData,
                employeeId: typeof user.employeeId === 'object' ? user.employeeId._id : user.employeeId
            };

            if (editLeave) {
                await leaveAPI.update(editLeave._id, submitData);
            } else {
                await leaveAPI.create(submitData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {editLeave ? 'Edit Leave Request' : 'Apply for Leave'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="e.g., Family Emergency, Medical Leave"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                select
                                label="Leave Type"
                                name="leaveType"
                                value={formData.leaveType}
                                onChange={handleChange}
                            >
                                <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                                <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                                <MenuItem value="Earned Leave">Earned Leave</MenuItem>
                                <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
                                <MenuItem value="Paternity Leave">Paternity Leave</MenuItem>
                                <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                disabled
                                label="Number of Days"
                                value={formData.numberOfDays}
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Start Date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    min: new Date().toISOString().split('T')[0]
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="End Date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    min: formData.startDate || new Date().toISOString().split('T')[0]
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                multiline
                                rows={4}
                                label="Reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Please provide detailed reason for leave"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : editLeave ? 'Update' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default LeaveRequest;
