import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, MenuItem, Grid, Avatar, FormControl, InputLabel, Select,
    InputAdornment, Tooltip, Alert, CircularProgress
} from '@mui/material';
import {
    Add, Edit, Delete, Search, PersonAdd, UploadFile, CheckCircle, Cancel, ThumbUp, ThumbDown
} from '@mui/icons-material';
import { adminStudentAPI } from '../../services/studentPortalAPI';

const GENDER = ['Male', 'Female', 'Other'];
const STATUS = ['Active', 'Inactive'];

const emptyForm = {
    name: '', email: '', phone: '', dateOfBirth: '', gender: '', address: '',
    guardianName: '', guardianPhone: '', course: '', enrollmentDate: '', status: 'Active', notes: ''
};

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await adminStudentAPI.getAllStudents();
            let data = res.data.data || [];
            
            // Client-side filtering if API doesn't support them out of the box
            if (search) {
                const s = search.toLowerCase();
                data = data.filter(st => st.name?.toLowerCase().includes(s) || st.email?.toLowerCase().includes(s));
            }
            if (filterStatus) {
                data = data.filter(st => {
                    const isApproved = st.isApproved;
                    if (filterStatus === 'Active' && !isApproved) return false;
                    if (filterStatus === 'Inactive' && isApproved) return false;
                    return true;
                });
            }
            // Cannot reliably filter by course if the new API doesn't return full course details
            
            setStudents(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, [search, filterStatus]);

    const handleApprove = async (id) => {
        try {
            setSaving(true);
            await adminStudentAPI.approveStudent(id);
            setSuccess('Student approved successfully');
            fetchStudents();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve student');
        } finally {
            setSaving(false);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this student?')) return;
        try {
            setSaving(true);
            await adminStudentAPI.rejectStudent(id);
            setSuccess('Student rejected');
            fetchStudents();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject student');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700} color="primary.dark">👨‍🎓 Student Management</Typography>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

            {/* Filters */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={5}>
                    <TextField fullWidth size="small" placeholder="Search by name, ID, email..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={4}>
                </Grid>
            </Grid>

            {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Student</TableCell>
                                <TableCell>ID</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Enrolled</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.length === 0 ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No students found</TableCell></TableRow>
                            ) : students.map(s => (
                                <TableRow key={s._id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981', fontSize: '0.8rem' }}>{s.name?.[0]}</Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>{s.name || s.username}</Typography>
                                                <Typography variant="caption" color="text.secondary">{s.gender || '—'}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={s.studentId || s._id.slice(-6).toUpperCase()} size="small" variant="outlined" color="primary" /></TableCell>
                                    <TableCell>{s.course?.courseName || <Typography variant="caption" color="text.secondary">Unassigned</Typography>}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{s.email || '—'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{s.phone || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</TableCell>
                                    <TableCell>
                                        {s.isApproved ? (
                                            <Chip label="Approved" size="small" color="success" />
                                        ) : (
                                            <Chip label="Pending" size="small" color="warning" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        {!s.isApproved && (
                                            <>
                                                <Tooltip title="Approve">
                                                    <IconButton size="small" color="success" onClick={() => handleApprove(s._id)} disabled={saving}>
                                                        <ThumbUp fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Reject">
                                                    <IconButton size="small" color="error" onClick={() => handleReject(s._id)} disabled={saving}>
                                                        <ThumbDown fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        {s.isApproved && (
                                            <Chip label="Verified" size="small" color="info" variant="outlined" icon={<CheckCircle fontSize="small" />} />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
