import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, MenuItem, Grid, FormControl, InputLabel, Select,
    Tooltip, Alert, CircularProgress, Tabs, Tab, LinearProgress
} from '@mui/material';
import { Edit, Save, Assessment, Refresh } from '@mui/icons-material';

const API = 'https://by8labs-backend.onrender.com/api';
const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const STATUS_COLORS = { Present: 'success', Absent: 'error', Late: 'warning', Leave: 'info' };
const STATUSES = ['Present', 'Absent', 'Late', 'Leave'];

export default function StudentAttendance() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [records, setRecords] = useState([]);
    const [report, setReport] = useState([]);
    const [tab, setTab] = useState(0);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [course, setCourse] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [attendance, setAttendance] = useState({});
    const [editDialog, setEditDialog] = useState(null);
    const [editStatus, setEditStatus] = useState('Present');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Load students and courses on mount
    useEffect(() => {
        const load = async () => {
            try {
                const [sRes, cRes] = await Promise.all([
                    axios.get(`${API}/students?limit=500`, { headers: headers() }),
                    axios.get(`${API}/student-courses`, { headers: headers() }),
                ]);
                const studentList = sRes.data.students || [];
                setStudents(studentList);
                setCourses(cRes.data || []);
                if (studentList.length === 0) {
                    setError('No students found. Please add students via the Student Management or Admission section first.');
                }
            } catch (err) {
                setError(`Failed to load students: ${err.response?.data?.message || err.message}. Make sure you are logged in as HR.`);
            }
        };
        load();
    }, []);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { date };
            if (course) params.course = course;
            const res = await axios.get(`${API}/student-attendance`, { headers: headers(), params });
            const recs = res.data || [];
            setRecords(recs);
            const map = {};
            recs.forEach(r => { if (r.student?._id) map[r.student._id] = { status: r.status, id: r._id }; });
            setAttendance(map);
        } catch (err) {
            setError(`Failed to load records: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [date, course]);

    useEffect(() => {
        if (tab === 0 || tab === 1) fetchRecords();
    }, [fetchRecords, tab]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
    };

    const handleSaveBulk = async () => {
        const filtered = displayStudents;
        if (filtered.length === 0) {
            setError('No students to mark attendance for. Add students or change the course filter.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const recs = filtered.map(s => ({
                student: s._id,
                status: attendance[s._id]?.status || 'Absent',
            }));
            const res = await axios.post(
                `${API}/student-attendance/bulk`,
                { date, course: course || undefined, records: recs },
                { headers: headers() }
            );
            const saved = res.data?.saved ?? filtered.length;
            setSuccess(`✅ Attendance saved for ${saved} students on ${date}. Reloading records...`);
            fetchRecords();
        } catch (err) {
            setError(`Save failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleEditSave = async () => {
        try {
            if (editDialog?._id) {
                await axios.put(
                    `${API}/student-attendance/${editDialog._id}`,
                    { status: editStatus },
                    { headers: headers() }
                );
            }
            setEditDialog(null);
            setSuccess('Record updated');
            fetchRecords();
        } catch (err) {
            setError(`Update failed: ${err.response?.data?.message || err.message}`);
        }
    };

    const fetchReport = async () => {
        if (!startDate || !endDate) {
            setError('Please select both Start Date and End Date for the report.');
            return;
        }
        setLoading(true);
        setError('');
        setReport([]);
        try {
            const params = { startDate, endDate };
            if (course) params.course = course;
            const res = await axios.get(`${API}/student-attendance/report/summary`, { headers: headers(), params });
            const data = res.data || [];
            setReport(data);
            if (data.length === 0) {
                setError('No attendance records found for the selected date range. Mark attendance first, then generate the report.');
            }
        } catch (err) {
            setError(`Report failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const displayStudents = students.filter(s => !course || String(s.course?._id) === String(course));

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700} color="primary.dark">📅 Attendance Management</Typography>
                <Tooltip title="Reload students"><IconButton onClick={() => window.location.reload()}><Refresh /></IconButton></Tooltip>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

            <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }} sx={{ mb: 3 }}>
                <Tab label={`Mark Attendance${students.length > 0 ? ` (${displayStudents.length} students)` : ''}`} />
                <Tab label="View Records" />
                <Tab label="Attendance Report" />
            </Tabs>

            {/* ─── Mark Attendance ─── */}
            {tab === 0 && (
                <Box>
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth size="small" label="Date" type="date"
                                value={date} onChange={e => setDate(e.target.value)}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Course (filter)</InputLabel>
                                <Select value={course} label="Course (filter)" onChange={e => setCourse(e.target.value)}>
                                    <MenuItem value="">All Students</MenuItem>
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.courseName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} display="flex" alignItems="center">
                            <Button
                                variant="contained"
                                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                onClick={handleSaveBulk}
                                fullWidth
                                disabled={saving || displayStudents.length === 0}
                            >
                                {saving ? 'Saving...' : `Save Attendance (${displayStudents.length})`}
                            </Button>
                        </Grid>
                    </Grid>

                    {loading ? <LinearProgress /> : (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Student</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>ID</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Course</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {displayStudents.map(s => (
                                        <TableRow key={s._id} hover>
                                            <TableCell><Typography variant="body2" fontWeight={600}>{s.name}</Typography></TableCell>
                                            <TableCell><Chip label={s.studentId} size="small" variant="outlined" /></TableCell>
                                            <TableCell>{s.course?.courseName || '—'}</TableCell>
                                            <TableCell>
                                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                                    <Select
                                                        value={attendance[s._id]?.status || 'Absent'}
                                                        onChange={e => handleStatusChange(s._id, e.target.value)}
                                                    >
                                                        {STATUSES.map(st => (
                                                            <MenuItem key={st} value={st}>
                                                                <Chip label={st} size="small" color={STATUS_COLORS[st]} sx={{ pointerEvents: 'none' }} />
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {displayStudents.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                {students.length === 0
                                                    ? '⚠️ No students found. Add students first.'
                                                    : 'No students match the selected course filter.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* ─── View Records ─── */}
            {tab === 1 && (
                <Box>
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth size="small" label="Date" type="date"
                                value={date} onChange={e => setDate(e.target.value)}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Course</InputLabel>
                                <Select value={course} label="Course" onChange={e => setCourse(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.courseName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchRecords} fullWidth>Refresh</Button>
                        </Grid>
                    </Grid>
                    {loading ? <LinearProgress /> : (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                                        <TableCell fontWeight={700}>Student</TableCell>
                                        <TableCell>Course</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Edit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {records.map(r => (
                                        <TableRow key={r._id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>{r.student?.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{r.student?.studentId}</Typography>
                                            </TableCell>
                                            <TableCell>{r.course?.courseName || '—'}</TableCell>
                                            <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                                            <TableCell><Chip label={r.status} size="small" color={STATUS_COLORS[r.status]} /></TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => { setEditDialog(r); setEditStatus(r.status); }}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {records.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                No attendance records for {date}. Mark attendance first in the "Mark Attendance" tab.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* ─── Attendance Report ─── */}
            {tab === 2 && (
                <Box>
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} sm={3}>
                            <TextField fullWidth size="small" label="Start Date *" type="date"
                                value={startDate} onChange={e => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField fullWidth size="small" label="End Date *" type="date"
                                value={endDate} onChange={e => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Course</InputLabel>
                                <Select value={course} label="Course" onChange={e => setCourse(e.target.value)}>
                                    <MenuItem value="">All Courses</MenuItem>
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.courseName}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button variant="contained" startIcon={<Assessment />} onClick={fetchReport} fullWidth disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Report'}
                            </Button>
                        </Grid>
                    </Grid>

                    {loading ? <LinearProgress /> : report.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>Student</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }}>ID</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Total Days</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Present</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Absent</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Late</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 700 }} align="center">Attendance %</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {report.map(r => (
                                        <TableRow key={r._id} hover>
                                            <TableCell><Typography fontWeight={600}>{r.name}</Typography></TableCell>
                                            <TableCell><Chip label={r.studentId} size="small" variant="outlined" /></TableCell>
                                            <TableCell align="center">{r.total}</TableCell>
                                            <TableCell align="center"><Chip label={r.present} size="small" color="success" variant="outlined" /></TableCell>
                                            <TableCell align="center"><Chip label={r.absent} size="small" color="error" variant="outlined" /></TableCell>
                                            <TableCell align="center"><Chip label={r.late} size="small" color="warning" variant="outlined" /></TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={r.percentage || 0}
                                                        color={r.percentage >= 75 ? 'success' : 'error'}
                                                        sx={{ flex: 1, height: 8, borderRadius: 4 }}
                                                    />
                                                    <Chip
                                                        label={`${(r.percentage || 0).toFixed(1)}%`}
                                                        size="small"
                                                        color={r.percentage >= 75 ? 'success' : 'error'}
                                                    />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f9fafb' }}>
                            <Assessment sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">Select a date range and click "Generate Report"</Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Make sure attendance has been marked first in the "Mark Attendance" tab
                            </Typography>
                        </Paper>
                    )}
                </Box>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editDialog} onClose={() => setEditDialog(null)}>
                <DialogTitle>Edit Attendance Record</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" mb={2} fontWeight={600}>
                        {editDialog?.student?.name} — {editDialog?.date ? new Date(editDialog.date).toLocaleDateString() : ''}
                    </Typography>
                    <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={editStatus} label="Status" onChange={e => setEditStatus(e.target.value)}>
                            {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
