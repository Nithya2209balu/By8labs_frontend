import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Badge,
    CircularProgress,
    Button,
    IconButton
} from '@mui/material';
import { Mail, Inbox, Send, Edit, CloudDownload, Settings } from '@mui/icons-material';
import { emailsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ComposeEmail from '../components/emails/ComposeEmail';
import InboxView from '../components/emails/InboxView';
import SentItems from '../components/emails/SentItems';
import ExternalInboxView from '../components/emails/ExternalInboxView';
import EmailSettingsDialog from '../components/emails/EmailSettingsDialog';

const EmailManagement = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(2); // Default to External Inbox (now index 2)
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        if (activeTab === 1) {
            loadUnreadCount();
        }
    }, [activeTab]);

    const loadUnreadCount = async () => {
        try {
            const response = await emailsAPI.getInbox();
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleEmailSent = () => {
        setMessage({ type: 'success', text: 'Email sent successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        setActiveTab(2); // Switch to Sent tab
    };

    const handleEmailRead = () => {
        loadUnreadCount();
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Mail sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h4">Email</Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => setSettingsOpen(true)}
                >
                    Settings
                </Button>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab icon={<Edit />} label="Compose" iconPosition="start" />
                    {/* <Tab
                        icon={
                            <Badge badgeContent={unreadCount} color="error">
                                <Inbox />
                            </Badge>
                        }
                        label="Inbox"
                        iconPosition="start"
                    /> */}
                    <Tab icon={<Send />} label="Sent" iconPosition="start" />
                    <Tab icon={<CloudDownload />} label="  Inbox" iconPosition="start" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            {activeTab === 0 && (
                <ComposeEmail
                    onEmailSent={handleEmailSent}
                    message={message}
                    setMessage={setMessage}
                />
            )}

            {activeTab === 1 && (
                <SentItems
                    message={message}
                    setMessage={setMessage}
                />
            )}

            {activeTab === 2 && (
                <ExternalInboxView />
            )}

            <EmailSettingsDialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                onSave={() => setMessage({ type: 'success', text: 'Email settings saved successfully!' })}
            />
        </Box>
    );
};

export default EmailManagement;
