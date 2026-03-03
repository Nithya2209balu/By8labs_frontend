import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { emailsAPI } from '../../services/api';
import { format } from 'date-fns';

const SentItems = ({ message, setMessage }) => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        loadSentEmails();
    }, []);

    const loadSentEmails = async () => {
        try {
            setLoading(true);
            const response = await emailsAPI.getSent();
            setEmails(response.data || []);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load sent emails'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailClick = (email) => {
        setSelectedEmail(email);
        setDetailOpen(true);
    };

    const handleDelete = async (emailId, event) => {
        event.stopPropagation();
        try {
            await emailsAPI.deleteEmail(emailId);
            setMessage({ type: 'success', text: 'Email deleted' });
            await loadSentEmails();
            if (detailOpen && selectedEmail?._id === emailId) {
                setDetailOpen(false);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to delete email'
            });
        }
    };

    const formatDate = (date) => {
        const emailDate = new Date(date);
        const now = new Date();
        const diffInHours = (now - emailDate) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return format(emailDate, 'h:mm a');
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else if (diffInHours < 168) {
            return format(emailDate, 'EEEE');
        } else {
            return format(emailDate, 'MMM d');
        }
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
            {message.text && (
                <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            {/* Email List */}
            {emails.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No sent emails
                    </Typography>
                </Box>
            ) : (
                <Paper>
                    <List>
                        {emails.map((email, index) => (
                            <React.Fragment key={email._id}>
                                <ListItem
                                    disablePadding
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={(e) => handleDelete(email._id, e)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    }
                                >
                                    <ListItemButton onClick={() => handleEmailClick(email)}>
                                        <ListItemText
                                            primaryTypographyProps={{ component: 'div' }}
                                            secondaryTypographyProps={{ component: 'div' }}
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ flex: 1 }}>
                                                        To: {email.sentToAll
                                                            ? 'All Employees'
                                                            : email.recipients?.map(r => r.username).join(', ') || 'Unknown'}
                                                    </Typography>
                                                    {email.sentToAll && (
                                                        <Chip label="Sent to All" size="small" color="primary" />
                                                    )}
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(email.createdAt)}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                                        {email.subject}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {email.body?.substring(0, 100)}...
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                                {index < emails.length - 1 && <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Email Detail Dialog */}
            <Dialog
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedEmail && (
                    <>
                        <DialogTitle>
                            {selectedEmail.subject}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>To:</strong> {selectedEmail.sentToAll
                                        ? 'All Employees'
                                        : selectedEmail.recipients?.map(r => `${r.username} (${r.email})`).join(', ') || 'Unknown'}
                                </Typography>
                                {selectedEmail.cc?.length > 0 && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Cc:</strong> {selectedEmail.cc.map(c => `${c.username} (${c.email})`).join(', ')}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Sent:</strong> {format(new Date(selectedEmail.createdAt), 'PPpp')}
                                </Typography>
                            </Box>
                            <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {selectedEmail.body}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDetailOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default SentItems;
