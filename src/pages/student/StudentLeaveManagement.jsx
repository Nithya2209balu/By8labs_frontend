import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, MenuItem, Grid, FormControl, InputLabel, Select,
    Tooltip, Alert, CircularProgress, Tabs, Tab
} from '@mui/material';
import { Add, Edit, Delete, Check, Close } from '@mui/icons-material';

const API = 'https://by8labs-backend.onrender.com/api';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const STATUS_COLOR = { Pending: 'warning', Approved: 'success', Rejected: 'error' };
const LEAVE_TYPES = ['Sick Leave', 'Personal Leave', 'Family Emergency', 'Other'];

const emptyForm = { student: '', leaveType: 'Sick Leave', startDate: '', endDate: '', reason: '', notes: '' };

export default function StudentLeaveManagement() {
    const [leaves, setLeaves] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [filterStatus, setFilterStatus] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(null);
    const [statusDialog, setStatusDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [statusAction, setStatusAction] = useState({ status: '', notes: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API}/students?limit=200`, { headers: headers() }).then(r => setStudents(r.data.students || []));
    }, []);

    useEffect(() => { fetchLeaves(); }, [filterStatus, tab]);

    const fetchLeaves = async () => {
        setLoading(true);
        const params = {};
        if (filterStatus) params.status = filterStatus;
        const res = await axios.get(`${API}/student-leaves`, { headers: headers(), params });
        setLeaves(res.data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!form.student || !form.startDate || !form.endDate || !form.reason) {
            setError('Student, dates and reason are required'); return;
        }
        try {
            await axios.post(`${API}/student-leaves`, form, { headers: headers() });
            setSuccess('Leave record created');
            setDialogOpen(false);
            fetchLeaves();
        } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
    };

    const handleStatusUpdate = async () => {
        await axios.put(`${API}/student-leaves/${statusDialog}/status`, statusAction, { headers: headers() });
        setStatusDialog(null);
        setSuccess(`Leave ${statusAction.status}`);
        fetchLeaves();
    };

    const handleDelete = async () => {
        await axios.delete(`${API}/student-leaves/${deleteDialog}`, { headers: headers() });
        setDeleteDialog(null);
        setSuccess('Leave deleted');
        fetchLeaves();
    };

    const pendingLeaves = leaves.filter(l => l.status === 'Pending');
    const displayLeaves = tab === 0 ? leaves : pendingLeaves;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700} color="primary.dark">🏖 Leave Management</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setForm(emptyForm); setDialogOpen(true); setError(''); }}>Add Leave</Button>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="All Leaves" />
                <Tab label={`Pending (${leaves.filter(l => l.status === 'Pending').length})`} />
                <Tab label="History" />
            </Tabs>

            <FormControl size="small" sx={{ minWidth: 160, mb: 2 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select value={filterStatus} label="Status Filter" onChange={e => setFilterStatus(e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    {['Pending', 'Approved', 'Rejected'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
            </FormControl>

            {loading ? <CircularProgress /> : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow><TableCell>Student</TableCell><TableCell>Leave Type</TableCell><TableCell>From</TableCell><TableCell>To</TableCell><TableCell>Days</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                            {displayLeaves.map(l => (
                                <TableRow key={l._id} hover>
                                    <TableCell><Typography variant="body2" fontWeight={600}>{l.student?.name}</Typography><Typography variant="caption" color="text.secondary">{l.student?.studentId}</Typography></TableCell>
                                    <TableCell><Chip label={l.leaveType} size="small" variant="outlined" /></TableCell>
                                    <TableCell>{new Date(l.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(l.endDate).toLocaleDateString()}</TableCell>
                                    <TableCell><Chip label={l.totalDays} size="small" /></TableCell>
                                    <TableCell sx={{ maxWidth: 200 }}><Typography variant="body2" noWrap>{l.reason}</Typography></TableCell>
                                    <TableCell><Chip label={l.status} size="small" color={STATUS_COLOR[l.status]} /></TableCell>
                                    <TableCell align="right">
                                        {l.status === 'Pending' && (
                                            <>
                                                <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => { setStatusDialog(l._id); setStatusAction({ status: 'Approved', notes: '' }); }}><Check fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => { setStatusDialog(l._id); setStatusAction({ status: 'Rejected', notes: '' }); }}><Close fontSize="small" /></IconButton></Tooltip>
                                            </>
                                        )}
                                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog(l._id)}><Delete fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {displayLeaves.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No leave records</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={700}>Add Leave Record</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small" required>
                                <InputLabel>Student *</InputLabel>
                                <Select value={form.student} label="Student *" onChange={e => setForm({ ...form, student: e.target.value })}>
                                    {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name} ({s.studentId})</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Leave Type</InputLabel>
                                <Select value={form.leaveType} label="Leave Type" onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                                    {LEAVE_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="Start Date *" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="End Date *" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12}><TextField fullWidth size="small" label="Reason *" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} multiline rows={2} /></Grid>
                        <Grid item xs={12}><TextField fullWidth size="small" label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Add Leave</Button>
                </DialogActions>
            </Dialog>

            {/* Status Update */}
            <Dialog open={!!statusDialog} onClose={() => setStatusDialog(null)}>
                <DialogTitle fontWeight={700}>{statusAction.status} Leave</DialogTitle>
                <DialogContent>
                    <TextField fullWidth size="small" label="Notes (optional)" value={statusAction.notes} onChange={e => setStatusAction({ ...statusAction, notes: e.target.value })} sx={{ mt: 1 }} multiline rows={2} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialog(null)}>Cancel</Button>
                    <Button variant="contained" color={statusAction.status === 'Approved' ? 'success' : 'error'} onClick={handleStatusUpdate}>{statusAction.status}</Button>
                </DialogActions>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Delete Leave Record?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
