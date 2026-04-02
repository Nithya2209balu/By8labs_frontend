import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, MenuItem, Grid, FormControl, InputLabel, Select,
    Tooltip, Alert, CircularProgress, LinearProgress
} from '@mui/material';
import { Add, Edit, Delete, Assessment } from '@mui/icons-material';

const API = '/api';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const emptyForm = { title: '', course: '', subject: '', description: '', dueDate: '', maxMarks: 100 };

export default function StudentAssignment() {
    const [assignments, setAssignments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [subDialog, setSubDialog] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [subData, setSubData] = useState({});
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API}/student-courses`, { headers: headers() }).then(r => setCourses(r.data || []));
        axios.get(`${API}/students?limit=200`, { headers: headers() }).then(r => setStudents(r.data.students || []));
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        const res = await axios.get(`${API}/student-assignments`, { headers: headers() });
        setAssignments(res.data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!form.title || !form.dueDate) { setError('Title and due date are required'); return; }
        try {
            if (editId) await axios.put(`${API}/student-assignments/${editId}`, form, { headers: headers() });
            else await axios.post(`${API}/student-assignments`, form, { headers: headers() });
            setSuccess(editId ? 'Assignment updated' : 'Assignment created');
            setDialogOpen(false);
            fetchAssignments();
        } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
    };

    const handleDelete = async () => {
        await axios.delete(`${API}/student-assignments/${deleteDialog}`, { headers: headers() });
        setDeleteDialog(null);
        setSuccess('Assignment deleted');
        fetchAssignments();
    };

    const openSubmissions = async (a) => {
        const res = await axios.get(`${API}/student-assignments/${a._id}`, { headers: headers() });
        setSubDialog(res.data);
        const map = {};
        (res.data.submittedStudents || []).forEach(s => { map[s.student?._id] = s; });
        setSubData(map);
    };

    const handleSubUpdate = async (assignmentId, studentId) => {
        const sub = subData[studentId] || {};
        await axios.put(`${API}/student-assignments/${assignmentId}/submission/${studentId}`, {
            status: sub.status || 'Submitted',
            marksObtained: sub.marksObtained,
            notes: sub.notes,
            submittedAt: sub.submittedAt || new Date().toISOString(),
        }, { headers: headers() });
        setSuccess('Submission updated');
    };

    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700} color="primary.dark">📝 Assignment Management</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); setError(''); }}>Upload Assignment</Button>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? <CircularProgress /> : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow><TableCell>Title</TableCell><TableCell>Course</TableCell><TableCell>Subject</TableCell><TableCell>Due Date</TableCell><TableCell>Max Marks</TableCell><TableCell>Submissions</TableCell><TableCell align="right">Actions</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                            {assignments.map(a => {
                                const submitted = (a.submittedStudents || []).filter(s => s.status === 'Submitted' || s.status === 'Late').length;
                                const total = (a.course?.enrolledStudents || []).length || students.length;
                                const pct = total ? Math.round((submitted / total) * 100) : 0;
                                return (
                                    <TableRow key={a._id} hover>
                                        <TableCell><Typography variant="body2" fontWeight={600}>{a.title}</Typography></TableCell>
                                        <TableCell>{a.course?.courseName || '—'}</TableCell>
                                        <TableCell>{a.subject || '—'}</TableCell>
                                        <TableCell>
                                            <Chip label={new Date(a.dueDate).toLocaleDateString()} size="small" color={isOverdue(a.dueDate) ? 'error' : 'default'} variant={isOverdue(a.dueDate) ? 'filled' : 'outlined'} />
                                        </TableCell>
                                        <TableCell>{a.maxMarks}</TableCell>
                                        <TableCell sx={{ minWidth: 140 }}>
                                            <Box>
                                                <Typography variant="caption">{submitted} submitted</Typography>
                                                <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} color={pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'error'} />
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Track Submissions"><IconButton size="small" color="info" onClick={() => openSubmissions(a)}><Assessment fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => { setForm({ title: a.title, course: a.course?._id || '', subject: a.subject || '', description: a.description || '', dueDate: a.dueDate?.slice(0, 10) || '', maxMarks: a.maxMarks }); setEditId(a._id); setDialogOpen(true); }}><Edit fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteDialog(a._id)}><Delete fontSize="small" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {assignments.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No assignments yet</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={700}>{editId ? 'Edit Assignment' : 'Upload Assignment'}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}><TextField fullWidth size="small" label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Course</InputLabel>
                                <Select value={form.course} label="Course" onChange={e => setForm({ ...form, course: e.target.value })}>
                                    <MenuItem value="">All Courses</MenuItem>
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.courseName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Due Date *" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Max Marks" type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth size="small" label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} multiline rows={3} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>{editId ? 'Update' : 'Upload'}</Button>
                </DialogActions>
            </Dialog>

            {/* Submissions Dialog */}
            <Dialog open={!!subDialog} onClose={() => setSubDialog(null)} maxWidth="md" fullWidth>
                <DialogTitle fontWeight={700}>Submissions – {subDialog?.title}</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table size="small">
                            <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Status</TableCell><TableCell>Submitted At</TableCell><TableCell>Marks</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
                            <TableBody>
                                {students.map(s => {
                                    const sub = subData[s._id] || {};
                                    return (
                                        <TableRow key={s._id}>
                                            <TableCell><Typography variant="body2" fontWeight={600}>{s.name}</Typography><Typography variant="caption">{s.studentId}</Typography></TableCell>
                                            <TableCell>
                                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                                    <Select value={sub.status || 'Not Submitted'} onChange={e => setSubData({ ...subData, [s._id]: { ...sub, student: { _id: s._id }, status: e.target.value } })}>
                                                        {['Submitted', 'Late', 'Not Submitted'].map(st => <MenuItem key={st} value={st}>{st}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'}</TableCell>
                                            <TableCell><TextField size="small" type="number" value={sub.marksObtained || ''} onChange={e => setSubData({ ...subData, [s._id]: { ...sub, student: { _id: s._id }, marksObtained: e.target.value } })} sx={{ width: 80 }} /></TableCell>
                                            <TableCell><Button size="small" variant="outlined" onClick={() => handleSubUpdate(subDialog._id, s._id)}>Save</Button></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions><Button onClick={() => setSubDialog(null)}>Close</Button></DialogActions>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Delete Assignment?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
                     