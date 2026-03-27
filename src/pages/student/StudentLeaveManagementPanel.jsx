import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Grid, Typography, Paper, CircularProgress, Alert, Avatar,
    Chip, IconButton, Button, TextField, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, InputAdornment, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Card, CardContent
} from '@mui/material';
import {
    EventNote, Search, FilterList, CheckCircle, Cancel, Refresh, ThumbUp, ThumbDown
} from '@mui/icons-material';
import { leaveAPI, adminStudentAPI } from '../../services/studentPortalAPI';

const STATUS_COLORS = { pending: 'warning', approved: 'success', rejected: 'error' };

function StatCard({ label, value, icon, color }) {
    return (
        <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                <Box sx={{ color, fontSize: 32, mb: 0.5 }}>{icon}</Box>
                <Typography variant="h4" fontWeight={800} sx={{ color }}>{value ?? '0'}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>{label}</Typography>
            </CardContent>
        </Card>
    );
}

export default function StudentLeaveManagementPanel() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Filters
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
    const [filterDate, setFilterDate] = useState('');

    // Modal
    const [actionDialog, setActionDialog] = useState(null); // { id: '...', status: 'approved' }

    // Students Mapping
    const [studentsMap, setStudentsMap] = useState({});

    const fetchLeavesAndStudents = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            const params = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            
            // Fetch leaves and students concurrently
            const [leavesRes, studentsRes] = await Promise.all([
                leaveAPI.getAllLeaves(params),
                adminStudentAPI.getAllStudents().catch(() => ({ data: { data: [] } }))
            ]);
            
            setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : (leavesRes.data?.data || []));
            
            // Build student map
            const stList = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data?.data || []);
            const smap = {};
            stList.forEach(s => {
                if (s._id) smap[s._id] = s;
                if (s.studentId) smap[s.studentId] = s;
            });
            setStudentsMap(smap);
            
        } catch (err) {
            setError('Failed to load leave records.');
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchLeavesAndStudents();
    }, [fetchLeavesAndStudents]);

    const handleAction = async () => {
        if (!actionDialog) return;
        try {
            setSaving(true);
            await leaveAPI.updateLeaveStatus(actionDialog.id, { status: actionDialog.status });
            setSuccess(`Leave ${actionDialog.status} successfully.`);
            setActionDialog(null);
            fetchLeavesAndStudents();
        } catch (err) {
            setError(`Failed to ${actionDialog.status.replace('ed', '')} leave.`);
        } finally {
            setSaving(false);
        }
    };

    const filteredLeaves = leaves.filter(l => {
        const studentObj = studentsMap[l.student] || studentsMap[l.userId];
        const studentInfo = l.student || l.userId;
        const mappedName = studentObj ? (studentObj.username || studentObj.name) : null;
        const nameText = mappedName || (typeof studentInfo === 'object' ? (studentInfo?.username || studentInfo?.name) : (l.username || l.name || studentInfo));
        
        const leaveTypeStr = l.leaveType || l.type || l.category || l.leaveCategory || '—';

        const q = search.toLowerCase();
        const matchesSearch = !search || 
            nameText?.toLowerCase().includes(q) ||
            leaveTypeStr?.toLowerCase().includes(q) ||
            l.description?.toLowerCase().includes(q);
        
        const matchesDate = !filterDate || l.startDate?.startsWith(filterDate) || l.endDate?.startsWith(filterDate);

        return matchesSearch && matchesDate;
    });

    // Summary counts (calculated from all fetched data or only if filterStatus='all')
    const totalCount = leaves.length;
    const pendingCount = leaves.filter(l => l.status?.toLowerCase() === 'pending').length;
    const approvedCount = leaves.filter(l => l.status?.toLowerCase() === 'approved').length;
    const rejectedCount = leaves.filter(l => l.status?.toLowerCase() === 'rejected').length;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>Leave Management</Typography>
                <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchLeavesAndStudents} disabled={loading || saving}>Refresh</Button>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2 }}>{error}</Alert>}

            {/* Dashboard Overview Cards */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={6} sm={3}>
                    <StatCard label="Total Leaves" value={totalCount} icon={<EventNote />} color="#1976d2" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard label="Pending" value={pendingCount} icon={<CheckCircle sx={{ color: 'warning.main' }} />} color="#ed6c02" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard label="Approved" value={approvedCount} icon={<CheckCircle />} color="#2e7d32" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard label="Rejected" value={rejectedCount} icon={<Cancel />} color="#d32f2f" />
                </Grid>
            </Grid>

            {/* Filters */}
            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                <TextField
                    size="small" placeholder="Search Name, Type..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    sx={{ flexGrow: 1, maxWidth: 300 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                />
                <TextField
                    select
                    size="small"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    SelectProps={{ native: true }}
                    sx={{ minWidth: 150 }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FilterList fontSize="small" /></InputAdornment> }}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </TextField>
                <TextField 
                    type="date"
                    size="small"
                    label="Date Filter"
                    InputLabelProps={{ shrink: true }}
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    sx={{ minWidth: 150 }}
                />
            </Box>

            {/* Table */}
            {loading ? <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box> : (
                <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Student Name</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Leave Type</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Description</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Start Date</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>End Date</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Status</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLeaves.length === 0 ? (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No leave applications found.</TableCell></TableRow>
                            ) : filteredLeaves.map((l) => {
                                const st = l.status?.toLowerCase() || 'pending';
                                
                                const studentObj = studentsMap[l.student] || studentsMap[l.userId];
                                const studentInfo = l.student || l.userId;
                                const mappedName = studentObj ? (studentObj.username || studentObj.name) : null;
                                const studentName = mappedName || (typeof studentInfo === 'object' ? (studentInfo?.username || studentInfo?.name) : (l.username || l.name || studentInfo));
                                
                                const leaveTypeStr = l.leaveType || l.type || l.category || l.leaveCategory || '—';

                                return (
                                    <TableRow key={l._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} color="primary">{studentName || '—'}</Typography>
                                        </TableCell>
                                        <TableCell><Chip label={leaveTypeStr} size="small" variant="outlined" /></TableCell>
                                        <TableCell sx={{ maxWidth: 200 }}><Typography variant="body2" noWrap title={l.description || l.reason}>{l.description || l.reason || '—'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{l.startDate ? new Date(l.startDate).toLocaleDateString() : '—'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{l.endDate ? new Date(l.endDate).toLocaleDateString() : '—'}</Typography></TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={l.status || 'Pending'} 
                                                size="small" 
                                                color={STATUS_COLORS[st] || 'default'} 
                                                sx={{ textTransform: 'capitalize' }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {st === 'pending' ? (
                                                <Box display="flex" justifyContent="flex-end" gap={1}>
                                                    <Tooltip title="Approve">
                                                        <IconButton size="small" color="success" onClick={() => setActionDialog({ id: l._id, status: 'approved' })} disabled={saving}>
                                                            <ThumbUp fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject">
                                                        <IconButton size="small" color="error" onClick={() => setActionDialog({ id: l._id, status: 'rejected' })} disabled={saving}>
                                                            <ThumbDown fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">Processed</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Action Dialog */}
            <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight={700}>
                    Confirm {actionDialog?.status === 'approved' ? 'Approval' : 'Rejection'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to <strong>{actionDialog?.status.replace('ed', '')}</strong> this leave request?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setActionDialog(null)} color="inherit" disabled={saving}>Cancel</Button>
                    <Button 
                        onClick={handleAction} 
                        variant="contained" 
                        color={actionDialog?.status === 'approved' ? 'success' : 'error'}
                        disabled={saving}
                        startIcon={saving && <CircularProgress size={16} color="inherit" />}
                    >
                        {actionDialog?.status === 'approved' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
