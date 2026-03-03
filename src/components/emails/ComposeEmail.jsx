import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Autocomplete,
    Checkbox,
    FormControlLabel,
    Chip,
    Typography,
    IconButton,
    Collapse
} from '@mui/material';
import { Send as SendIcon, Clear, ExpandMore, ExpandLess } from '@mui/icons-material';
import { emailsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ComposeEmail = ({ onEmailSent, message, setMessage }) => {
    const { user } = useAuth();
    const isHR = user?.role === 'HR';

    const [recipients, setRecipients] = useState([]);
    const [manualEmail, setManualEmail] = useState('');
    const [useManualEntry, setUseManualEntry] = useState(false);
    const [cc, setCc] = useState([]);
    const [bcc, setBcc] = useState([]);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sendToAll, setSendToAll] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);

    useEffect(() => {
        loadRecipients();
    }, []);

    const loadRecipients = async () => {
        try {
            const response = await emailsAPI.getRecipientsList();
            setAvailableUsers(response.data);
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to load recipients'
            });
        }
    };

    const handleSend = async () => {
        // Validation
        if (!subject.trim()) {
            setMessage({ type: 'error', text: 'Subject is required' });
            return;
        }

        if (!body.trim()) {
            setMessage({ type: 'error', text: 'Message body is required' });
            return;
        }

        // Validation for manual email entry
        if (useManualEntry && !sendToAll) {
            if (!manualEmail.trim()) {
                setMessage({ type: 'error', text: 'Please enter an email address' });
                return;
            }
            if (!emailRegex.test(manualEmail)) {
                setMessage({ type: 'error', text: 'Please enter a valid email address' });
                return;
            }
        }

        if (!sendToAll && !useManualEntry && recipients.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one recipient or check "Send to All Employees"' });
            return;
        }

        try {
            setLoading(true);
            const emailData = {
                recipients: useManualEntry ? [manualEmail] : recipients.map(r => r._id),
                cc: cc.map(c => c._id),
                bcc: bcc.map(b => b._id),
                subject,
                body,
                sentToAll: sendToAll,
                useManualEmail: useManualEntry  // Flag for backend to handle differently
            };

            await emailsAPI.sendEmail(emailData);

            // Clear form
            setRecipients([]);
            setCc([]);
            setBcc([]);
            setSubject('');
            setBody('');
            setSendToAll(false);
            setShowCc(false);
            setShowBcc(false);

            if (onEmailSent) {
                onEmailSent();
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to send email'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setRecipients([]);
        setManualEmail('');
        setUseManualEntry(false);
        setCc([]);
        setBcc([]);
        setSubject('');
        setBody('');
        setSendToAll(false);
        setShowCc(false);
        setShowBcc(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <Box>
            {message.text && (
                <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            <Box sx={{ maxWidth: 800 }}>
                {/* Send to All Checkbox (HR only) */}
                {isHR && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={sendToAll}
                                onChange={(e) => {
                                    setSendToAll(e.target.checked);
                                    if (e.target.checked) {
                                        setRecipients([]);
                                    }
                                }}
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography>Send to All Employees</Typography>
                                <Chip label="HR Only" size="small" color="primary" />
                            </Box>
                        }
                        sx={{ mb: 2 }}
                    />
                )}

                {/* Employee Restriction Info */}
                {!isHR && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Employees can only send emails to HR users
                    </Alert>
                )}

                {/* Manual Email Entry Toggle */}
                {!sendToAll && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={useManualEntry}
                                onChange={(e) => setUseManualEntry(e.target.checked)}
                            />
                        }
                        label="Enter email address manually"
                        sx={{ mb: 2 }}
                    />
                )}

                {/* Recipients - Autocomplete or Manual */}
                {!sendToAll && (
                    useManualEntry ? (
                        <TextField
                            label="To (Email Address)"
                            fullWidth
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                            placeholder="example@company.com"
                            type="email"
                            sx={{ mb: 2 }}
                            helperText="Enter a valid email address"
                        />
                    ) : (
                        <Autocomplete
                            multiple
                            options={availableUsers}
                            getOptionLabel={(option) => `${option.username} (${option.email})`}
                            value={recipients}
                            onChange={(event, newValue) => setRecipients(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="To"
                                    placeholder="Select recipients"
                                    fullWidth
                                />
                            )}
                            sx={{ mb: 2 }}
                        />
                    )
                )}

                {/* Cc/Bcc Toggle Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {!showCc && (
                        <Button size="small" onClick={() => setShowCc(true)}>
                            Add Cc
                        </Button>
                    )}
                    {!showBcc && (
                        <Button size="small" onClick={() => setShowBcc(true)}>
                            Add Bcc
                        </Button>
                    )}
                </Box>

                {/* Cc Field */}
                <Collapse in={showCc}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Autocomplete
                            multiple
                            options={availableUsers}
                            getOptionLabel={(option) => `${option.username} (${option.email})`}
                            value={cc}
                            onChange={(event, newValue) => setCc(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Cc"
                                    placeholder="Carbon copy"
                                    fullWidth
                                />
                            )}
                            sx={{ flex: 1 }}
                        />
                        <IconButton onClick={() => { setCc([]); setShowCc(false); }}>
                            <Clear />
                        </IconButton>
                    </Box>
                </Collapse>

                {/* Bcc Field */}
                <Collapse in={showBcc}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Autocomplete
                            multiple
                            options={availableUsers}
                            getOptionLabel={(option) => `${option.username} (${option.email})`}
                            value={bcc}
                            onChange={(event, newValue) => setBcc(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Bcc"
                                    placeholder="Blind carbon copy"
                                    fullWidth
                                />
                            )}
                            sx={{ flex: 1 }}
                        />
                        <IconButton onClick={() => { setBcc([]); setShowBcc(false); }}>
                            <Clear />
                        </IconButton>
                    </Box>
                </Collapse>

                {/* Subject */}
                <TextField
                    label="Subject"
                    fullWidth
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    sx={{ mb: 2 }}
                    required
                />

                {/* Body */}
                <TextField
                    label="Message"
                    fullWidth
                    multiline
                    rows={12}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your message here..."
                    sx={{ mb: 3 }}
                    required
                />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                        onClick={handleSend}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Email'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Clear />}
                        onClick={handleClear}
                    >
                        Clear
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default ComposeEmail;
