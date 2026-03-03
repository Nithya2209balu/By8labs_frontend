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
    Chip,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Delete,
    MarkEmailRead,
    MarkEmailUnread,
    Search
} from '@mui/icons-material';
import { emailsAPI } from '../../services/api';
import { format } from 'date-fns';

const InboxView = ({ onEmailRead, message, setMessage }) => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async () => {
        try {
            setLoading(true);
            const response = await emailsAPI.getInbox();
            setEmails(response.data.emails || []);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load inbox'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailClick = async (email) => {
        setSelectedEmail(email);
        setDetailOpen(true);

        // Mark as read if unread
        const isUnread = !isEmailRead(email);
        if (isUnread) {
            try {
                await emailsAPI.markAsRead(email._id);
                await loadInbox();
                if (onEmailRead) {
                    onEmailRead();
                }
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
    };

    const handleDelete = async (emailId, event) => {
        event.stopPropagation();
        try {
            await emailsAPI.deleteEmail(emailId);
            setMessage({ type: 'success', text: 'Email deleted' });
            await loadInbox();
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

    const isEmailRead = (email) => {
        return email.readBy?.some(read => read.userId);
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

    const filteredEmails = emails.filter(email => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            email.sender?.username?.toLowerCase().includes(query) ||
            email.subject?.toLowerCase().includes(query) ||
            email.body?.toLowerCase().includes(query)
        );
    });

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

            {/* Search */}
            <TextField
                fullWidth
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    )
                }}
                sx={{ mb: 3 }}
            />

            {/* Email List */}
            {filteredEmails.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        {searchQuery ? 'No emails found' : 'No emails in inbox'}
                    </Typography>
                </Box>
            ) : (
                <Paper>
                    <List>
                        {filteredEmails.map((email, index) => {
                            const isUnread = !isEmailRead(email);
                            return (
                                <React.Fragment key={email._id}>
                                    <ListItem
                                        disablePadding
                                        secondaryAction={
                                            <Box>
                                                <IconButton
                                                    edge="end"
                                                    onClick={(e) => handleDelete(email._id, e)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        }
                                        sx={{
                                            bgcolor: isUnread ? 'action.hover' : 'transparent'
                                        }}
                                    >
                                        <ListItemButton onClick={() => handleEmailClick(email)}>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: isUnread ? 700 : 400,
                                                                flex: 1
                                                            }}
                                                        >
                                                            {email.sender?.username || 'Unknown Sender'}
                                                        </Typography>
                                                        {email.sentToAll && (
                                                            <Chip label="Sent to All" size="small" color="primary" />
                                                        )}
                                                        {isUnread && (
                                                            <Chip label="New" size="small" color="error" />
                                                        )}
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{ fontWeight: isUnread ? 600 : 400 }}
                                                        >
                                                            {formatDate(email.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: isUnread ? 600 : 400,
                                                                color: 'text.primary'
                                                            }}
                                                        >
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
                                    {index < filteredEmails.length - 1 && <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}
                                </React.Fragment>
                            );
                        })}
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
                            <Typography variant="h6">{selectedEmail.subject}</Typography>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>From:</strong> {selectedEmail.sender?.username} ({selectedEmail.sender?.email})
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Date:</strong> {format(new Date(selectedEmail.createdAt), 'PPpp')}
                                </Typography>
                                {selectedEmail.recipients?.length > 0 && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>To:</strong> {selectedEmail.recipients.map(r => r.username).join(', ')}
                                    </Typography>
                                )}
                                {selectedEmail.cc?.length > 0 && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Cc:</strong> {selectedEmail.cc.map(c => c.username).join(', ')}
                                    </Typography>
                                )}
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

export default InboxView;
