import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, MenuItem, Grid, FormControl, InputLabel, Select,
    InputAdornment, Tooltip, Alert, CircularProgress, Card, CardContent,
    Divider, Stepper, Step, StepLabel, Badge, Stack,
} from '@mui/material';
import {
    Add, Edit, Delete, Search, CheckCircle, Cancel, Schedule, Visibility,
    HowToReg, PersonAdd, SwapHoriz, Assignment, Refresh
} from '@mui/icons-material';

const API = 'https://by8labs-backend.onrender.com/api';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const STATUS_OPTIONS = ['Pending', 'Under Review', 'Interview Scheduled', 'Approved', 'Rejected', 'Waitlisted'];
const GENDER = ['Male', 'Female', 'Other'];

const STATUS_COLOR = {
    'Pending': 'warning',
    'Under Review': 'info',
    'Interview Scheduled': 'secondary',
    'Approved': 'success',
    'Rejected': 'error',
    'Waitlisted': 'default',
};

const STATUS_STEPS = ['Pending', 'Under Review', 'Interview Scheduled', 'Approved'];

const emptyForm = {
    applicantName: '', email: '', phone: '', dateOfBirth: '', gender: '',
    address: '', guardianName: '', guardianPhone: '', guardianRelation: '',
    previousSchool: '', previousClass: '', previousPercentage: '',
    appliedCourse: '', appliedClass: '', applicationDate: '',
    interviewDate: '', interviewNotes: '', status: 'Pending',
    admissionFee: '', feePaid: false, remarks: '',
};

const StatCard = ({ label, value, color, icon }) => (
    <Card elevation={2} sx={{ flex: 1, minWidth: 120 }}>
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} color={color || 'text.primary'} lineHeight={1.2} mt={0.5}>
                {value}
            </Typography>
        </CardContent>
    </Card>
);

export default function AdmissionManagement() {
    const [admissions, setAdmissions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCourse, setFilterCourse] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailDialog, setDetailDialog] = useState(null);
    const [statusDialog, setStatusDialog] = useState(null);
    const [convertDialog, setConvertDialog] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [statusForm, setStatusForm] = useState({ status: '', remarks: '', interviewDate: '', interviewNotes: '' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (filterStatus) params.status = filterStatus;
            if (filterCourse) params.course = filterCourse;
            const [admRes, statsRes] = await Promise.all([
                axios.get(`${API}/student-admissions`, { headers: headers(), params }),
                axios.get(`${API}/student-admissions/stats/summary`, { headers: headers() }),
            ]);
            setAdmissions(admRes.data.admissions || []);
            setStats(statsRes.data);
        } catch {
            setError('Failed to load admissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API}/student-courses`, { headers: headers() });
            setCourses(res.data || []);
        } catch { /* ignore */ }
    };

    useEffect(() => { fetchData(); }, [search, filterStatus, filterCourse]);
    useEffect(() => { fetchCourses(); }, []);

    const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); setError(''); };
    const openEdit = (a) => {
        setForm({
            applicantName: a.applicantName || '', email: a.email || '', phone: a.phone || '',
            dateOfBirth: a.dateOfBirth ? a.dateOfBirth.slice(0, 10) : '',
            gender: a.gender || '', address: a.address || '',
            guardianName: a.guardianName || '', guardianPhone: a.guardianPhone || '',
            guardianRelation: a.guardianRelation || '',
            previousSchool: a.previousSchool || '', previousClass: a.previousClass || '',
            previousPercentage: a.previousPercentage || '',
            appliedCourse: a.appliedCourse?._id || '', appliedClass: a.appliedClass || '',
            applicationDate: a.applicationDate ? a.applicationDate.slice(0, 10) : '',
            interviewDate: a.interviewDate ? a.interviewDate.slice(0, 10) : '',
            interviewNotes: a.interviewNotes || '', status: a.status || 'Pending',
            admissionFee: a.admissionFee || '', feePaid: a.feePaid || false, remarks: a.remarks || '',
        });
        setEditId(a._id);
        setDialogOpen(true);
        setError('');
    };

    const handleSave = async () => {
        if (!form.applicantName.trim()) { setError('Applicant Name is required'); return; }
        try {
            setSaving(true);
            const payload = { ...form };
            if (payload.previousPercentage === '') delete payload.previousPercentage;
            if (payload.admissionFee === '') delete payload.admissionFee;
            if (editId) {
                await axios.put(`${API}/student-admissions/${editId}`, payload, { headers: headers() });
                setSuccess('Admission updated successfully');
            } else {
                await axios.post(`${API}/student-admissions`, payload, { headers: headers() });
                setSuccess('Admission application created successfully');
            }
            setDialogOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            setSaving(true);
            await axios.put(`${API}/student-admissions/${statusDialog._id}/status`, statusForm, { headers: headers() });
            setSuccess(`Status updated to ${statusForm.status}`);
            setStatusDialog(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Status update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleConvert = async () => {
        try {
            setConverting(true);
            const res = await axios.post(`${API}/student-admissions/${convertDialog._id}/convert`, {}, { headers: headers() });
            setSuccess(`✅ Student record created! ID: ${res.data.student.studentId}`);
            setConvertDialog(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Conversion failed');
        } finally {
            setConverting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API}/student-admissions/${deleteDialog._id}`, { headers: headers() });
            setDeleteDialog(null);
            setSuccess('Admission deleted');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed');
        }
    };

    const stepIndex = (status) => {
        const idx = STATUS_STEPS.indexOf(status);
        return idx === -1 ? 0 : idx;
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color="primary.dark">🎓 Admission Management</Typography>
                    <Typography variant="body2" color="text.secondary">Manage student admission applications and approvals</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Refresh"><IconButton onClick={fetchData}><Refresh /></IconButton></Tooltip>
                    <Button variant="contained" startIcon={<Add />} onClick={openAdd}>New Application</Button>
                </Stack>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

            {/* Stats */}
            {stats && (
                <Box display="flex" gap={1.5} flexWrap="wrap" mb={3}>
                    <StatCard label="Total" value={stats.total} color="text.primary" />
                    <StatCard label="Pending" value={stats.pending} color="warning.main" />
                    <StatCard label="Under Review" value={stats.underReview} color="info.main" />
                    <StatCard label="Interview" value={stats.interviewScheduled} color="secondary.main" />
                    <StatCard label="Approved" value={stats.approved} color="success.main" />
                    <StatCard label="Rejected" value={stats.rejected} color="error.main" />
                    <StatCard label="Waitlisted" value={stats.waitlisted} color="text.secondary" />
                    <StatCard label="Last 30 Days" value={stats.recentApplications} color="primary.main" />
                </Box>
            )}

            {/* Filters */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={5}>
                    <TextField fullWidth size="small" placeholder="Search name, ID, email, phone..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
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

            {/* Table */}
            {loading ? (
                <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : (
                <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Applicant</TableCell>
                                <TableCell>Adm. ID</TableCell>
                                <TableCell>Course Applied</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Applied On</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Student ID</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {admissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No admission applications found
                                    </TableCell>
                                </TableRow>
                            ) : admissions.map(a => (
                                <TableRow key={a._id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>{a.applicantName}</Typography>
                                            <Typography variant="caption" color="text.secondary">{a.gender || '—'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={a.admissionId} size="small" variant="outlined" color="primary" />
                                    </TableCell>
                                    <TableCell>{a.appliedCourse?.courseName || <Typography variant="caption" color="text.secondary">Not specified</Typography>}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{a.email || '—'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{a.phone || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>{a.applicationDate ? new Date(a.applicationDate).toLocaleDateString() : '—'}</TableCell>
                                    <TableCell>
                                        <Chip label={a.status} size="small" color={STATUS_COLOR[a.status] || 'default'} />
                                    </TableCell>
                                    <TableCell>
                                        {a.student ? (
                                            <Chip label={a.student.studentId} size="small" color="success" icon={<HowToReg sx={{ fontSize: '0.85rem !important' }} />} />
                                        ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View Details">
                                            <IconButton size="small" color="info" onClick={() => setDetailDialog(a)}>
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" color="primary" onClick={() => openEdit(a)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Update Status">
                                            <IconButton size="small" color="secondary"
                                                onClick={() => { setStatusDialog(a); setStatusForm({ status: a.status, remarks: a.remarks || '', interviewDate: a.interviewDate ? a.interviewDate.slice(0, 10) : '', interviewNotes: a.interviewNotes || '' }); }}>
                                                <SwapHoriz fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        {!a.student && (a.status !== 'Rejected') && (
                                            <Tooltip title="Convert to Student Record">
                                                <IconButton size="small" color="success" onClick={() => setConvertDialog(a)}>
                                                    <PersonAdd fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Delete">
                                            <span>
                                                <IconButton size="small" color="error" onClick={() => setDeleteDialog(a)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editId ? '✏️ Edit Admission Application' : '📋 New Admission Application'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={700}>Applicant Information</Typography><Divider /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Full Name *" value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })} size="small" /></Grid>
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
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Application Date" type="date" value={form.applicationDate} onChange={e => setForm({ ...form, applicationDate: e.target.value })} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} size="small" multiline rows={2} /></Grid>

                        <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={700} mt={1}>Guardian / Parent Information</Typography><Divider /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Guardian Name" value={form.guardianName} onChange={e => setForm({ ...form, guardianName: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Guardian Phone" value={form.guardianPhone} onChange={e => setForm({ ...form, guardianPhone: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Relation" value={form.guardianRelation} onChange={e => setForm({ ...form, guardianRelation: e.target.value })} size="small" /></Grid>

                        <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={700} mt={1}>Academic Background</Typography><Divider /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Previous School" value={form.previousSchool} onChange={e => setForm({ ...form, previousSchool: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Previous Class / Grade" value={form.previousClass} onChange={e => setForm({ ...form, previousClass: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Previous % / GPA" type="number" value={form.previousPercentage} onChange={e => setForm({ ...form, previousPercentage: e.target.value })} size="small" inputProps={{ min: 0, max: 100 }} /></Grid>

                        <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={700} mt={1}>Course & Admission Details</Typography><Divider /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Applied Course</InputLabel>
                                <Select value={form.appliedCourse} label="Applied Course" onChange={e => setForm({ ...form, appliedCourse: e.target.value })}>
                                    <MenuItem value="">None</MenuItem>
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.courseName} ({c.courseCode})</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Applied Class / Section" value={form.appliedClass} onChange={e => setForm({ ...form, appliedClass: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Admission Fee (₹)" type="number" value={form.admissionFee} onChange={e => setForm({ ...form, admissionFee: e.target.value })} size="small" /></Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select value={form.status} label="Status" onChange={e => setForm({ ...form, status: e.target.value })}>
                                    {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}><TextField fullWidth label="Remarks / Notes" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} size="small" multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : editId ? 'Update' : 'Submit Application'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Detail View Dialog */}
            <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>📋 Admission Details — {detailDialog?.admissionId}</DialogTitle>
                <DialogContent>
                    {detailDialog && (
                        <Box>
                            <Stepper activeStep={stepIndex(detailDialog.status)} alternativeLabel sx={{ mb: 3 }}>
                                {STATUS_STEPS.map(label => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                            <Grid container spacing={1.5}>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Name</Typography><Typography fontWeight={600}>{detailDialog.applicantName}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Status</Typography><Box mt={0.5}><Chip label={detailDialog.status} size="small" color={STATUS_COLOR[detailDialog.status] || 'default'} /></Box></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{detailDialog.email || '—'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{detailDialog.phone || '—'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Gender</Typography><Typography>{detailDialog.gender || '—'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">DOB</Typography><Typography>{detailDialog.dateOfBirth ? new Date(detailDialog.dateOfBirth).toLocaleDateString() : '—'}</Typography></Grid>
                                <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Guardian</Typography><Typography>{detailDialog.guardianName || '—'} ({detailDialog.guardianRelation || '—'})</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Guardian Phone</Typography><Typography>{detailDialog.guardianPhone || '—'}</Typography></Grid>
                                <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Applied Course</Typography><Typography>{detailDialog.appliedCourse?.courseName || '—'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Class / Section</Typography><Typography>{detailDialog.appliedClass || '—'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Previous School</Typography><Typography>{detailDialog.previousSchool || '—'}</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Previous %</Typography><Typography>{detailDialog.previousPercentage != null ? `${detailDialog.previousPercentage}%` : '—'}</Typography></Grid>
                                {detailDialog.interviewDate && (
                                    <Grid item xs={6}><Typography variant="caption" color="text.secondary">Interview Date</Typography><Typography>{new Date(detailDialog.interviewDate).toLocaleDateString()}</Typography></Grid>
                                )}
                                {detailDialog.interviewNotes && (
                                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Interview Notes</Typography><Typography>{detailDialog.interviewNotes}</Typography></Grid>
                                )}
                                {detailDialog.remarks && (
                                    <Grid item xs={12}><Typography variant="caption" color="text.secondary">Remarks</Typography><Typography>{detailDialog.remarks}</Typography></Grid>
                                )}
                                {detailDialog.student && (
                                    <Grid item xs={12}>
                                        <Alert severity="success" icon={<HowToReg />} sx={{ mt: 1 }}>
                                            Converted to Student: <strong>{detailDialog.student.studentId} — {detailDialog.student.name}</strong>
                                        </Alert>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialog(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Status Update Dialog */}
            <Dialog open={!!statusDialog} onClose={() => setStatusDialog(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Update Admission Status</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel>New Status</InputLabel>
                                <Select value={statusForm.status} label="New Status" onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}>
                                    {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        {(statusForm.status === 'Interview Scheduled') && (
                            <Grid item xs={12}><TextField fullWidth label="Interview Date" type="date" value={statusForm.interviewDate} onChange={e => setStatusForm({ ...statusForm, interviewDate: e.target.value })} size="small" InputLabelProps={{ shrink: true }} /></Grid>
                        )}
                        {(statusForm.status === 'Interview Scheduled') && (
                            <Grid item xs={12}><TextField fullWidth label="Interview Notes" value={statusForm.interviewNotes} onChange={e => setStatusForm({ ...statusForm, interviewNotes: e.target.value })} size="small" multiline rows={2} /></Grid>
                        )}
                        <Grid item xs={12}><TextField fullWidth label="Remarks" value={statusForm.remarks} onChange={e => setStatusForm({ ...statusForm, remarks: e.target.value })} size="small" multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setStatusDialog(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleStatusUpdate} disabled={saving}>{saving ? 'Saving...' : 'Update Status'}</Button>
                </DialogActions>
            </Dialog>

            {/* Convert to Student Dialog */}
            <Dialog open={!!convertDialog} onClose={() => setConvertDialog(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>✅ Convert to Student Record</DialogTitle>
                <DialogContent>
                    <Typography mb={1}>
                        This will create a new <strong>Student record</strong> from the admission application of:
                    </Typography>
                    <Typography fontWeight={700} variant="h6" color="primary">{convertDialog?.applicantName}</Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        The admission will be marked as <strong>Approved</strong> and a Student ID will be auto-generated.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setConvertDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleConvert} disabled={converting} startIcon={<HowToReg />}>
                        {converting ? 'Converting...' : 'Approve & Create Student'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete the admission application for <strong>{deleteDialog?.applicantName}</strong>? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
