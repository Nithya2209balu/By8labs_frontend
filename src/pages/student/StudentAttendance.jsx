import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, MenuItem, Grid, FormControl, InputLabel, Select,
    Tooltip, Alert, CircularProgress, Tabs, Tab, LinearProgress, Card, CardContent
} from '@mui/material';
import { Edit, Save, Assessment, Refresh } from '@mui/icons-material';
    attendanceAPI, adminStudentAPI, courseAPI, dashboardAPI
} from '../../services/studentPortalAPI';

const STATUS_COLORS = { Present: 'success', Absent: 'error', Late: 'warning', Leave: 'info', Holiday: 'default' };
const STATUSES = ['Present', 'Absent', 'Late', 'Leave', 'Holiday'];

export default function StudentAttendance() {
    const [students, setStudents] = useState([]);
    const [courses,  setCourses]  = useState([]);
    const [records,  setRecords]  = useState([]);
    const [report,   setReport]   = useState([]);
    const [tab,      setTab]      = useState(0);
    const [date,     setDate]     = useState(new Date().toISOString().slice(0, 10));
    const [course,   setCourse]   = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate,   setEndDate]   = useState('');
    const [attendance, setAttendance] = useState({});
    const [editDialog,  setEditDialog]  = useState(null);
    const [editStatus,  setEditStatus]  = useState('Present');
    const [loading,  setLoading]  = useState(false);
    const [saving,   setSaving]   = useState(false);
    const [success,  setSuccess]  = useState('');
    const [error,    setError]    = useState('');
    const [stats,    setStats]    = useState(null);

    // Load students and courses on mount
    useEffect(() => {
        const load = async () => {
            try {
                const [sRes, cRes, statRes] = await Promise.all([
                    adminStudentAPI.getAllStudents(),
                    courseAPI.getAllCourses(),
                    dashboardAPI.getAdminAttendanceStats().catch(() => ({ data: { data: null } }))
                ]);
                const studentList = sRes.data?.data || [];
                setStudents(studentList);
                setCourses(cRes.data?.data || cRes.data || []);
                setStats(statRes.data?.data || null);
                if (studentList.length === 0) {
                    setError('No students found. Please add students via the Student Management or Admission section first.');
                }
            } catch (err) {
                setError(`Failed to load students: ${err.response?.data?.message || err.message}. Make sure you are connected to the student portal.`);
            }
        };
        load();
    }, []);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // For "View Records" we need all records — iterate approved students and merge
            // Use the admin summary endpoint and filter by date client-side if needed
            const params = {};
            if (date)   params.date   = date;
            if (course) params.course = course;

            // Fetch records for each student for the given date then flatten
            const allRecords = [];
            for (const s of students) {
                try {
                    const res = await attendanceAPI.getAttendanceById(s._id, params);
                    const recs = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    recs.forEach(r => { r._studentMeta = s; });
                    allRecords.push(...recs);
                } catch { /* skip */ }
            }
            setRecords(allRecords);

            const map = {};
            allRecords.forEach(r => {
                const sid = r._studentMeta?._id || r.student?._id;
                if (sid) map[sid] = { status: r.status, id: r._id };
            });
            setAttendance(map);
        } catch (err) {
            setError(`Failed to load records: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    }, [date, course, students]);

    useEffect(() => {
        if ((tab === 0 || tab === 1) && students.length > 0) fetchRecords();
    }, [fetchRecords, tab, students]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
    };

    const handleSaveBulk = async () => {
        const filtered = displayStudents;
        if (filtered.length === 0) {
            setError('No students to mark attendance for.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            for (const s of filtered) {
                await attendanceAPI.markAttendanceById(s._id, {
                    date,
                    status: attendance[s._id]?.status || 'Absent',
                    courseId: course || undefined,
                });
            }
            setSuccess(`✅ Attendance saved for ${filtered.length} students on ${date}.`);
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
                // Use verifyEdit flow is available; fallback to basic update via markAttendanceById
                const sid = editDialog._studentMeta?._id || editDialog.student?._id;
                if (sid) {
                    await attendanceAPI.markAttendanceById(sid, {
                        date: editDialog.date?.slice(0, 10) || date,
                        status: editStatus,
                    });
                }
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
            // Build per-student summary over the range
            const summary = [];
            for (const s of students) {
                try {
                    const res = await attendanceAPI.getAttendanceSummaryById(s._id);
                    const d   = res.data?.data ?? res.data;
                    if (d) {
                        summary.push({
                            _id:        s._id,
                            name:       s.name,
                            studentId:  s.studentId,
                            total:      d.totalDays    ?? 0,
                            present:    d.presentCount ?? 0,
                            absent:     d.absentCount  ?? 0,
                            late:       0,
                            percentage: d.attendancePercentage ?? 0,
                        });
                    }
                } catch { /* skip */ }
            }
            setReport(summary);
            if (summary.length === 0) {
                setError('No attendance records found. Mark attendance first, then generate the report.');
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
                <Tooltip title="Reload students">
                    <IconButton onClick={() => window.location.reload()}><Refresh /></IconButton>
                </Tooltip>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2 }}>{error}</Alert>}

            {/* Attendance Overview Cards (5 Columns) */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs>
                    <Card sx={{ height: '100%', borderTop: '4px solid #9e9e9e' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box fontSize={32} mb={0.5}>📊</Box>
                            <Typography variant="h5" fontWeight={800}>{stats?.totalDays ?? 0}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>Total Days</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs>
                    <Card sx={{ height: '100%', borderTop: '4px solid #2e7d32' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box fontSize={32} mb={0.5}>✅</Box>
                            <Typography variant="h5" fontWeight={800} color="#2e7d32">{stats?.presentCount ?? 0}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>Present</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs>
                    <Card sx={{ height: '100%', borderTop: '4px solid #d32f2f' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box fontSize={32} mb={0.5}>❌</Box>
                            <Typography variant="h5" fontWeight={800} color="#d32f2f">{stats?.absentCount ?? 0}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>Absent</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs>
                    <Card sx={{ height: '100%', borderTop: '4px solid #ed6c02' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box fontSize={32} mb={0.5}>🏖️</Box>
                            <Typography variant="h5" fontWeight={800} color="#ed6c02">{stats?.holidayCount ?? 0}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>Holidays</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs>
                    <Card sx={{ height: '100%', borderTop: '4px solid #1976d2', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2, flexGrow: 1 }}>
                            <Box fontSize={32} mb={0.5}>📈</Box>
                            <Typography variant="h5" fontWeight={800} color="#1976d2">{stats?.attendancePercentage ?? 0}%</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1.5} mt={0.5}>Attendance %</Typography>
                            <LinearProgress variant="determinate" value={stats?.attendancePercentage ?? 0} sx={{ height: 6, borderRadius: 3 }} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

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
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.name || c.courseName}</MenuItem>)}
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
                                            <TableCell>{s.course?.courseName || s.courseName || '—'}</TableCell>
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
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.name || c.courseName}</MenuItem>)}
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
                                    {records.map((r, i) => (
                                        <TableRow key={r._id || i} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>{r._studentMeta?.name || r.student?.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{r._studentMeta?.studentId || r.student?.studentId}</Typography>
                                            </TableCell>
                                            <TableCell>{r.course?.courseName || r.course?.name || '—'}</TableCell>
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
                                                No attendance records for {date}. Mark attendance first.
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
                                    {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.name || c.courseName}</MenuItem>)}
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
                                        {['Student', 'ID', 'Total Days', 'Present', 'Absent', 'Late', 'Attendance %'].map(h => (
                                            <TableCell key={h} sx={{ color: 'white', fontWeight: 700 }}
                                                align={['Total Days','Present','Absent','Late','Attendance %'].includes(h) ? 'center' : 'left'}>
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {report.map(r => (
                                        <TableRow key={r._id} hover>
                                            <TableCell><Typography fontWeight={600}>{r.name}</Typography></TableCell>
                                            <TableCell><Chip label={r.studentId} size="small" variant="outlined" /></TableCell>
                                            <TableCell align="center">{r.total}</TableCell>
                                            <TableCell align="center"><Chip label={r.present} size="small" color="success" variant="outlined" /></TableCell>
                                            <TableCell align="center"><Chip label={r.absent}  size="small" color="error"   variant="outlined" /></TableCell>
                                            <TableCell align="center"><Chip label={r.late}    size="small" color="warning" variant="outlined" /></TableCell>
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
                        {editDialog?._studentMeta?.name || editDialog?.student?.name} — {editDialog?.date ? new Date(editDialog.date).toLocaleDateString() : ''}
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
