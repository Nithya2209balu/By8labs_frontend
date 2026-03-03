import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Typography,
    Alert
} from '@mui/material';
import { Add, Edit, Delete, Check, Close, UploadFile, CheckCircle } from '@mui/icons-material';
import { candidateAPI, jobAPI } from '../../services/recruitmentAPI';

const CandidateList = () => {
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        jobId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        experience: 0,
        currentCompany: '',
        expectedSalary: '',
        skills: '',
        source: 'Direct'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [candidatesRes, jobsRes] = await Promise.all([
                candidateAPI.getAll(),
                jobAPI.getAll({ status: 'Published' })
            ]);
            setCandidates(candidatesRes.data);
            setJobs(jobsRes.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const candidateData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                expectedSalary: parseFloat(formData.expectedSalary) || 0
            };

            // Create candidate first
            const response = await candidateAPI.create(candidateData);
            const newCandidate = response.data;

            // If resume file selected, upload it
            if (selectedFile) {
                const resumeFormData = new FormData();
                resumeFormData.append('resume', selectedFile);
                await candidateAPI.uploadResume(newCandidate._id, resumeFormData);
            }

            setMessage({ type: 'success', text: 'Candidate added successfully' + (selectedFile ? ' with resume' : '') });
            setDialogOpen(false);
            setSelectedFile(null);
            loadData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add candidate' });
        }
    };

    const handleScreen = async (id, shortlisted) => {
        try {
            await candidateAPI.screen(id, { shortlisted });
            setMessage({ type: 'success', text: `Candidate ${shortlisted ? 'shortlisted' : 'rejected'}` });
            loadData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to screen candidate' });
        }
    };

    const handleOpenUploadDialog = (candidate) => {
        setSelectedCandidate(candidate);
        setSelectedFile(null);
        setUploadDialogOpen(true);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type - PDF only
            if (file.type !== 'application/pdf') {
                setMessage({ type: 'error', text: 'Only PDF files are allowed' });
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'File size must be less than 5MB' });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUploadResume = async () => {
        if (!selectedFile || !selectedCandidate) return;

        try {
            const formData = new FormData();
            formData.append('resume', selectedFile);

            await candidateAPI.uploadResume(selectedCandidate._id, formData);
            setMessage({ type: 'success', text: 'Resume uploaded successfully' });
            setUploadDialogOpen(false);
            setSelectedFile(null);
            loadData();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload resume' });
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'New': 'info',
            'Screening': 'warning',
            'Interview': 'primary',
            'Evaluation': 'secondary',
            'Offered': 'success',
            'Rejected': 'error',
            'Hired': 'success'
        };
        return colors[status] || 'default';
    };

    return (
        <Box>
            {message.text && (
                <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ mb: 2 }}>
                Add Candidate
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Job</TableCell>
                            <TableCell>Experience</TableCell>
                            <TableCell>Resume</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={8} align="center">Loading...</TableCell></TableRow>
                        ) : candidates.length === 0 ? (
                            <TableRow><TableCell colSpan={8} align="center">No candidates found</TableCell></TableRow>
                        ) : (
                            candidates.map((cand) => (
                                <TableRow key={cand._id}>
                                    <TableCell>{cand.candidateId}</TableCell>
                                    <TableCell>{cand.firstName} {cand.lastName}</TableCell>
                                    <TableCell>{cand.email}</TableCell>
                                    <TableCell>{cand.jobId?.title || 'N/A'}</TableCell>
                                    <TableCell>{cand.experience} yrs</TableCell>
                                    <TableCell>
                                        {cand.resume?.fileName ? (
                                            <Chip
                                                icon={<CheckCircle />}
                                                label="Uploaded"
                                                color="success"
                                                size="small"
                                            />
                                        ) : (
                                            <Button
                                                size="small"
                                                startIcon={<UploadFile />}
                                                onClick={() => handleOpenUploadDialog(cand)}
                                            >
                                                Upload
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={cand.status} color={getStatusColor(cand.status)} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        {cand.status === 'New' && (
                                            <>
                                                <IconButton size="small" color="success" onClick={() => handleScreen(cand._id, true)}>
                                                    <Check />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleScreen(cand._id, false)}>
                                                    <Close />
                                                </IconButton>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Candidate</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            select
                            label="Job Position"
                            value={formData.jobId}
                            onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                            required
                            fullWidth
                        >
                            {jobs.map((job) => (
                                <MenuItem key={job._id} value={job._id}>{job.title}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Experience (years)"
                            type="number"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                            fullWidth
                        />
                        <TextField
                            label="Expected Salary (₹)"
                            type="number"
                            value={formData.expectedSalary}
                            onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Skills (comma-separated)"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            fullWidth
                        />
                        <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Resume Upload (PDF only)
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<UploadFile />}
                                sx={{ mb: 1 }}
                            >
                                {selectedFile ? selectedFile.name : 'Choose PDF Resume'}
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                />
                            </Button>
                            <Typography variant="caption" color="text.secondary">
                                Upload candidate resume in PDF format only (Max 5MB)
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Resume Upload Dialog */}
            <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload Resume</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                            Candidate: <strong>{selectedCandidate?.firstName} {selectedCandidate?.lastName}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                            Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                        </Typography>

                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<UploadFile />}
                        >
                            {selectedFile ? selectedFile.name : 'Choose File'}
                            <input
                                type="file"
                                hidden
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleUploadResume}
                        variant="contained"
                        disabled={!selectedFile}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CandidateList;
