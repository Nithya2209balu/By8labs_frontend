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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { emailsAPI } from '../../services/api';
import { format } from 'date-fns';

const ExternalInboxView = () => {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loadingContent, setLoadingContent] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(null);

    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await emailsAPI.getExternalInbox();
            setEmails(response.data || []);
            setLastRefreshTime(new Date());

            // Clear any previous errors if successful
            setMessage({ type: '', text: '' });

            // Show success message only on manual refresh
            if (isRefresh) {
                setMessage({
                    type: 'success',
                    text: `Inbox refreshed successfully. ${response.data?.length || 0} emails found.`
                });
                // Auto-hide success message after 3 seconds
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (error) {
            console.error('Error loading external inbox:', error);
            const errorMessage = error.response?.data?.message || 'Failed to connect to email server. Please check your settings and internet connection.';
            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadInbox(true);
    };

    const handleEmailClick = async (emailId) => {
        try {
            setLoadingContent(true);
            setDetailOpen(true);
            const response = await emailsAPI.getExternalEmailById(emailId);
            setSelectedEmail(response.data);
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to load email content'
            });
            setDetailOpen(false); // Close dialong on error
        } finally {
            setLoadingContent(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const emailDate = new Date(date);
        const now = new Date();
        const diffInHours = (now - emailDate) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return format(emailDate, 'h:mm a');
        } else if (diffInHours < 48) {
            return 'Yesterday';
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                    <Typography variant="h6" component="span">
                        Hostinger Inbox
                        <Chip
                            label="External"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1, verticalAlign: 'middle' }}
                        />
                    </Typography>
                    {lastRefreshTime && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Last updated: {format(lastRefreshTime, 'PPpp')}
                        </Typography>
                    )}
                </Box>
                <Tooltip title="Refresh inbox">
                    <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing}
                        color="primary"
                        size="large"
                    >
                        <RefreshIcon sx={{
                            animation: refreshing ? 'spin 1s linear infinite' : 'none',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' }
                            }
                        }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Email List */}
            {emails.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        {loading ? 'Loading...' : 'No emails found in Hostinger Inbox'}
                    </Typography>
                </Box>
            ) : (
                <Paper>
                    <List>
                        {emails.map((email, index) => (
                            <React.Fragment key={email.id}>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => handleEmailClick(email.id)}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{ fontWeight: !email.seen ? 700 : 400, flex: 1 }}>
                                                        {email.from}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(email.date)}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: !email.seen ? 600 : 400,
                                                            color: 'text.primary'
                                                        }}
                                                    >
                                                        {email.subject || '(No Subject)'}
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
                                                        {email.preview}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                                {index < emails.length - 1 && <Divider />}
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
                {loadingContent ? (
                    <Box p={4} display="flex" justifyContent="center">
                        <CircularProgress />
                    </Box>
                ) : selectedEmail && (
                    <>
                        <DialogTitle>
                            <Typography variant="h6">{selectedEmail.subject}</Typography>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>From:</strong> {selectedEmail.from}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Date:</strong> {format(new Date(selectedEmail.date), 'PPpp')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>To:</strong> {selectedEmail.to}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Render HTML content safely */}
                            <Box
                                sx={{
                                    '& img': { maxWidth: '100%' },
                                    fontFamily: 'sans-serif'
                                }}
                                dangerouslySetInnerHTML={{ __html: selectedEmail.html || selectedEmail.text }}
                            />

                            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                                <Box mt={2}>
                                    <Typography variant="subtitle2">Attachments:</Typography>
                                    <List dense>
                                        {selectedEmail.attachments.map((att, i) => (
                                            <ListItem key={i}>
                                                <ListItemText primary={att.filename} secondary={`${(att.size / 1024).toFixed(1)} KB`} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
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

export default ExternalInboxView;
