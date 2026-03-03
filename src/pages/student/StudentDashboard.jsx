import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Grid, Card, CardContent, Typography, Chip, Avatar,
    List, ListItem, ListItemIcon, ListItemText, Divider, Paper,
    CircularProgress, Alert
} from '@mui/material';
import {
    School, People, CheckCircle, Cancel, AttachMoney,
    EventNote, TrendingUp, Assignment, AccessTime, FiberManualRecord
} from '@mui/icons-material';

const API = 'https://by8labs-backend.onrender.com/api';

const getToken = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

const StatCard = ({ icon, label, value, color, subtitle }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`, border: `1px solid ${color}30` }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: color, width: 52, height: 52, boxShadow: `0 4px 12px ${color}40` }}>
                {icon}
            </Avatar>
            <Box>
                <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
                {subtitle && <Typography variant="caption" color="text.disabled">{subtitle}</Typography>}
            </Box>
        </CardContent>
    </Card>
);

export default function StudentDashboard() {
    const [stats, setStats] = useState(null);
    const [fees, setFees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [statsRes, feesRes, leavesRes, studentsRes] = await Promise.all([
                    axios.get(`${API}/students/stats/summary`, { headers: headers() }),
                    axios.get(`${API}/student-fees?status=Pending`, { headers: headers() }),
                    axios.get(`${API}/student-leaves`, { headers: headers() }),
                    axios.get(`${API}/students?limit=5`, { headers: headers() }),
                ]);
                setStats(statsRes.data);
                setFees(feesRes.data.slice(0, 5));
                setLeaves(leavesRes.data.slice(0, 5));
                setStudents(studentsRes.data.students || []);
            } catch (err) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const pendingFeeTotal = fees.reduce((s, f) => s + (f.amount - f.paidAmount), 0);

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={3} color="primary.dark">
                🎓 Student Dashboard
            </Typography>

            {/* Stat Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<People />} label="Total Students" value={stats?.total ?? 0} color="#10b981" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<CheckCircle />} label="Active Students" value={stats?.active ?? 0} color="#3b82f6" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<Cancel />} label="Inactive Students" value={stats?.inactive ?? 0} color="#f59e0b" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard icon={<AttachMoney />} label="Fee Pending" value={`₹${pendingFeeTotal.toLocaleString()}`} color="#ef4444" subtitle={`${fees.length} records`} />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Course-wise count */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2.5, height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                            <School fontSize="small" color="primary" /> Course-wise Students
                        </Typography>
                        {stats?.courseStats?.length > 0 ? (
                            <List dense disablePadding>
                                {stats.courseStats.map((c, i) => (
                                    <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 28 }}>
                                            <FiberManualRecord sx={{ fontSize: 10, color: '#10b981' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={c.courseName || 'Unassigned'}
                                            secondary={`${c.count} student${c.count !== 1 ? 's' : ''}`}
                                            primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: 500 }}
                                            secondaryTypographyProps={{ fontSize: '0.78rem' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No course data yet</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Pending fees */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2.5, height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                            <AttachMoney fontSize="small" color="error" /> Pending Fees
                        </Typography>
                        {fees.length > 0 ? (
                            <List dense disablePadding>
                                {fees.map((f) => (
                                    <ListItem key={f._id} disablePadding sx={{ py: 0.5 }}>
                                        <ListItemText
                                            primary={f.student?.name || '—'}
                                            secondary={`₹${(f.amount - f.paidAmount).toLocaleString()} – ${f.feeType}`}
                                            primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: 500 }}
                                            secondaryTypographyProps={{ fontSize: '0.78rem', color: '#ef4444' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No pending fees 🎉</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Recent Activities */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2.5, height: '100%' }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                            <TrendingUp fontSize="small" color="primary" /> Recent Students
                        </Typography>
                        {students.length > 0 ? (
                            <List dense disablePadding>
                                {students.map((s) => (
                                    <ListItem key={s._id} disablePadding sx={{ py: 0.5 }}>
                                        <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: '0.75rem', bgcolor: '#10b981' }}>
                                            {s.name?.[0]}
                                        </Avatar>
                                        <ListItemText
                                            primary={s.name}
                                            secondary={`${s.studentId} • ${s.status}`}
                                            primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: 500 }}
                                            secondaryTypographyProps={{ fontSize: '0.78rem' }}
                                        />
                                        <Chip label={s.status} size="small"
                                            color={s.status === 'Active' ? 'success' : 'default'} variant="outlined" />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No students yet</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Leave Summary */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2.5 }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                            <EventNote fontSize="small" color="primary" /> Recent Leave Records
                        </Typography>
                        {leaves.length > 0 ? (
                            <List dense disablePadding>
                                {leaves.map((l) => (
                                    <React.Fragment key={l._id}>
                                        <ListItem disablePadding sx={{ py: 0.5 }}>
                                            <ListItemText
                                                primary={l.student?.name || '—'}
                                                secondary={`${l.leaveType} • ${new Date(l.startDate).toLocaleDateString()} – ${new Date(l.endDate).toLocaleDateString()}`}
                                                primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: 500 }}
                                                secondaryTypographyProps={{ fontSize: '0.78rem' }}
                                            />
                                            <Chip label={l.status} size="small"
                                                color={l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'error' : 'warning'} />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No leave records</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
