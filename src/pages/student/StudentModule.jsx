import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Grid, Typography, Paper, CircularProgress, Alert, Avatar,
    Chip, IconButton, Button, TextField, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Divider,
    List as MuiList, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Tooltip, Card, CardContent, InputAdornment, MenuItem,
    Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress
} from '@mui/material';
import {
    Dashboard, PeopleOutlined, MenuBook, EventAvailable, EmojiEvents,
    CheckCircle, Cancel, ThumbUp, ThumbDown, Notifications,
    Search, Assessment, NotificationsActive, LinkOff, Lock, Refresh,
    FilterList, Visibility, HowToReg, PersonSearch, History, DataUsage, EventNote,
    Assignment
} from '@mui/icons-material';
import StudentLeaveManagementPanel from './StudentLeaveManagementPanel';
import {
    dashboardAPI, adminStudentAPI, courseAPI, attendanceAPI,
    leaderboardAPI, notificationAPI, enrollmentAPI, taskAPI,
    portalAuthAPI, getStudentPortalToken, setStudentPortalToken, clearStudentPortalToken,
    STUDENT_API_URL
} from '../../services/studentPortalAPI';

// ─── Sub-module definitions ────────────────────────────────────────────────
const MODULES = [
    { id: 'dashboard',      label: 'Dashboard',             icon: <Dashboard /> },
    { id: 'students',       label: 'Users',                 icon: <PeopleOutlined /> },
    { id: 'studentList',    label: 'Student List',          icon: <HowToReg /> },
    { id: 'courses',        label: 'Courses',               icon: <MenuBook /> },
    { id: 'attendance',     label: 'Attendance',            icon: <EventAvailable /> },
    { id: 'leaderboard',    label: 'Leaderboard',           icon: <EmojiEvents /> },
    { id: 'notifications',  label: 'Notifications',         icon: <NotificationsActive /> },
    { id: 'enrollments',    label: 'Enrollments',           icon: <Assessment /> },
    { id: 'leave',          label: 'Leave Management',      icon: <EventNote /> },
    { id: 'tasks',          label: 'Tasks',                 icon: <Assignment /> },
];

// ─── Stat card helper ──────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <Box sx={{ color, fontSize: 40, mb: 1 }}>{icon}</Box>
                <Typography variant="h3" fontWeight="bold" color={color}>{value ?? '—'}</Typography>
                <Typography variant="subtitle2" color="text.secondary" textAlign="center">{label}</Typography>
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Panel: Dashboard
// ═══════════════════════════════════════════════════════════════════════════
function DashboardPanel({ refreshTrigger }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        dashboardAPI.getOverallAdminStats()
            .then(res => setStats(res.data.data))
            .catch(err => {
                console.error(err);
                setError('Failed to load overall dashboard. Please ensure you are connected to the Student Portal.');
            })
            .finally(() => setLoading(false));
    }, [refreshTrigger]);

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>;

    const sections = [
        {
            title: 'Users & Students',
            color: '#1976d2',
            items: [
                { label: 'Total Students', value: stats?.users?.totalStudents, icon: <PeopleOutlined /> },
                { label: 'Pending Approvals', value: stats?.users?.pendingApprovals, icon: <HowToReg />, color: '#ed6c02' },
            ]
        },
        {
            title: 'Academic Overview',
            color: '#2e7d32',
            items: [
                { label: 'Total Courses', value: stats?.courses?.total, icon: <MenuBook /> },
                { label: 'Total Tasks', value: stats?.tasks?.total, icon: <Assignment /> },
            ]
        },
        {
            title: 'Attendance Summary',
            color: '#0288d1',
            items: [
                { label: 'Total Records', value: stats?.attendance?.totalRecords, icon: <EventAvailable /> },
                { label: 'Avg Attendance %', value: stats?.attendance?.averagePercentage ? `${stats.attendance.averagePercentage}%` : '—', icon: <Assessment /> },
            ]
        },
        {
            title: 'Leave Requests',
            color: '#7b1fa2',
            items: [
                { label: 'Total Leaves', value: stats?.leave?.total, icon: <EventNote /> },
                { label: 'Pending', value: stats?.leave?.pending, icon: <History />, color: '#ed6c02' },
                { label: 'Approved', value: stats?.leave?.approved, icon: <CheckCircle />, color: '#2e7d32' },
            ]
        }
    ];

    return (
        <Box>
            <Typography variant="h5" fontWeight={800} mb={4} sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Dashboard /> Overall Admin Dashboard
            </Typography>
            
            <Grid container spacing={4}>
                {sections.map((sec, idx) => (
                    <Grid item xs={12} key={idx}>
                        <Box mb={2} display="flex" alignItems="center" gap={1.5}>
                            <Box sx={{ width: 4, height: 20, bgcolor: sec.color, borderRadius: 2 }} />
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.75rem' }}>
                                {sec.title}
                            </Typography>
                        </Box>
                        <Grid container spacing={2}>
                            {sec.items.map((item, i) => (
                                <Grid item xs={12} sm={6} md={sec.items.length === 3 ? 4 : 3} key={i}>
                                    <Card sx={{ 
                                        borderRadius: 2, 
                                        boxShadow: 'none',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        height: '100%',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': { 
                                            boxShadow: `0 4px 20px ${sec.color}15`, 
                                            borderColor: sec.color,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}>
                                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, '&:last-child': { pb: 2 } }}>
                                            <Box sx={{ 
                                                p: 1.2, 
                                                borderRadius: 2, 
                                                bgcolor: `${item.color || sec.color}10`, 
                                                color: item.color || sec.color, 
                                                display: 'flex',
                                                fontSize: 24 
                                            }}>
                                                {item.icon}
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight={800} sx={{ color: item.color || 'text.primary', lineHeight: 1.1, mb: 0.2 }}>
                                                    {item.value ?? 0}
                                                </Typography>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                                                    {item.label}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Panel: Student Management (Admin)
// ═══════════════════════════════════════════════════════════════════════════
function UsersPanel() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');
    const [search, setSearch]     = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, approved, pending

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminStudentAPI.getAllStudents();
            setStudents(res.data.data || []);
        } catch { setError('Failed to load users.'); }
        finally  { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const handleApprove = async (id) => {
        try { setSaving(true); await adminStudentAPI.approveStudent(id); setSuccess('User approved!'); fetch(); }
        catch { setError('Failed to approve user.'); }
        finally { setSaving(false); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject and delete this user account?')) return;
        try { setSaving(true); await adminStudentAPI.rejectStudent(id); setSuccess('User rejected.'); fetch(); }
        catch { setError('Failed to reject user.'); }
        finally { setSaving(false); }
    };

    const filtered = students.filter(s => {
        const matchesSearch = !search || 
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase()) ||
            s.studentId?.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'approved' && s.isApproved) ||
            (filterStatus === 'pending' && !s.isApproved);
        
        return matchesSearch && matchesStatus;
    });

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>User Management</Typography>
                <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetch} disabled={loading || saving}>Refresh</Button>
            </Box>
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2 }}>{error}</Alert>}

            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                <TextField
                    size="small" placeholder="Search by name / email / ID…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    sx={{ flexGrow: 1, maxWidth: 400 }}
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
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                </TextField>
            </Box>

            {loading ? <CircularProgress /> : (
                <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><b>User</b></TableCell>
                                <TableCell><b>Student ID</b></TableCell>
                                <TableCell><b>Email</b></TableCell>
                                <TableCell><b>Registered</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                                <TableCell align="right"><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.length === 0
                                ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No users found.</TableCell></TableRow>
                                : filtered.map(s => (
                                    <TableRow key={s._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                                                    {s.name?.[0] || 'U'}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>{s.name || s.username}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography variant="body2" color="primary" fontWeight={700}>{s.studentId || '—'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{s.email || '—'}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</Typography></TableCell>
                                        <TableCell>
                                            <Chip
                                                label={s.isApproved ? 'Approved' : 'Pending'}
                                                color={s.isApproved ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {!s.isApproved ? (
                                                <>
                                                    <Tooltip title="Approve">
                                                        <IconButton size="small" color="success" disabled={saving} onClick={() => handleApprove(s._id)}><ThumbUp fontSize="small" /></IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject">
                                                        <IconButton size="small" color="error"   disabled={saving} onClick={() => handleReject(s._id)}><ThumbDown fontSize="small" /></IconButton>
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <Chip label="Verified" size="small" color="info" variant="outlined" icon={<CheckCircle fontSize="small" />} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Panel: Attendance Control — Full 5-Feature Module
// ═══════════════════════════════════════════════════════════════════════════
const ATT_STATUS_COLORS = { Present: 'success', Absent: 'error', Holiday: 'warning', Late: 'info', Leave: 'default' };
const ATT_STATUSES = ['Present', 'Absent', 'Holiday'];
const todayStr = () => new Date().toISOString().slice(0, 10);

// ── Stat Card helper ──────────────────────────────────────────────────────
function AttStatCard({ label, value, icon, color }) {
    return (
        <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                <Box sx={{ color, fontSize: 32, mb: 0.5 }}>{icon}</Box>
                <Typography variant="h4" fontWeight={800} sx={{ color }}>{value ?? '—'}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>{label}</Typography>
            </CardContent>
        </Card>
    );
}

function AttendanceControlPanel({ onRefresh }) {
    const [attTab, setAttTab] = useState(0);
    const [students, setStudents] = useState([]);
    const [courses, setCourses]   = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);

    // Tab 0 — Mark
    const [markUserId,   setMarkUserId]   = useState('');
    const [markStatus,   setMarkStatus]   = useState('Present');
    const [markCourseId, setMarkCourseId] = useState('');
    const [markRemarks,  setMarkRemarks]  = useState('');
    const [marking,      setMarking]      = useState(false);

    // Tab 1 — Edit (OTP)
    const [editUserId,   setEditUserId]   = useState('');
    const [editDate,     setEditDate]     = useState(todayStr());
    const [otpSent,      setOtpSent]      = useState(false);
    const [otp,          setOtp]          = useState('');
    const [newStatus,    setNewStatus]    = useState('Present');
    const [newRemarks,   setNewRemarks]   = useState('');
    const [otpLoading,   setOtpLoading]   = useState(false);

    // Tab 2 — List
    const [listUserId,   setListUserId]   = useState('');
    const [filterDate,   setFilterDate]   = useState('');
    const [startDate,    setStartDate]    = useState('');
    const [endDate,      setEndDate]      = useState('');
    const [records,      setRecords]      = useState([]);
    const [listLoading,  setListLoading]  = useState(false);
    const [listSearched, setListSearched] = useState(false);

    // Tab 3 — Summary
    const [sumUserId,  setSumUserId]  = useState('');
    const [summary,    setSummary]    = useState(null);
    const [sumLoading, setSumLoading] = useState(false);

    // Tab 4 — Admin
    const [adminData,    setAdminData]    = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminSearch,  setAdminSearch]  = useState('');

    // Shared feedback
    const [success, setSuccess] = useState('');
    const [error,   setError]   = useState('');
    const showSuccess = (msg) => { setSuccess(msg); setError(''); };
    const showError   = (msg) => { setError(msg);   setSuccess(''); };

    // Dashboard Cards Data
    const [adminStats, setAdminStats] = useState(null);

    // Load students and courses on mount
    useEffect(() => {
        adminStudentAPI.getAllStudents()
            .then(res => setStudents((res.data?.data || []).filter(s => s.isApproved)))
            .catch(() => showError('Failed to load students.'))
            .finally(() => setLoadingStudents(false));

        courseAPI.getAllCourses()
            .then(res => setCourses(res.data?.data || res.data || []))
            .catch(err => console.error('Failed to load courses for attendance dropdown.', err));

        dashboardAPI.getAdminAttendanceStats()
            .then(res => setAdminStats(res.data?.data || null))
            .catch(err => console.error(err));
    }, []);

    // Load admin summary when tab 4 activated
    useEffect(() => {
        if (attTab !== 4) return;
        setAdminLoading(true);
        attendanceAPI.getOverallSummary()
            .then(res => setAdminData(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
            .catch(() => showError('Failed to load summary.'))
            .finally(() => setAdminLoading(false));
    }, [attTab]);

    // ── Tab 0: Mark ────────────────────────────────────────────────────────
    const handleMark = async () => {
        if (!markUserId) { showError('Please select a student.'); return; }
        setMarking(true); setError(''); setSuccess('');
        try {
            await attendanceAPI.markAttendanceById(markUserId, {
                date: todayStr(), status: markStatus,
                remarks: markRemarks, courseId: markCourseId || undefined,
            });
            showSuccess(`✅ Marked ${markStatus} for ${students.find(s => s._id === markUserId)?.name}.`);
            setMarkRemarks('');
            onRefresh?.();
        } catch (err) {
            showError(err.response?.data?.message || err.message);
        } finally { setMarking(false); }
    };

    // ── Tab 1: Request Edit ─────────────────────────────────────────────
    const handleRequestEdit = async () => {
        if (!editUserId || !editDate) { showError('Select student and date.'); return; }
        setOtpLoading(true); setError(''); setSuccess('');
        try {
            await attendanceAPI.requestEdit(editUserId, { date: editDate });
            setOtpSent(true);
            showSuccess('✅ OTP sent to HR email. Enter it below.');
        } catch (err) {
            showError(err.response?.data?.message || err.message);
        } finally { setOtpLoading(false); }
    };

    const handleVerifyEdit = async () => {
        if (!otp || !newStatus) { showError('Enter OTP and new status.'); return; }
        setOtpLoading(true); setError('');
        try {
            await attendanceAPI.verifyEdit(editUserId, { otp, date: editDate, status: newStatus, remarks: newRemarks });
            showSuccess('✅ Attendance updated successfully!');
            setOtpSent(false); setOtp('');
            onRefresh?.();
        } catch (err) {
            showError(err.response?.data?.message || err.message);
        } finally { setOtpLoading(false); }
    };

    // ── Tab 2: List ────────────────────────────────────────────────────
    const handleFilter = async () => {
        if (!listUserId) { showError('Select a student.'); return; }
        setListLoading(true); setError('');
        try {
            const params = {};
            if (filterDate) params.date = filterDate;
            else if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
            const res = await attendanceAPI.getAttendanceById(listUserId, params);
            setRecords(Array.isArray(res.data) ? res.data : (res.data?.data || []));
            setListSearched(true);
        } catch (err) {
            showError(err.response?.data?.message || err.message);
        } finally { setListLoading(false); }
    };

    // ── Tab 3: Summary ─────────────────────────────────────────────────
    const handleSummary = async () => {
        if (!sumUserId) { showError('Select a student.'); return; }
        setSumLoading(true); setError(''); setSummary(null);
        try {
            const res = await attendanceAPI.getAttendanceSummaryById(sumUserId);
            setSummary(res.data?.data ?? res.data);
        } catch (err) {
            showError(err.response?.data?.message || err.message);
        } finally { setSumLoading(false); }
    };

    const pct = summary?.attendancePercentage ?? 0;

    const adminFiltered = adminData.filter(r =>
        !adminSearch || JSON.stringify(r).toLowerCase().includes(adminSearch.toLowerCase())
    );
    const adminTotals = adminData.reduce((a, r) => ({
        total: a.total + (r.totalDays ?? 0), present: a.present + (r.presentCount ?? 0),
        absent: a.absent + (r.absentCount ?? 0), holiday: a.holiday + (r.holidayCount ?? 0),
    }), { total: 0, present: 0, absent: 0, holiday: 0 });

    if (loadingStudents) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>Attendance Module</Typography>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2 }}>{error}</Alert>}

            {/* Attendance Overview Cards (5 Columns) */}
            <Grid container spacing={2} mb={4}>
                <Grid item xs={12} sm={4} md>
                    <Card sx={{ height: '100%', borderTop: '4px solid #9e9e9e' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box fontSize={32} mb={0.5}>📊</Box>
                            <Typography variant="h5" fontWeight={800}>{adminStats?.totalDays ?? 0}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>Total Days</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4} md>
                    <Card sx={{ height: '100%', borderTop: '4px solid #2e7d32' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box fontSize={32} mb={0.5}>✅</Box>
                            <Typography variant="h5" fontWeight={800} color="#2e7d32">{adminStats?.presentCount ?? 0}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>Present</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4} md>
                    <Card sx={{ height: '100%', borderTop: '4px solid #d32f2f' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box fontSize={32} mb={0.5}>❌</Box>
                            <Typography variant="h5" fontWeight={800} color="#d32f2f">{adminStats?.absentCount ?? 0}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>Absent</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md>
                    <Card sx={{ height: '100%', borderTop: '4px solid #ed6c02' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box fontSize={32} mb={0.5}>🏖️</Box>
                            <Typography variant="h5" fontWeight={800} color="#ed6c02">{adminStats?.holidayCount ?? 0}</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mt={0.5}>Holidays</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md>
                    <Card sx={{ height: '100%', borderTop: '4px solid #1976d2', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ textAlign: 'center', p: 2, flexGrow: 1 }}>
                            <Box fontSize={32} mb={0.5}>📈</Box>
                            <Typography variant="h5" fontWeight={800} color="#1976d2">{adminStats?.attendancePercentage ?? 0}%</Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1.5} mt={0.5}>Attendance %</Typography>
                            <LinearProgress variant="determinate" value={adminStats?.attendancePercentage ?? 0} sx={{ height: 6, borderRadius: 3 }} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Tab Bar ── */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {['📋 Mark', '✏️ Edit (OTP)', '📅 List', '📊 Summary', '👥 Admin'].map((label, i) => (
                    <Button key={i} size="small"
                        variant={attTab === i ? 'contained' : 'outlined'}
                        onClick={() => { setAttTab(i); setError(''); setSuccess(''); }}
                        sx={{ fontWeight: 600, textTransform: 'none' }}>
                        {label}
                    </Button>
                ))}
            </Box>

            {/* ════ Tab 0 — Mark Attendance ════ */}
            {attTab === 0 && (
                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField select fullWidth size="small" label="👤 Select Student"
                                value={markUserId} onChange={e => setMarkUserId(e.target.value)}>
                                {students.map(s => (
                                    <MenuItem key={s._id} value={s._id}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: 'primary.main' }}>{s.name?.[0]}</Avatar>
                                            {s.name} &nbsp;<Chip label={s.studentId} size="small" variant="outlined" />
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label="📅 Date" type="date"
                                value={todayStr()} disabled InputLabelProps={{ shrink: true }}
                                helperText="Today only — auto-filled" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth size="small" label="📊 Status"
                                value={markStatus} onChange={e => setMarkStatus(e.target.value)}>
                                {ATT_STATUSES.map(s => (
                                    <MenuItem key={s} value={s}>
                                        <Chip label={s} size="small" color={ATT_STATUS_COLORS[s]} sx={{ pointerEvents: 'none' }} />
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select fullWidth size="small" label="📚 Course (Optional)"
                                value={markCourseId} onChange={e => setMarkCourseId(e.target.value)}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {courses.map(c => (
                                    <MenuItem key={c._id} value={c._id}>{c.name || c.courseName}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label="📝 Remarks (Optional)"
                                value={markRemarks} onChange={e => setMarkRemarks(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" fullWidth size="large"
                                startIcon={marking ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                                onClick={handleMark} disabled={marking || !markUserId}
                                sx={{ fontWeight: 700 }}>
                                {marking ? 'Saving...' : '✅ Submit Attendance'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* ════ Tab 1 — Edit (OTP) ════ */}
            {attTab === 1 && (
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mb={2}>Step A — Request Edit</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField select fullWidth size="small" label="👤 Student"
                                value={editUserId}
                                onChange={e => { setEditUserId(e.target.value); setOtpSent(false); setOtp(''); }}>
                                {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name} — {s.studentId}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" label="📅 Date" type="date"
                                value={editDate}
                                onChange={e => { setEditDate(e.target.value); setOtpSent(false); }}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button fullWidth variant="outlined" size="large"
                                startIcon={otpLoading && !otpSent ? <CircularProgress size={16} /> : <Notifications />}
                                onClick={handleRequestEdit} disabled={otpLoading || !editUserId}
                                sx={{ fontWeight: 700, height: '100%' }}>
                                🔘 Request Edit (Send OTP)
                            </Button>
                        </Grid>
                    </Grid>

                    {otpSent && (
                        <>
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mb={2}>Step B — Verify OTP &amp; Update</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField fullWidth size="small" label="🔐 Enter OTP"
                                        value={otp} onChange={e => setOtp(e.target.value)}
                                        inputProps={{ maxLength: 6, style: { letterSpacing: '8px', fontWeight: 700, fontSize: '1.2rem' } }}
                                        placeholder="______" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField select fullWidth size="small" label="📊 New Status"
                                        value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                        {ATT_STATUSES.map(s => (
                                            <MenuItem key={s} value={s}>
                                                <Chip label={s} size="small" color={ATT_STATUS_COLORS[s]} sx={{ pointerEvents: 'none' }} />
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth size="small" label="📝 Remarks"
                                        value={newRemarks} onChange={e => setNewRemarks(e.target.value)} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" color="success" fullWidth size="large"
                                        startIcon={otpLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                                        onClick={handleVerifyEdit} disabled={otpLoading || !otp}
                                        sx={{ fontWeight: 700 }}>
                                        ✅ Update Attendance
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Box>
            )}

            {/* ════ Tab 2 — Attendance List ════ */}
            {attTab === 2 && (
                <Box>
                    <Grid container spacing={2} alignItems="flex-end" mb={2}>
                        <Grid item xs={12} sm={3}>
                            <TextField select fullWidth size="small" label="👤 Student"
                                value={listUserId} onChange={e => setListUserId(e.target.value)}>
                                {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name} ({s.studentId})</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField fullWidth size="small" label="📅 Date" type="date"
                                value={filterDate}
                                onChange={e => { setFilterDate(e.target.value); setStartDate(''); setEndDate(''); }}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField fullWidth size="small" label="Start Date" type="date"
                                value={startDate}
                                onChange={e => { setStartDate(e.target.value); setFilterDate(''); }}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField fullWidth size="small" label="End Date" type="date"
                                value={endDate}
                                onChange={e => { setEndDate(e.target.value); setFilterDate(''); }}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button variant="contained" fullWidth startIcon={<Search />}
                                onClick={handleFilter} disabled={listLoading || !listUserId}
                                sx={{ fontWeight: 700 }}>
                                🔍 Filter
                            </Button>
                        </Grid>
                    </Grid>
                    {listLoading ? <CircularProgress /> : listSearched && (
                        <TableContainer component={Paper} elevation={1}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        {['Date', 'Status', 'Remarks', 'Action'].map(h => (
                                            <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}
                                                align={h === 'Action' ? 'center' : 'left'}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {records.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No records found.</TableCell></TableRow>
                                    ) : records.map((r, i) => (
                                        <TableRow key={r._id || i} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell><Chip label={r.status} size="small" color={ATT_STATUS_COLORS[r.status] || 'default'} /></TableCell>
                                            <TableCell><Typography variant="body2" color="text.secondary">{r.notes || r.remarks || '—'}</Typography></TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Edit via OTP">
                                                    <IconButton size="small" color="primary"
                                                        onClick={() => { setEditUserId(listUserId); setEditDate(r.date?.slice(0, 10) || todayStr()); setOtpSent(false); setOtp(''); setAttTab(1); }}>
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* ════ Tab 3 — Summary ════ */}
            {attTab === 3 && (
                <Box>
                    <Box display="flex" gap={2} mb={3} alignItems="flex-end" flexWrap="wrap">
                        <TextField select size="small" label="👤 Student" value={sumUserId}
                            onChange={e => setSumUserId(e.target.value)} sx={{ minWidth: 220 }}>
                            {students.map(s => <MenuItem key={s._id} value={s._id}>{s.name} ({s.studentId})</MenuItem>)}
                        </TextField>
                        <Button variant="contained" startIcon={sumLoading ? <CircularProgress size={16} color="inherit" /> : <Assessment />}
                            onClick={handleSummary} disabled={sumLoading || !sumUserId} sx={{ fontWeight: 700 }}>
                            View Summary
                        </Button>
                    </Box>
                    {sumLoading && <CircularProgress />}
                    {summary && (
                        <>
                            <Grid container spacing={2} mb={2}>
                                <Grid item xs={6} sm={4} md={2.4}>
                                    <AttStatCard label="Total Days"  value={summary.totalDays}    icon={<EventAvailable />}   color="#1976d2" />
                                </Grid>
                                <Grid item xs={6} sm={4} md={2.4}>
                                    <AttStatCard label="Present"     value={summary.presentCount} icon={<CheckCircle />}     color="#2e7d32" />
                                </Grid>
                                <Grid item xs={6} sm={4} md={2.4}>
                                    <AttStatCard label="Absent"      value={summary.absentCount}  icon={<Cancel />}          color="#d32f2f" />
                                </Grid>
                                <Grid item xs={6} sm={4} md={2.4}>
                                    <AttStatCard label="Holiday"     value={summary.holidayCount} icon={<EmojiEvents />}     color="#ed6c02" />
                                </Grid>
                                <Grid item xs={6} sm={4} md={2.4}>
                                    <AttStatCard label="Attendance %" value={`${pct.toFixed(1)}%`} icon={<Assessment />}    color={pct >= 75 ? '#2e7d32' : '#d32f2f'} />
                                </Grid>
                            </Grid>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="body2" fontWeight={600} mb={1}>Attendance Progress</Typography>
                                <Box sx={{ bgcolor: 'grey.200', borderRadius: 6, overflow: 'hidden', height: 12 }}>
                                    <Box sx={{ width: `${Math.min(pct, 100)}%`, height: '100%', bgcolor: pct >= 75 ? 'success.main' : 'error.main', transition: 'width 0.5s' }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                                    {pct.toFixed(1)}% — {summary.presentCount} present out of {summary.totalDays} days
                                </Typography>
                            </Paper>
                        </>
                    )}
                </Box>
            )}

            {/* ════ Tab 4 — Admin Dashboard ════ */}
            {attTab === 4 && (
                <Box>
                    {adminData.length > 0 && (
                        <Grid container spacing={2} mb={3}>
                            <Grid item xs={6} sm={3}><AttStatCard label="Total Records" value={adminTotals.total}   icon={<EventAvailable />} color="#1976d2" /></Grid>
                            <Grid item xs={6} sm={3}><AttStatCard label="Total Present" value={adminTotals.present} icon={<CheckCircle />}   color="#2e7d32" /></Grid>
                            <Grid item xs={6} sm={3}><AttStatCard label="Total Absent"  value={adminTotals.absent}  icon={<Cancel />}        color="#d32f2f" /></Grid>
                            <Grid item xs={6} sm={3}><AttStatCard label="Total Holiday" value={adminTotals.holiday} icon={<EmojiEvents />}   color="#ed6c02" /></Grid>
                        </Grid>
                    )}
                    <TextField size="small" placeholder="Search…" value={adminSearch}
                        onChange={e => setAdminSearch(e.target.value)} sx={{ mb: 2, maxWidth: 280 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
                    {adminLoading ? <CircularProgress /> : (
                        <TableContainer component={Paper} elevation={1}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        {['Student', 'Total', 'Present', 'Absent', 'Holiday', 'Attendance %'].map(h => (
                                            <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}
                                                align={h === 'Student' ? 'left' : 'center'}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {adminFiltered.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                            {adminData.length === 0 ? 'No data yet. Mark attendance first.' : 'No results.'}
                                        </TableCell></TableRow>
                                    ) : adminFiltered.map((r, i) => {
                                        const p = r.attendancePercentage ?? 0;
                                        return (
                                            <TableRow key={r.userId || i} hover>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar sx={{ width: 26, height: 26, bgcolor: 'primary.main', fontSize: '0.7rem' }}>
                                                            {(r.name || 'U')[0].toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{r.name || '—'}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{r.studentId || r.userId?.slice(0, 10)}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">{r.totalDays ?? 0}</TableCell>
                                                <TableCell align="center"><Chip label={r.presentCount ?? 0} size="small" color="success" variant="outlined" /></TableCell>
                                                <TableCell align="center"><Chip label={r.absentCount  ?? 0} size="small" color="error"   variant="outlined" /></TableCell>
                                                <TableCell align="center"><Chip label={r.holidayCount ?? 0} size="small" color="warning" variant="outlined" /></TableCell>
                                                <TableCell align="center">
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Box sx={{ flex: 1, bgcolor: 'grey.200', borderRadius: 4, overflow: 'hidden', height: 8 }}>
                                                            <Box sx={{ width: `${Math.min(p, 100)}%`, height: '100%', bgcolor: p >= 75 ? 'success.main' : 'error.main' }} />
                                                        </Box>
                                                        <Chip label={`${p.toFixed(1)}%`} size="small" color={p >= 75 ? 'success' : 'error'} />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}
        </Box>
    );
}


// ═══════════════════════════════════════════════════════════════════════════
// Panel: Student List (View Only Approved Students)
// ═══════════════════════════════════════════════════════════════════════════
function StudentListModule() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminStudentAPI.getAllStudents();
            setStudents((res.data.data || []).filter(s => s.isApproved));
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const filtered = students.filter(s =>
        !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>Student List</Typography>
                <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetch} disabled={loading}>Refresh</Button>
            </Box>
            <TextField
                size="small" placeholder="Search..."
                value={search} onChange={e => setSearch(e.target.value)}
                sx={{ mb: 2, maxWidth: 320 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />
            {loading ? <CircularProgress /> : (
                <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Name</b></TableCell>
                                <TableCell><b>Email</b></TableCell>
                                <TableCell><b>Course</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.length === 0
                                ? <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No approved students found.</TableCell></TableRow>
                                : filtered.map(s => (
                                    <TableRow key={s._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem' }}>{s.name?.[0]}</Avatar>
                                                <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell><Typography variant="body2">{s.email}</Typography></TableCell>
                                        <TableCell><Typography variant="body2">{s.courseName || s.course?.name || '—'}</Typography></TableCell>
                                        <TableCell><Chip label="Approved" size="small" color="success" variant="outlined" /></TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Panel: Courses (catalog list for admin overview)
// ═══════════════════════════════════════════════════════════════════════════
function CoursesPanel() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');

    const [catOpen, setCatOpen] = useState(false);
    const [catData, setCatData] = useState({ name: '', categoryId: '', description: '', imageUrl: '', fees: '', duration: '' });
    const [catFile, setCatFile] = useState(null);
    const [catSaving, setCatSaving] = useState(false);
    const [catNames, setCatNames] = useState([]);

    const fetchCourses = () => {
        setLoading(true);
        courseAPI.getAllCourses()
            .then(r => setCourses(r.data.data || []))
            .catch(() => setError('Failed to load courses.'))
            .finally(() => setLoading(false));
    };

    const fetchCatNames = () => {
        courseAPI.getCategoryNames()
            .then(r => setCatNames(r.data.data || []))
            .catch(() => console.error('Failed to fetch category names'));
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const cleanUrl = url.replace(/\\/g, '/').replace(/^\//, '');
        const baseUrl = STUDENT_API_URL.endsWith('/api') ? STUDENT_API_URL.slice(0, -4) : STUDENT_API_URL;
        return `${baseUrl}/${cleanUrl}`;
    };

    const categoryNameMap = {
        '1001': 'AI',
        '1002': 'Web Development'
    };

    useEffect(() => {
        fetchCourses();
        fetchCatNames();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            setCatSaving(true);
            setError('');

            let finalImageUrl = catData.imageUrl || '';

            // 1. Upload to Cloudinary if a file is selected
            if (catFile) {
                const cloudFormData = new FormData();
                cloudFormData.append('file', catFile);
                // The upload preset must be created in Cloudinary settings (Settings -> Upload -> Add Upload Preset)
                // Ensure it is set to "Unsigned" mode.
                cloudFormData.append('upload_preset', 'zdxqbgct'); // Common default, or 'student_portal_preset'
                cloudFormData.append('cloud_name', 'druuaiprp');

                const cloudRes = await fetch('https://api.cloudinary.com/v1_1/druuaiprp/image/upload', {
                    method: 'POST',
                    body: cloudFormData
                });
                
                const cloudData = await cloudRes.json();
                
                if (cloudData.error) {
                    throw new Error(`Cloudinary Error: ${cloudData.error.message}. Please ensure you have an unsigned upload preset named 'ml_default' in Cloudinary!`);
                }
                
                finalImageUrl = cloudData.secure_url;
            }

            // 2. Send JSON payload to Backend
            await courseAPI.addCategory({
                name: catData.name,
                description: catData.description,
                imageUrl: finalImageUrl,
                fees: catData.fees,
                duration: catData.duration,
                categoryId: catData.categoryId,
            });

            setSuccess('Course added successfully!');
            setCatOpen(false);
            setCatData({ name: '', categoryId: '', description: '', imageUrl: '', fees: '', duration: '' });
            setCatFile(null);
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to add course');
        } finally {
            setCatSaving(false);
        }
    };

    if (loading && courses.length === 0) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>All Courses</Typography>
                <Box>
                    <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchCourses} disabled={loading} sx={{ mr: 1 }}>Refresh</Button>
                    <Button variant="contained" size="small" onClick={() => setCatOpen(true)}>Add Course</Button>
                </Box>
            </Box>

            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2 }}>{error}</Alert>}

            {courses.length === 0
                ? <Typography color="text.secondary">No courses available.</Typography>
                : (
                    <Grid container spacing={2}>
                        {courses.map(c => (
                            <Grid item xs={12} sm={6} md={4} key={c._id}>
                                <Card>
                                    <Box sx={{ height: 140, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {c.imageUrl ? (
                                            <Box 
                                                component="img" 
                                                src={getImageUrl(c.imageUrl)} 
                                                alt={c.name} 
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = 'https://via.placeholder.com/300x140.png?text=Image+Not+Found';
                                                }}
                                            />
                                        ) : (
                                            <MenuBook sx={{ fontSize: 40, color: 'text.disabled' }} />
                                        )}
                                    </Box>
                                    <CardContent>
                                        <Chip label={categoryNameMap[c.categoryId] || c.categoryId || c.category || 'Category'} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
                                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>{c.name || c.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {c.description || 'No description.'}
                                        </Typography>
                                        <Box display="flex" justifyContent="space-between" mt={2}>
                                            <Typography variant="caption" color="text.secondary">{c.status || 'Active'}</Typography>
                                            <Typography variant="caption" fontWeight={700} color="primary.main">
                                                {c.fees || c.price ? `₹${c.fees || c.price}` : 'Free'}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )
            }

            {/* Add Course Dialog */}
            <Dialog open={catOpen} onClose={() => setCatOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Course</DialogTitle>
                <form onSubmit={handleAddCategory}>
                    <DialogContent dividers>
                        <TextField
                            label="Course Name" fullWidth size="small" required sx={{ mb: 2 }}
                            value={catData.name} onChange={e => setCatData({ ...catData, name: e.target.value })}
                        />
                        <TextField
                            select
                            label="Category" fullWidth size="small" required sx={{ mb: 2 }}
                            value={catData.categoryId} onChange={e => setCatData({ ...catData, categoryId: e.target.value })}
                        >
                            {catNames.map((name) => (
                                <MenuItem key={name} value={name === 'AI' ? '1001' : (name === 'Web Development' ? '1002' : name)}>
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Description" fullWidth size="small" multiline rows={3} sx={{ mb: 2 }}
                            value={catData.description} onChange={e => setCatData({ ...catData, description: e.target.value })}
                        />
                        <Box sx={{ mb: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Course Image (Choose File OR paste Image URL)
                            </Typography>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setCatFile(e.target.files[0])}
                                style={{ width: '100%', marginBottom: '10px' }}
                            />
                            <Typography variant="caption" display="block" align="center" sx={{ my: 1 }}>OR</Typography>
                            <TextField
                                label="Image URL" fullWidth size="small"
                                placeholder="https://example.com/image.jpg"
                                value={catData.imageUrl} onChange={e => setCatData({ ...catData, imageUrl: e.target.value })}
                            />
                        </Box>
                        <TextField
                            label="Fees" type="number" fullWidth size="small"
                            value={catData.fees} onChange={e => setCatData({ ...catData, fees: e.target.value })}
                        />
                        <TextField
                            label="Duration (Months)" type="number" fullWidth size="small" sx={{ mt: 2 }}
                            value={catData.duration} onChange={e => setCatData({ ...catData, duration: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCatOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={catSaving}>
                            {catSaving ? 'Saving...' : 'Add Course'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}



// ═══════════════════════════════════════════════════════════════════════════
// Panel: Leaderboard
// ═══════════════════════════════════════════════════════════════════════════
function LeaderboardPanel() {
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    const fetchLeaderboard = () => {
        setLoading(true);
        leaderboardAPI.getLeaderboard()
            .then(r => setData(r.data.data || []))
            .catch(() => setError('Failed to load leaderboard.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const medal = ['🥇', '🥈', '🥉'];

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>🏆 Top Students Leaderboard</Typography>
                <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchLeaderboard} disabled={loading}>Refresh</Button>
            </Box>
            {data.length === 0
                ? <Typography color="text.secondary">No data available yet.</Typography>
                : (
                    <TableContainer component={Paper} elevation={1}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center"><b>Rank</b></TableCell>
                                    <TableCell><b>Student</b></TableCell>
                                    <TableCell align="right"><b>Score</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((s, i) => (
                                    <TableRow key={s._id || i} hover sx={{ bgcolor: i < 3 ? 'action.hover' : 'inherit' }}>
                                        <TableCell align="center">
                                            <Typography variant="h6">{medal[i] || i + 1}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar sx={{ width: 30, height: 30, bgcolor: i < 3 ? 'primary.main' : 'grey.400', fontSize: '0.8rem' }}>
                                                    {s.name?.[0] || 'S'}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>{s.name || 'Anonymous'}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body1" fontWeight={700} color={i < 3 ? 'primary.main' : 'text.primary'}>
                                                {s.totalScore ?? s.score ?? 0} pts
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            }
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Panel: Notifications
// ═══════════════════════════════════════════════════════════════════════════
function NotificationsPanel() {
    const [notifs, setNotifs]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    const fetchNotifications = () => {
        setLoading(true);
        notificationAPI.getNotifications()
            .then(r => setNotifs(r.data.data || []))
            .catch(() => setError('Failed to load notifications.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>Notifications</Typography>
                <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchNotifications} disabled={loading}>Refresh</Button>
            </Box>
            {notifs.length === 0
                ? <Typography color="text.secondary">No notifications.</Typography>
                : notifs.map((n, i) => (
                    <Paper key={n._id || i} elevation={1} sx={{ p: 2, mb: 1.5, borderLeft: `4px solid`, borderColor: n.isRead ? 'grey.300' : 'primary.main' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Typography variant="subtitle2" fontWeight={n.isRead ? 500 : 700}>{n.title || 'Notification'}</Typography>
                            {!n.isRead && <Chip label="New" size="small" color="error" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">{n.body || n.message}</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                        </Typography>
                    </Paper>
                ))
            }
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Panel: Enrollments
// ═══════════════════════════════════════════════════════════════════════════
function EnrollmentsPanel() {
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    const fetchEnrollments = () => {
        setLoading(true);
        enrollmentAPI.getMyCourses()
            .then(r => setData(r.data.data || []))
            .catch(() => setError('Failed to load enrollments.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>Enrollments</Typography>
                <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchEnrollments} disabled={loading}>Refresh</Button>
            </Box>
            {data.length === 0
                ? <Typography color="text.secondary">No enrolled courses found.</Typography>
                : (
                    <TableContainer component={Paper} elevation={1}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Course</b></TableCell>
                                    <TableCell><b>Category</b></TableCell>
                                    <TableCell><b>Enrolled On</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map(e => (
                                    <TableRow key={e._id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>{e.course?.title || '—'}</Typography>
                                            <Typography variant="caption" color="text.secondary">{e.course?.description?.slice(0, 60) || ''}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={e.course?.category?.name || e.course?.category || 'General'} size="small" />
                                        </TableCell>
                                        <TableCell>{e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : '—'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            }
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Panel: Tasks Dashboard
// ═══════════════════════════════════════════════════════════════════════════
function TasksPanel() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const res = await taskAPI.getAdminDashboard();
            setStats(res.data?.data || null);
        } catch (err) {
            setError('Failed to load task statistics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700}>Overall Task Dashboard</Typography>
                <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchStats}>Refresh</Button>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: '#fff',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-2px)' }
                    }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Box sx={{ fontSize: 32 }}>📝</Box>
                            <Box>
                                <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1 }}>
                                    {stats?.totalTasks ?? 0}
                                </Typography>
                                <Typography variant="caption" fontWeight={600} sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Total Tasks
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Portal Connect Gate — required before any sub-module is shown
// ═══════════════════════════════════════════════════════════════════════════
function PortalConnect({ onConnect }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword]     = useState('');
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!identifier || !password) { setError('Identifier and password are required.'); return; }
        try {
            setLoading(true); setError('');
            const res = await portalAuthAPI.login({ identifier, password });
            const token = res.data?.token || res.data?.data?.token;
            if (!token) throw new Error('No token returned');
            setStudentPortalToken(token);
            onConnect();
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                    <Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', p: 1.5, mb: 1.5 }}>
                        <Lock sx={{ color: '#fff', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>Connect to Student Portal</Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" mt={0.5}>
                        The Student Portal uses a separate authentication system.<br />
                        Enter your <strong>Student Portal admin credentials</strong> to continue.
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleLogin}>
                    <TextField
                        fullWidth size="small" label="Email / Username (Identifier)" type="text"
                        value={identifier} onChange={e => setIdentifier(e.target.value)}
                        sx={{ mb: 2 }} autoComplete="username"
                        placeholder="Enter your email or username"
                    />
                    <TextField
                        fullWidth size="small" label="Password" type="password"
                        value={password} onChange={e => setPassword(e.target.value)}
                        sx={{ mb: 3 }} autoComplete="current-password"
                    />
                    <Button
                        type="submit" variant="contained" fullWidth
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                    >
                        {loading ? 'Connecting…' : 'Connect'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Root component
// ═══════════════════════════════════════════════════════════════════════════
export default function StudentModule() {
    const [active, setActive] = useState('dashboard');
    const [connected, setConnected] = useState(!!getStudentPortalToken());
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const handleConnect    = () => setConnected(true);
    const handleDisconnect = useCallback(() => { clearStudentPortalToken(); setConnected(false); }, []);

    useEffect(() => {
        const handleUnauthorized = () => {
            // Force disconnect when the API detects a 401
            handleDisconnect();
        };
        
        window.addEventListener('student_portal_unauthorized', handleUnauthorized);
        return () => window.removeEventListener('student_portal_unauthorized', handleUnauthorized);
    }, [handleDisconnect]);

    if (!connected) {
        return <PortalConnect onConnect={handleConnect} />;
    }

    return (
        <Box display="flex" gap={0} sx={{ minHeight: '80vh', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            {/* ── Left Navigation ── */}
            <Paper
                elevation={0}
                sx={{
                    width: 220,
                    flexShrink: 0,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                }}
            >
                <Box sx={{ px: 2, py: 2.5 }}>
                    <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                        Student Module
                    </Typography>
                </Box>
                <Divider />
                <MuiList dense sx={{ pt: 1 }}>
                    {MODULES.map(m => (
                        <ListItem key={m.id} disablePadding>
                            <ListItemButton
                                selected={active === m.id}
                                onClick={() => setActive(m.id)}
                                sx={{
                                    mx: 1, my: 0.3, borderRadius: 1.5,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: '#fff',
                                        '& .MuiListItemIcon-root': { color: '#fff' },
                                        '&:hover': { bgcolor: 'primary.dark' },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>{m.icon}</ListItemIcon>
                                <ListItemText
                                    primary={m.label}
                                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active === m.id ? 700 : 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </MuiList>

                <Divider sx={{ mt: 'auto' }} />
                <Box sx={{ p: 1.5 }}>
                    <Tooltip title="Disconnect from Student Portal">
                        <Button
                            size="small" color="error" variant="outlined" fullWidth
                            startIcon={<LinkOff fontSize="small" />}
                            onClick={handleDisconnect}
                            sx={{ fontSize: '0.75rem' }}
                        >
                            Disconnect
                        </Button>
                    </Tooltip>
                </Box>
            </Paper>

            {/* ── Right Content ── */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                {active === 'dashboard' && <DashboardPanel refreshTrigger={refreshTrigger} />}
                {active === 'students' && <UsersPanel />}
                {active === 'studentList' && <StudentListModule />}
                {active === 'courses' && <CoursesPanel />}
                {active === 'attendance' && <AttendanceControlPanel onRefresh={triggerRefresh} />}
                {active === 'leaderboard' && <LeaderboardPanel />}
                {active === 'notifications' && <NotificationsPanel />}
                {active === 'enrollments' && <EnrollmentsPanel />}
                {active === 'leave' && <StudentLeaveManagementPanel />}
                {active === 'tasks' && <TasksPanel />}
            </Box>
        </Box>
    );
}
