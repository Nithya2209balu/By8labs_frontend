import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Popover,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip
} from '@mui/material';
import { Notifications, NotificationsNone, Campaign, Feedback } from '@mui/icons-material';
import axios from 'axios';

const API = 'https://by8labs-backend.onrender.com/api';
const STORAGE_KEY = 'notif_last_seen';

const NotificationBell = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchAll = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch both in parallel
            const [annoRes, feedRes] = await Promise.allSettled([
                axios.get(`${API}/announcements?limit=15`, { headers }),
                axios.get(`${API}/feedback?limit=15`, { headers })
            ]);

            const announcements = (
                annoRes.status === 'fulfilled'
                    ? (annoRes.value.data?.announcements || annoRes.value.data || [])
                    : []
            ).map(a => ({
                _id: a._id,
                type: 'announcement',
                title: a.title || 'Announcement',
                body: a.content || a.description || '',
                author: a.postedBy?.username || a.postedBy?.email || 'HR',
                createdAt: a.createdAt,
            }));

            const feedbacks = (
                feedRes.status === 'fulfilled'
                    ? (feedRes.value.data || [])
                    : []
            ).map(f => ({
                _id: f._id,
                type: 'feedback',
                title: f.subject || 'New Feedback',
                body: f.message || '',
                author: f.submittedBy?.username || f.submittedBy?.email || 'Employee',
                createdAt: f.createdAt,
            }));

            // Merge and sort newest first
            const merged = [...announcements, ...feedbacks].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setNotifications(merged);

            const lastSeen = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
            const unread = merged.filter(n => new Date(n.createdAt).getTime() > lastSeen).length;
            setUnreadCount(unread);
        } catch (err) {
            // Non-critical — silent fail
        }
    };

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleOpen = (e) => {
        setAnchorEl(e.currentTarget);
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setUnreadCount(0);
    };

    const handleClose = () => setAnchorEl(null);

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const diff = Date.now() - d.getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const annoCount = notifications.filter(n => n.type === 'announcement').length;
    const feedCount = notifications.filter(n => n.type === 'feedback').length;

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                title="Notifications"
            >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                    {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
                </Badge>
            </IconButton>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        width: 380,
                        maxHeight: 500,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        🔔 Notifications
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                            icon={<Campaign sx={{ color: 'white !important', fontSize: 14 }} />}
                            label={annoCount}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '& .MuiChip-label': { px: 0.5 } }}
                            title="Announcements"
                        />
                        <Chip
                            icon={<Feedback sx={{ color: 'white !important', fontSize: 14 }} />}
                            label={feedCount}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '& .MuiChip-label': { px: 0.5 } }}
                            title="Feedback"
                        />
                    </Box>
                </Box>

                {/* Notification List */}
                <Box sx={{ overflowY: 'auto', flex: 1 }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <NotificationsNone sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                No notifications yet
                            </Typography>
                        </Box>
                    ) : (
                        <List dense disablePadding>
                            {notifications.map((n, i) => (
                                <React.Fragment key={`${n.type}-${n._id || i}`}>
                                    <ListItem
                                        alignItems="flex-start"
                                        sx={{
                                            py: 1.5, px: 2,
                                            borderLeft: '3px solid',
                                            borderLeftColor: n.type === 'announcement' ? 'primary.main' : 'warning.main',
                                            '&:hover': { bgcolor: 'action.hover' },
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                                                    {n.type === 'announcement'
                                                        ? <Campaign sx={{ fontSize: 14, color: 'primary.main' }} />
                                                        : <Feedback sx={{ fontSize: 14, color: 'warning.main' }} />
                                                    }
                                                    <Chip
                                                        label={n.type === 'announcement' ? 'Announcement' : 'Feedback'}
                                                        size="small"
                                                        color={n.type === 'announcement' ? 'primary' : 'warning'}
                                                        sx={{ height: 18, fontSize: '0.65rem' }}
                                                    />
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={600}
                                                        noWrap
                                                        sx={{ flex: 1 }}
                                                    >
                                                        {n.title}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            mb: 0.25,
                                                        }}
                                                    >
                                                        {n.body}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.disabled">
                                                        {n.author} · {formatTime(n.createdAt)}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {i < notifications.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default NotificationBell;
