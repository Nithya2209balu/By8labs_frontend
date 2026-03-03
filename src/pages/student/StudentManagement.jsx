import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, MenuItem, Grid, Avatar, FormControl, InputLabel, Select,
    InputAdornment, Tooltip, Alert, CircularProgress
} from '@mui/material';
import {
    Add, Edit, Delete, Search, PersonAdd, UploadFile, CheckCircle, Cancel
} from '@mui/icons-material';

const API = 'https://by8labs-backend.onrender.com/api';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const GENDER = ['Male', 'Female', 'Other'];
const STATUS = ['Active', 'Inactive'];

const emptyForm = {
    name: '', email: '', phone: '', dateOfBirth: '', gender: '', address: '',
    guardianName: '', guardianPhone: '', course: '', enrollmentDate: '', status: 'Active', notes: ''
};

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCourse, setFilterCourse] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (filterStatus) params.status = filterStatus;
            if (filterCourse) params.course = filterCourse;
            const res = await axios.get(`${API}/students`, { headers: headers(), params });
            setStudents(res.data.students || []);
        } catch (err) {
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        const res = await axios.get(`${API}/student-courses`, { headers: headers() });
        setCourses(res.data || []);
    };

    useEffect(() => { fetchStudents(); }, [search, filterStatus, filterCourse]);
    useEffect(() => { fetchCourses(); }, []);

    const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); setError(''); };
    const openEdit = (s) => {
        setForm({
            name: s.name || '', email: s.email || '', phone: s.phone || '',
            dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
            gender: s.gender || '', address: s.address || '', guardianName: s.guardianName || '',
            guardianPhone: s.guardianPhone || '', course: s.course?._id || '',
            enrollmentDate: s.enrollmentDate ? s.enrollmentDate.slice(0, 10) : '',
            status: s.status || 'Active', notes: s.notes || '',
        });
        setEditId(s._id);
        setDialogOpen(true);
        setError('');
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setError('Name is required'); return; }
        try {
            setSaving(true);
            if (editId) {
                await axios.put(`${API}/students/${editId}`, form, { headers: headers() });
                setSuccess('Student updated successfully');
            } else {
                await axios.post(`${API}/students`, form, { headers: headers() });
                setSuccess('Student added successfully');
            }
            setDialogOpen(false);
            fetchStudents();
        } catch (err) {
            setError(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API}/students/${deleteDialog}`, { headers: headers() });
            setDeleteDialog(null);
            setSuccess('Student deleted');
            fetchStudents();
        } catch {
            setError('Delete failed');
        }
    };

    const handleStatusToggle = async (s) => {
        const newStatus = s.status === 'Active' ? 'Inactive' : 'Active';
        await axios.put(`${API}/students/${s._id}/status`, { status: newStatus }, { headers: headers() });
        fetchStudents();
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700} color="primary.dark">👨‍🎓 Student Management</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Student</Button>
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
                    <FormControl fullWidth size="small">
                        <InputLabel>Course</InputLabel>
                        <Select value={filterCourse} label="Course" onChange={e => setFilterCourse(e.target.value)}>
                            <MenuItem value="">All Courses</MenuItem>
                            {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.courseName}</MenuItem>)}
                        </Select>
                    </FormControl>
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
                                                <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{s.gender || '—'}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={s.studentId} size="small" variant="outlined" color="primary" /></TableCell>
                                    <TableCell>{s.course?.courseName || <Typography variant="caption" color="text.secondary">Unassigned</Typography>}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{s.email || '—'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{s.phone || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>{s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : '—'}</TableCell>
                                    <TableCell>
                                        <Chip label={s.status} size="small" color={s.status === 'Active' ? 'success' : 'default'} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(s)}><Edit fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title={s.status === 'Active' ? 'Deactivate' : 'Activate'}>
                                            <IconButton size="small" color={s.status === 'Active' ? 'warning' : 'success'} onClick={() => handleStatusToggle(s)}>
                                                {s.status === 'Active' ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteDialog(s._id)}><Delete fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{editId ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Gender</InputLabel>
                                <Select value={form.gender} label="Gender" onChange={e => setForm({ ...form, gender: e.target.value })}>
                                    {GENDER.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Course</InputLabel>
                                <Select value={form.course} label="Course" onChange={e => setForm({ ...form, course: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.courseName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Guardian Name" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Guardian Phone" value={form.guardianPhone} onChange={e => setForm({ ...form, guardianPhone: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Enrollment Date" type="date" value={form.enrollmentDate} onChange={e => setForm({ ...form, enrollmentDate: e.target.value })} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={form.status} label="Status" onChange={e => setForm({ ...form, status: e.target.value })}>
                                    {STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} size="small" multiline rows={2} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} size="small" multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : editId ? 'Update' : 'Add Student'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent><Typography>Are you sure you want to delete this student? This action cannot be undone.</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
