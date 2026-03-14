import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Grid, Typography, Paper, CircularProgress, Alert, Avatar,
    Chip, IconButton, Button, TextField, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Divider,
    List as MuiList, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Tooltip, Card, CardContent, InputAdornment
} from '@mui/material';
import {
    Dashboard, SchoolOutlined, EventAvailable, EmojiEvents,
    Notifications, MenuBook, CheckCircle, Cancel, ThumbUp, ThumbDown,
    Search, Assessment, NotificationsActive, LinkOff, Lock
} from '@mui/icons-material';
import {
    dashboardAPI, adminStudentAPI, courseAPI, attendanceAPI,
    leaderboardAPI, notificationAPI, enrollmentAPI,
    portalAuthAPI, getStudentPortalToken, setStudentPortalToken, clearStudentPortalToken
} from '../../services/studentPortalAPI';

// ─── Sub-module definitions ────────────────────────────────────────────────
const MODULES = [
    { id: 'dashboard',      label: 'Dashboard',          icon: <Dashboard /> },
    { id: 'students',       label: 'Student Management',  icon: <SchoolOutlined /> },
    { id: 'courses',        label: 'Courses',             icon: <MenuBook /> },
    { id: 'attendance',     label: 'Attendance',          icon: <EventAvailable /> },
    { id: 'leaderboard',    label: 'Leaderboard',         icon: <EmojiEvents /> },
    { id: 'notifications',  label: 'Notifications',       icon: <NotificationsActive /> },
    { id: 'enrollments',    label: 'Enrollments',         icon: <Assessment /> },
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
function DashboardPanel() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        dashboardAPI.getCounts()
            .then(r => setData(r.data.data))
            .catch(err => {
                if (err.response?.status === 401) {
                    setUnauthorized(true);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;

    if (unauthorized) {
        return (
            <Box>
                <Typography variant="h6" fontWeight={700} mb={3}>Dashboard Summary</Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2" fontWeight={600}>Admin Overview</Typography>
                    <Typography variant="body2">
                        The Dashboard counts endpoint requires a <strong>Student JWT token</strong> and is only accessible when logged in as a Student.
                        As an Admin, you can manage students from the <strong>Student Management</strong> sub-module.
                    </Typography>
                </Alert>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <StatCard label="Enrolled Courses" value="N/A" icon={<MenuBook />} color="text.disabled" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard label="Attendance %" value="N/A" icon={<EventAvailable />} color="text.disabled" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard label="Notifications" value="N/A" icon={<Notifications />} color="text.disabled" />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" fontWeight={700} mb={3}>Dashboard Summary</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <StatCard label="Enrolled Courses" value={data?.enrolledCourses} icon={<MenuBook />} color="primary.main" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard label="Attendance %" value={data?.attendance != null ? `${data.attendance}%` : '—'} icon={<EventAvailable />} color="success.main" />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard label="Notifications" value={data?.notifications} icon={<Notifications />} color="warning.main" />
                </Grid>
            </Grid>
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Panel: Student Management (Admin)
// ═══════════════════════════════════════════════════════════════════════════
function StudentsPanel() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState('');
    const [search, setSearch]     = useState('');

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminStudentAPI.getAllStudents();
            setStudents(res.data.data || []);
        } catch { setError('Failed to load students.'); }
        finally  { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const handleApprove = async (id) => {
        try { setSaving(true); await adminStudentAPI.approveStudent(id); setSuccess('Student approved!'); fetch(); }
        catch { setError('Failed to approve student.'); }
        finally { setSaving(false); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject and delete this student account?')) return;
        try { setSaving(true); await adminStudentAPI.rejectStudent(id); setSuccess('Student rejected.'); fetch(); }
        catch { setError('Failed to reject student.'); }
        finally { setSaving(false); }
    };

    const filtered = students.filter(s =>
        !search || s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>Student Management</Typography>
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}
            {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
                size="small" placeholder="Search by name / email…"
                value={search} onChange={e => setSearch(e.target.value)}
                sx={{ mb: 2, maxWidth: 320 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
            />

            {loading ? <CircularProgress /> : (
                <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Student</b></TableCell>
                                <TableCell><b>Email</b></TableCell>
                                <TableCell><b>Registered</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                                <TableCell align="right"><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.length === 0
                                ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No students found.</TableCell></TableRow>
                                : filtered.map(s => (
                                    <TableRow key={s._id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                                                    {s.name?.[0] || 'S'}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>{s.name || s.username}</Typography>
                                            </Box>
                                        </TableCell>
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
// Panel: Courses (catalog list for admin overview)
// ═══════════════════════════════════════════════════════════════════════════
function CoursesPanel() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        courseAPI.getAllCourses()
            .then(r => setCourses(r.data.data || []))
            .catch(() => setError('Failed to load courses.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>All Courses</Typography>
            {courses.length === 0
                ? <Typography color="text.secondary">No courses available.</Typography>
                : (
                    <Grid container spacing={2}>
                        {courses.map(c => (
                            <Grid item xs={12} sm={6} md={4} key={c._id}>
                                <Card>
                                    <CardContent>
                                        <Chip label={c.category?.name || c.category || 'General'} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
                                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>{c.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {c.description || 'No description.'}
                                        </Typography>
                                        <Box display="flex" justifyContent="space-between" mt={2}>
                                            <Typography variant="caption" color="text.secondary">{c.duration || '—'}</Typography>
                                            <Typography variant="caption" fontWeight={700} color="primary.main">
                                                {c.price ? `₹${c.price}` : 'Free'}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )
            }
        </Box>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Panel: Attendance
// ═══════════════════════════════════════════════════════════════════════════
function AttendancePanel() {
    const [summary, setSummary] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        Promise.all([attendanceAPI.getSummary(), attendanceAPI.getMyAttendance()])
            .then(([s, r]) => { setSummary(s.data.data); setRecords(r.data.data || []); })
            .catch(() => setError('Failed to load attendance data.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h6" fontWeight={700} mb={3}>Attendance</Typography>
            {summary && (
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={4}>
                        <StatCard label="Total Classes" value={summary.totalClasses} icon={<EventAvailable />} color="primary.main" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard label="Attended" value={summary.attended} icon={<CheckCircle />} color="success.main" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatCard
                            label="Attendance Rate"
                            value={summary.percentage != null ? `${Number(summary.percentage).toFixed(1)}%` : '—'}
                            icon={<Assessment />}
                            color={summary.percentage >= 75 ? 'info.main' : 'warning.main'}
                        />
                    </Grid>
                </Grid>
            )}

            <Typography variant="subtitle1" fontWeight={700} mb={1}>Attendance History</Typography>
            <TableContainer component={Paper} elevation={1}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Date</b></TableCell>
                            <TableCell><b>Course / Subject</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Remarks</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.length === 0
                            ? <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No records yet.</TableCell></TableRow>
                            : records.map(r => (
                                <TableRow key={r._id} hover>
                                    <TableCell>{new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                                    <TableCell>{r.course?.title || r.courseName || 'General'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={r.status}
                                            color={r.status?.toLowerCase() === 'present' ? 'success' : r.status?.toLowerCase() === 'absent' ? 'error' : 'warning'}
                                            size="small"
                                            icon={r.status?.toLowerCase() === 'present' ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                                        />
                                    </TableCell>
                                    <TableCell>{r.remarks || '—'}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
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

    useEffect(() => {
        leaderboardAPI.getLeaderboard()
            .then(r => setData(r.data.data || []))
            .catch(() => setError('Failed to load leaderboard.'))
            .finally(() => setLoading(false));
    }, []);

    const medal = ['🥇', '🥈', '🥉'];

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>🏆 Top Students Leaderboard</Typography>
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

    useEffect(() => {
        notificationAPI.getNotifications()
            .then(r => setNotifs(r.data.data || []))
            .catch(() => setError('Failed to load notifications.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>Notifications</Typography>
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

    useEffect(() => {
        enrollmentAPI.getMyCourses()
            .then(r => setData(r.data.data || []))
            .catch(() => setError('Failed to load enrollments.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
    if (error)   return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>Enrollments</Typography>
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
const PANELS = {
    dashboard:     <DashboardPanel />,
    students:      <StudentsPanel />,
    courses:       <CoursesPanel />,
    attendance:    <AttendancePanel />,
    leaderboard:   <LeaderboardPanel />,
    notifications: <NotificationsPanel />,
    enrollments:   <EnrollmentsPanel />,
};

export default function StudentModule() {
    const [active, setActive] = useState('dashboard');
    const [connected, setConnected] = useState(!!getStudentPortalToken());

    const handleConnect    = () => setConnected(true);
    const handleDisconnect = () => { clearStudentPortalToken(); setConnected(false); };

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
                {PANELS[active]}
            </Box>
        </Box>
    );
}
