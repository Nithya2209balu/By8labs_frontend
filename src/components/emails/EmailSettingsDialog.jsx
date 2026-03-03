import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, CloudDone, Error as ErrorIcon } from '@mui/icons-material';
import { emailConfigAPI } from '../../services/api';

const EmailSettingsDialog = ({ open, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        provider: 'Hostinger',
        email: '',
        password: '',
        smtpHost: 'smtp.hostinger.com',
        smtpPort: 465,
        imapHost: 'imap.hostinger.com',
        imapPort: 993
    });

    useEffect(() => {
        if (open) {
            loadConfig();
        }
    }, [open]);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const response = await emailConfigAPI.getConfig();
            const config = response.data;

            if (config.isConfigured) {
                setFormData(prev => ({
                    ...prev,
                    ...config,
                    password: '' // Don't show encrypted password
                }));
            } else {
                // Reset to Hostinger defaults if not configured
                handleProviderChange({ target: { value: 'Hostinger' } });
            }
        } catch (error) {
            console.error('Error loading config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProviderChange = (e) => {
        const provider = e.target.value;
        let newConfig = { provider };

        if (provider === 'Hostinger') {
            newConfig = {
                ...newConfig,
                smtpHost: 'smtp.hostinger.com',
                smtpPort: 465,
                imapHost: 'imap.hostinger.com',
                imapPort: 993
            };
        } else if (provider === 'Gmail') {
            newConfig = {
                ...newConfig,
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                imapHost: 'imap.gmail.com',
                imapPort: 993
            };
        }

        setFormData(prev => ({ ...prev, ...newConfig }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTest = async () => {
        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Email and Password are required for testing' });
            return;
        }

        try {
            setTesting(true);
            setMessage({ type: 'info', text: 'Testing connection...' });
            await emailConfigAPI.testConfig(formData);
            setMessage({ type: 'success', text: 'Connection successful!' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Connection failed'
            });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Email and Password are required' });
            return;
        }

        try {
            setLoading(true);
            await emailConfigAPI.saveConfig(formData);
            onSave();
            onClose();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to save settings'
            });
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Email Settings</DialogTitle>
            <DialogContent dividers>
                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 2 }}>
                        {message.text}
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Email Provider</InputLabel>
                            <Select
                                name="provider"
                                value={formData.provider}
                                label="Email Provider"
                                onChange={handleProviderChange}
                            >
                                <MenuItem value="Hostinger">Hostinger</MenuItem>
                                <MenuItem value="Gmail">Gmail</MenuItem>
                                <MenuItem value="Custom">Custom / Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            helperText={formData.provider === 'Gmail' ? 'Use your Gmail address' : 'e.g. info@yourdomain.com'}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label={formData.provider === 'Gmail' ? "App Password" : "Password"}
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            helperText={
                                formData.provider === 'Gmail'
                                    ? 'Use an App Password, not your login password.'
                                    : 'Your email account password.'
                            }
                        />
                    </Grid>

                    {formData.provider === 'Custom' && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>SMTP (Sending) Settings</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth
                                    label="SMTP Host"
                                    name="smtpHost"
                                    value={formData.smtpHost}
                                    onChange={handleChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Port"
                                    name="smtpPort"
                                    value={formData.smtpPort}
                                    onChange={handleChange}
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>IMAP (Receiving) Settings</Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth
                                    label="IMAP Host"
                                    name="imapHost"
                                    value={formData.imapHost}
                                    onChange={handleChange}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Port"
                                    name="imapPort"
                                    value={formData.imapPort}
                                    onChange={handleChange}
                                    size="small"
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading || testing}>Cancel</Button>
                <Button
                    onClick={handleTest}
                    disabled={loading || testing || !formData.password}
                    color="secondary"
                >
                    {testing ? <CircularProgress size={24} /> : 'Test Connection'}
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading || testing || !formData.password}
                >
                    {loading ? <CircularProgress size={24} /> : 'Save Settings'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EmailSettingsDialog;
