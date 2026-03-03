import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { documentAPI, employeeAPI } from '../services/api';
import {
    Container, Box, Typography, Paper, Button, Grid, Card,
    CardContent, CardActions, Chip, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, MenuItem, Select,
    InputLabel, FormControl, Alert, CircularProgress, Divider,
    Stack, Avatar, Tooltip, LinearProgress, Badge, List,
    ListItem, ListItemButton, ListItemAvatar, ListItemText,
    InputAdornment
} from '@mui/material';
import {
    Upload, Delete, Download, Edit, FolderShared,
    Description, Image, PictureAsPdf, Article,
    CheckCircle, Pending, Search, Close, InsertDriveFile,
    Verified, VerifiedOutlined, Person
} from '@mui/icons-material';

// ── Constants ─────────────────────────────────────────────────────────────────

const DOC_TYPES = ['Resume', 'Certificate', 'ID Proof', 'Offer Letter', 'Experience Letter', 'Other'];

const TYPE_CONFIG = {
    'Resume': { color: '#2563eb', bg: '#eff6ff', icon: '📄' },
    'Certificate': { color: '#7c3aed', bg: '#f5f3ff', icon: '🏆' },
    'ID Proof': { color: '#d97706', bg: '#fffbeb', icon: '🪪' },
    'Offer Letter': { color: '#16a34a', bg: '#f0fdf4', icon: '✉️' },
    'Experience Letter': { color: '#0891b2', bg: '#ecfeff', icon: '💼' },
    'Other': { color: '#6b7280', bg: '#f9fafb', icon: '📁' },
};

const formatBytes = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const getFileIcon = (mimeType = '') => {
    if (mimeType.includes('pdf')) return <PictureAsPdf sx={{ color: '#ef4444' }} />;
    if (mimeType.includes('image')) return <Image sx={{ color: '#3b82f6' }} />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <Article sx={{ color: '#2563eb' }} />;
    return <InsertDriveFile sx={{ color: '#6b7280' }} />;
};

// ── Document Card ─────────────────────────────────────────────────────────────

const DocumentCard = ({ doc, isHR, onDownload, onDelete, onEdit }) => {
    const cfg = TYPE_CONFIG[doc.documentType] || TYPE_CONFIG['Other'];
    return (
        <Card sx={{
            border: `1px solid ${cfg.color}30`,
            borderTop: `4px solid ${cfg.color}`,
            transition: 'all 0.2s',
            '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
        }}>
            <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                    <Box sx={{ bgcolor: cfg.bg, p: 1.5, borderRadius: 2, fontSize: 22, lineHeight: 1 }}>
                        {cfg.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} noWrap title={doc.title}>{doc.title}</Typography>
                        <Chip label={doc.documentType} size="small" sx={{ mt: 0.5, bgcolor: cfg.bg, color: cfg.color, fontWeight: 700 }} />
                    </Box>
                    {doc.isVerified && (
                        <Tooltip title="Verified by HR">
                            <Verified sx={{ color: '#16a34a', fontSize: 20 }} />
                        </Tooltip>
                    )}
                </Box>

                {doc.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }} noWrap>
                        {doc.description}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getFileIcon(doc.mimeType)}
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
                            {doc.originalName}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">{formatBytes(doc.fileSize)}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatDate(doc.createdAt)}</Typography>
                </Box>
            </CardContent>

            <Divider />
            <CardActions sx={{ px: 1.5, py: 1, gap: 0.5 }}>
                <Tooltip title="Download">
                    <Button size="small" startIcon={<Download />} onClick={() => onDownload(doc)} variant="outlined" color="primary" sx={{ flex: 1 }}>
                        Download
                    </Button>
                </Tooltip>
                {isHR && (
                    <>
                        <Tooltip title="Edit">
                            <IconButton size="small" color="info" onClick={() => onEdit(doc)}>
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => onDelete(doc._id)}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </CardActions>
        </Card>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

const DocumentManagement = () => {
    const { user } = useAuth();
    const isHR = user?.role === 'HR' || user?.role === 'Manager';

    const [documents, setDocuments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [empSearch, setEmpSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Upload dialog
    const [uploadDialog, setUploadDialog] = useState(false);
    const [uploadForm, setUploadForm] = useState({ employeeId: '', documentType: 'Other', title: '', description: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef();

    // Edit dialog
    const [editDialog, setEditDialog] = useState(false);
    const [editDoc, setEditDoc] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', description: '', documentType: 'Other', isVerified: false });

    // Download progress
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        fetchDocuments();
        if (isHR) fetchEmployees();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await documentAPI.getAll();
            setDocuments(res.data);
        } catch { setError('Failed to load documents'); }
        finally { setLoading(false); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await employeeAPI.getAll();
            setEmployees(res.data);
        } catch { /* silent */ }
    };

    // ── Computed ────────────────────────────────────────────────────────────

    // Group documents by employeeId for HR view
    const docsByEmp = {};
    documents.forEach(doc => {
        const eid = doc.employeeId?._id;
        if (eid) {
            if (!docsByEmp[eid]) docsByEmp[eid] = [];
            docsByEmp[eid].push(doc);
        }
    });

    const filteredEmployees = employees.filter(emp => {
        const q = empSearch.toLowerCase();
        return (
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
            emp.employeeId?.toLowerCase().includes(q) ||
            emp.department?.toLowerCase().includes(q)
        );
    });

    const displayedDocs = isHR
        ? (selectedEmployee ? docsByEmp[selectedEmployee._id] || [] : documents)
        : documents;

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleDownload = async (doc) => {
        setDownloading(doc._id);
        try {
            const res = await documentAPI.download(doc._id);
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.originalName;
            a.click();
            URL.revokeObjectURL(url);
        } catch { setError('Download failed. File may not exist on server.'); }
        finally { setDownloading(null); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this document? This cannot be undone.')) return;
        try {
            await documentAPI.delete(id);
            setDocuments(prev => prev.filter(d => d._id !== id));
            setSuccess('Document deleted');
        } catch { setError('Failed to delete document'); }
    };

    const handleUpload = async () => {
        if (!selectedFile) { setError('Please select a file'); return; }
        if (!uploadForm.employeeId) { setError('Please select an employee'); return; }
        if (!uploadForm.title.trim()) { setError('Please enter a document title'); return; }

        const form = new FormData();
        form.append('document', selectedFile);
        form.append('employeeId', uploadForm.employeeId);
        form.append('documentType', uploadForm.documentType);
        form.append('title', uploadForm.title);
        form.append('description', uploadForm.description);

        setUploading(true);
        try {
            const res = await documentAPI.upload(form);
            setDocuments(prev => [res.data, ...prev]);
            setSuccess('Document uploaded successfully!');
            setUploadDialog(false);
            setSelectedFile(null);
            setUploadForm({ employeeId: '', documentType: 'Other', title: '', description: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally { setUploading(false); }
    };

    const openEdit = (doc) => {
        setEditDoc(doc);
        setEditForm({ title: doc.title, description: doc.description || '', documentType: doc.documentType, isVerified: doc.isVerified || false });
        setEditDialog(true);
    };

    const handleEdit = async () => {
        try {
            const res = await documentAPI.update(editDoc._id, editForm);
            setDocuments(prev => prev.map(d => d._id === editDoc._id ? res.data : d));
            setSuccess('Document updated');
            setEditDialog(false);
        } catch { setError('Failed to update document'); }
    };

    // ── Stats ────────────────────────────────────────────────────────────────

    const totalByType = {};
    DOC_TYPES.forEach(t => { totalByType[t] = documents.filter(d => d.documentType === t).length; });

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 3 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
            {/* Page Header */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FolderShared sx={{ color: 'primary.main', fontSize: 32 }} />
                        Document Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {documents.length} total documents{isHR && ` · ${employees.length} employees`}
                    </Typography>
                </Box>
                {isHR && (
                    <Button variant="contained" startIcon={<Upload />} onClick={() => setUploadDialog(true)}>
                        Upload Document
                    </Button>
                )}
            </Box>

            {/* Alerts */}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Summary chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {DOC_TYPES.map(type => {
                    const cfg = TYPE_CONFIG[type];
                    const count = totalByType[type];
                    if (!count) return null;
                    return (
                        <Chip
                            key={type}
                            label={`${cfg.icon} ${type}: ${count}`}
                            sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, border: `1px solid ${cfg.color}40` }}
                        />
                    );
                })}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
            ) : (
                <Grid container spacing={2}>
                    {/* ── HR: Employee selector panel ───────────────────── */}
                    {isHR && (
                        <Grid item xs={12} md={3}>
                            <Paper elevation={2} sx={{ height: { md: 'calc(100vh - 220px)' }, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography fontWeight={700} gutterBottom>Employees</Typography>
                                    <TextField
                                        fullWidth size="small"
                                        placeholder="Search employees..."
                                        value={empSearch}
                                        onChange={e => setEmpSearch(e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                                    />
                                </Box>
                                <List sx={{ overflow: 'auto', flex: 1, py: 0 }}>
                                    <ListItem disablePadding>
                                        <ListItemButton
                                            selected={!selectedEmployee}
                                            onClick={() => setSelectedEmployee(null)}
                                            sx={{ '&.Mui-selected': { bgcolor: 'primary.main' + '18' } }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                                    <Person fontSize="small" />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary="All Employees"
                                                secondary={`${documents.length} docs`}
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                                                secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    <Divider />
                                    {filteredEmployees.map(emp => {
                                        const count = (docsByEmp[emp._id] || []).length;
                                        return (
                                            <ListItem key={emp._id} disablePadding>
                                                <ListItemButton
                                                    selected={selectedEmployee?._id === emp._id}
                                                    onClick={() => setSelectedEmployee(emp)}
                                                    sx={{ '&.Mui-selected': { bgcolor: 'primary.main' + '18' } }}
                                                >
                                                    <ListItemAvatar>
                                                        <Badge badgeContent={count} color="primary" max={99}>
                                                            <Avatar sx={{ bgcolor: 'grey.300', width: 32, height: 32, fontSize: 14 }}>
                                                                {emp.firstName?.charAt(0)}
                                                            </Avatar>
                                                        </Badge>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={`${emp.firstName} ${emp.lastName}`}
                                                        secondary={`${emp.employeeId} · ${emp.department}`}
                                                        primaryTypographyProps={{ fontWeight: 500, fontSize: '0.85rem', noWrap: true }}
                                                        secondaryTypographyProps={{ fontSize: '0.72rem', noWrap: true }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Paper>
                        </Grid>
                    )}

                    {/* ── Documents panel ───────────────────────────────── */}
                    <Grid item xs={12} md={isHR ? 9 : 12}>
                        {/* Panel header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography fontWeight={700} color="text.secondary">
                                {isHR && selectedEmployee
                                    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}'s Documents (${displayedDocs.length})`
                                    : `${displayedDocs.length} document${displayedDocs.length !== 1 ? 's' : ''}`}
                            </Typography>
                            {isHR && selectedEmployee && (
                                <Button size="small" variant="outlined" startIcon={<Upload />}
                                    onClick={() => { setUploadForm(p => ({ ...p, employeeId: selectedEmployee._id })); setUploadDialog(true); }}>
                                    Upload for {selectedEmployee.firstName}
                                </Button>
                            )}
                        </Box>

                        {displayedDocs.length === 0 ? (
                            <Paper elevation={1} sx={{ textAlign: 'center', py: 10 }}>
                                <FolderShared sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" fontWeight={600}>No documents yet</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {isHR ? 'Upload the first document using the button above.' : 'Your HR team has not uploaded any documents for you yet.'}
                                </Typography>
                                {isHR && <Button variant="contained" startIcon={<Upload />} onClick={() => setUploadDialog(true)}>Upload Document</Button>}
                            </Paper>
                        ) : (
                            <Grid container spacing={2}>
                                {displayedDocs.map(doc => (
                                    <Grid item xs={12} sm={6} lg={4} xl={3} key={doc._id}>
                                        <DocumentCard
                                            doc={doc}
                                            isHR={isHR}
                                            onDownload={handleDownload}
                                            onDelete={handleDelete}
                                            onEdit={openEdit}
                                        />
                                        {downloading === doc._id && <LinearProgress sx={{ mt: 0.5, borderRadius: 1 }} />}
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            )}

            {/* ══ Upload Dialog ════════════════════════════════════════════════ */}
            <Dialog open={uploadDialog} onClose={() => { setUploadDialog(false); setSelectedFile(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Upload /> Upload Document</Box>
                    <IconButton size="small" onClick={() => { setUploadDialog(false); setSelectedFile(null); }}><Close /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        {/* Employee selector */}
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Employee</InputLabel>
                                <Select
                                    value={uploadForm.employeeId}
                                    label="Employee"
                                    onChange={e => setUploadForm(p => ({ ...p, employeeId: e.target.value }))}
                                >
                                    {employees.map(emp => (
                                        <MenuItem key={emp._id} value={emp._id}>
                                            {emp.firstName} {emp.lastName} — {emp.employeeId} ({emp.department})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Document type */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Document Type</InputLabel>
                                <Select
                                    value={uploadForm.documentType}
                                    label="Document Type"
                                    onChange={e => setUploadForm(p => ({ ...p, documentType: e.target.value }))}
                                >
                                    {DOC_TYPES.map(t => (
                                        <MenuItem key={t} value={t}>{TYPE_CONFIG[t].icon} {t}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Title */}
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Document Title"
                                value={uploadForm.title}
                                onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                                placeholder="e.g. National ID Card"
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Description (optional)"
                                value={uploadForm.description}
                                onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                            />
                        </Grid>

                        {/* File picker */}
                        <Grid item xs={12}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                style={{ display: 'none' }}
                                onChange={e => setSelectedFile(e.target.files[0] || null)}
                            />
                            <Box
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    border: '2px dashed',
                                    borderColor: selectedFile ? 'success.main' : 'divider',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    bgcolor: selectedFile ? '#f0fdf4' : '#fafafa',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: '#eff6ff' }
                                }}
                            >
                                {selectedFile ? (
                                    <>
                                        <CheckCircle sx={{ color: 'success.main', fontSize: 36, mb: 1 }} />
                                        <Typography fontWeight={700} color="success.main">{selectedFile.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{formatBytes(selectedFile.size)}</Typography>
                                    </>
                                ) : (
                                    <>
                                        <Upload sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                                        <Typography fontWeight={600}>Click to select file</Typography>
                                        <Typography variant="caption" color="text.secondary">PDF, DOC, DOCX, JPG, PNG · Max 10MB</Typography>
                                    </>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={() => { setUploadDialog(false); setSelectedFile(null); }} variant="outlined">Cancel</Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={uploading || !selectedFile}
                        startIcon={uploading ? <CircularProgress size={16} /> : <Upload />}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ══ Edit Dialog ══════════════════════════════════════════════════ */}
            <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle fontWeight={700} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Edit Document
                    <IconButton size="small" onClick={() => setEditDialog(false)}><Close /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Title" value={editForm.title}
                                onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select value={editForm.documentType} label="Type"
                                    onChange={e => setEditForm(p => ({ ...p, documentType: e.target.value }))}>
                                    {DOC_TYPES.map(t => <MenuItem key={t} value={t}>{TYPE_CONFIG[t].icon} {t}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={2} label="Description"
                                value={editForm.description}
                                onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                    icon={editForm.isVerified ? <Verified /> : <VerifiedOutlined />}
                                    label={editForm.isVerified ? 'Verified' : 'Mark as Verified'}
                                    color={editForm.isVerified ? 'success' : 'default'}
                                    onClick={() => setEditForm(p => ({ ...p, isVerified: !p.isVerified }))}
                                    clickable
                                />
                                <Typography variant="caption" color="text.secondary">Click to toggle verification</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setEditDialog(false)} variant="outlined">Cancel</Button>
                    <Button onClick={handleEdit} variant="contained">Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DocumentManagement;
