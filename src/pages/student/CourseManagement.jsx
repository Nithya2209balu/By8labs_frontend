import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, MenuItem, Grid, FormControl, InputLabel, Select,
    Tooltip, Alert, CircularProgress, List, ListItem, ListItemText, Divider,
    InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Search, Group, School } from '@mui/icons-material';

const API = 'https://by8labs-backend.onrender.com/api';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const emptyForm = { courseName: '', courseCode: '', subjects: '', faculty: '', academicYear: '', duration: '', description: '', status: 'Active' };

export default function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailDialog, setDetailDialog] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            const res = await axios.get(`${API}/student-courses`, { headers: headers(), params });
            setCourses(res.data || []);
        } catch { setError('Failed to load courses'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCourses(); }, [search]);

    const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); setError(''); };
    const openEdit = (c) => {
        setForm({ courseName: c.courseName, courseCode: c.courseCode, subjects: (c.subjects || []).join(', '), faculty: c.faculty || '', academicYear: c.academicYear || '', duration: c.duration || '', description: c.description || '', status: c.status || 'Active' });
        setEditId(c._id); setDialogOpen(true); setError('');
    };

    const handleSave = async () => {
        if (!form.courseName || !form.courseCode) { setError('Course name and code are required'); return; }
        const payload = { ...form, subjects: form.subjects ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : [] };
        try {
            setSaving(true);
            if (editId) await axios.put(`${API}/student-courses/${editId}`, payload, { headers: headers() });
            else await axios.post(`${API}/student-courses`, payload, { headers: headers() });
            setSuccess(editId ? 'Course updated' : 'Course created');
            setDialogOpen(false);
            fetchCourses();
        } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        await axios.delete(`${API}/student-courses/${deleteDialog}`, { headers: headers() });
        setDeleteDialog(null); setSuccess('Course deleted'); fetchCourses();
    };

    const viewDetail = async (id) => {
        const res = await axios.get(`${API}/student-courses/${id}`, { headers: headers() });
        setDetailDialog(res.data);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700} color="primary.dark">📚 Course Management</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Create Course</Button>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            <TextField fullWidth size="small" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}
                sx={{ mb: 3 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />

            {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Course Name</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Faculty</TableCell>
                                <TableCell>Academic Year</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Students</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No courses yet. Create one!</TableCell></TableRow>
                            ) : courses.map(c => (
                                <TableRow key={c._id} hover>
                                    <TableCell><Typography variant="body2" fontWeight={600}>{c.courseName}</Typography></TableCell>
                                    <TableCell><Chip label={c.courseCode} size="small" variant="outlined" color="primary" /></TableCell>
                                    <TableCell>{c.faculty || '—'}</TableCell>
                                    <TableCell>{c.academicYear || '—'}</TableCell>
                                    <TableCell>{c.duration || '—'}</TableCell>
                                    <TableCell>
                                        <Chip label={`${(c.enrolledStudents || []).length} enrolled`} size="small" icon={<Group sx={{ fontSize: '14px !important' }} />}
                                            color={(c.enrolledStudents || []).length > 0 ? 'success' : 'default'} variant="outlined"
                                            onClick={() => viewDetail(c._id)} sx={{ cursor: 'pointer' }} />
                                    </TableCell>
                                    <TableCell><Chip label={c.status} size="small" color={c.status === 'Active' ? 'success' : 'default'} /></TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(c)}><Edit fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteDialog(c._id)}><Delete fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{editId ? 'Edit Course' : 'Create Course'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={8}><TextField fullWidth label="Course Name *" value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Course Code *" value={form.courseCode} onChange={e => setForm({ ...form, courseCode: e.target.value.toUpperCase() })} size="small" /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Subjects (comma separated)" value={form.subjects} onChange={e => setForm({ ...form, subjects: e.target.value })} size="small" placeholder="Math, Science, English" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Faculty Name" value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Academic Year" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} size="small" placeholder="2025-26" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Duration" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} size="small" placeholder="2 Years" /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={form.status} label="Status" onChange={e => setForm({ ...form, status: e.target.value })}>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} size="small" multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Create Course'}</Button>
                </DialogActions>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{detailDialog?.courseName} – Enrolled Students</DialogTitle>
                <DialogContent>
                    {(detailDialog?.enrolledStudents || []).length === 0 ? (
                        <Typography color="text.secondary">No students enrolled yet</Typography>
                    ) : (
                        <List dense>
                            {detailDialog.enrolledStudents.map(s => (
                                <React.Fragment key={s._id}>
                                    <ListItem disablePadding sx={{ py: 0.5 }}>
                                        <ListItemText primary={s.name} secondary={s.studentId} primaryTypographyProps={{ fontWeight: 600 }} />
                                        <Chip label={s.status} size="small" color={s.status === 'Active' ? 'success' : 'default'} />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions><Button onClick={() => setDetailDialog(null)}>Close</Button></DialogActions>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Delete Course?</DialogTitle>
                <DialogContent><Typography>This will delete the course. Students will be unlinked.</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
