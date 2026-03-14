import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { MenuBook, NotificationsActive, CheckCircleOutline } from '@mui/icons-material';
import { dashboardAPI } from '../../services/studentPortalAPI';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await dashboardAPI.getCounts();
                if (response.data && response.data.success) {
                    setStats(response.data.data);
                }
            } catch (err) {
                console.error('Error fetching student dashboard stats:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const dashboardCards = [
        {
            title: 'Enrolled Courses',
            value: stats?.enrolledCourses || 0,
            icon: <MenuBook fontSize="large" color="primary" />,
            bgColor: 'rgba(99, 102, 241, 0.1)'
        },
        {
            title: 'Attendance (%)',
            value: `${stats?.attendance || 0}%`,
            icon: <CheckCircleOutline fontSize="large" color="success" />,
            bgColor: 'rgba(34, 197, 94, 0.1)'
        },
        {
            title: 'Notifications',
            value: stats?.notifications || 0,
            icon: <NotificationsActive fontSize="large" color="warning" />,
            bgColor: 'rgba(245, 158, 11, 0.1)'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Welcome back, {user?.name || user?.username || 'Student'}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Here's an overview of your progress and activities.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {dashboardCards.map((card, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        p: 2,
                                        borderRadius: '50%',
                                        backgroundColor: card.bgColor,
                                        mb: 2
                                    }}
                                >
                                    {card.icon}
                                </Box>
                                <Typography variant="h3" component="div" fontWeight="bold">
                                    {card.value}
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    {card.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default StudentDashboard;
