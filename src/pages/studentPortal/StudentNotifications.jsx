import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Card, CardContent, CircularProgress,
    Alert, List, ListItem, ListItemIcon, ListItemText, Divider, Chip
} from '@mui/material';
import { NotificationsActive, Campaign, Info, Warning } from '@mui/icons-material';
import { notificationAPI } from '../../services/studentPortalAPI';

const StudentNotifications = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const res = await notificationAPI.getNotifications();
                if (res.data.success) {
                    setNotifications(res.data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setError(err.response?.data?.message || 'Failed to load notifications.');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const getIcon = (type) => {
        switch(type) {
            case 'announcement': return <Campaign color="primary" />;
            case 'alert': return <Warning color="error" />;
            default: return <Info color="info" />;
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4} display="flex" alignItems="center" gap={2}>
                <NotificationsActive color="primary" fontSize="large" />
                <Typography variant="h4" fontWeight="bold">My Notifications</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Card elevation={2}>
                <CardContent sx={{ p: 0 }}>
                    <List disablePadding>
                        {notifications.length === 0 ? (
                            <Box py={6} textAlign="center">
                                <Typography color="text.secondary">You have no new notifications.</Typography>
                            </Box>
                        ) : (
                            notifications.map((notif, index) => (
                                <Box key={notif._id || index}>
                                    <ListItem alignItems="flex-start" sx={{ py: 3, px: 3, bgcolor: notif.isRead ? 'transparent' : 'action.hover' }}>
                                        <ListItemIcon sx={{ mt: 1 }}>{getIcon(notif.type)}</ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="h6" component="span" fontWeight={notif.isRead ? 'normal' : 'bold'}>
                                                        {notif.title}
                                                    </Typography>
                                                    {!notif.isRead && <Chip label="New" color="error" size="small" />}
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body1" color="text.primary" sx={{ display: 'block', mb: 1 }}>
                                                        {notif.body}
                                                    </Typography>
                                                    <Typography component="span" variant="caption" color="text.secondary">
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </Box>
                            ))
                        )}
                    </List>
                </CardContent>
            </Card>
        </Container>
    );
};

export default StudentNotifications;
