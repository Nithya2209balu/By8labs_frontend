import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { Add, Campaign } from '@mui/icons-material';
import { announcementAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AnnouncementCard from '../components/announcements/AnnouncementCard';
import AnnouncementForm from '../components/announcements/AnnouncementForm';

const AnnouncementManagement = () => {
    const { isHR } = useAuth();
    const location = useLocation();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formOpen, setFormOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);

    useEffect(() => {
        loadAnnouncements();
    }, []);

    // Auto-scroll to item from notification hash
    useEffect(() => {
        if (loading) return;
        const hash = location.hash?.replace('#', '');
        if (!hash) return;
        const timer = setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('notif-highlight');
                setTimeout(() => el.classList.remove('notif-highlight'), 2500);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [loading, location.hash]);

    const loadAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await announcementAPI.getAll();
            setAnnouncements(response.data);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load announcements'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            await announcementAPI.create(formData);
            setMessage({
                type: 'success',
                text: 'Announcement created successfully! Notifications sent to all employees.'
            });
            setFormOpen(false);
            loadAnnouncements();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to create announcement'
            });
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await announcementAPI.update(editingAnnouncement._id, formData);
            setMessage({
                type: 'success',
                text: 'Announcement updated successfully! Notifications sent to all employees.'
            });
            setFormOpen(false);
            setEditingAnnouncement(null);
            loadAnnouncements();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update announcement'
            });
        }
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormOpen(true);
    };

    const handleDeleteClick = (announcement) => {
        setAnnouncementToDelete(announcement);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await announcementAPI.delete(announcementToDelete._id);
            setMessage({
                type: 'success',
                text: 'Announcement deleted successfully'
            });
            setDeleteDialogOpen(false);
            setAnnouncementToDelete(null);
            loadAnnouncements();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to delete announcement'
            });
        }
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setEditingAnnouncement(null);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Campaign sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h4">
                        Announcements
                    </Typography>
                </Box>
                {isHR && (
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setFormOpen(true)}
                    >
                        Create Announcement
                    </Button>
                )}
            </Box>

            {/* Messages */}
            {message.text && (
                <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            {/* Info for employees */}
            {!isHR && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    View announcements from HR. You will receive notifications when new announcements are posted.
                </Alert>
            )}

            {/* Announcements List */}
            {announcements.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Campaign sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No announcements yet
                    </Typography>
                    {isHR && (
                        <Typography variant="body2" color="text.secondary">
                            Create your first announcement to notify all employees
                        </Typography>
                    )}
                </Box>
            ) : (
                <Box>
                    {announcements.map((announcement) => (
                        <AnnouncementCard
                            key={announcement._id}
                            announcement={announcement}
                            isHR={isHR}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </Box>
            )}

            {/* Create/Edit Form */}
            <AnnouncementForm
                open={formOpen}
                onClose={handleFormClose}
                onSubmit={editingAnnouncement ? handleUpdate : handleCreate}
                announcement={editingAnnouncement}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Announcement</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this announcement? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AnnouncementManagement;
