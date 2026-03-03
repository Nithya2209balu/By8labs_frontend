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
import {
    Add,
    Edit,
    Delete,
    Publish,
    Visibility
} from '@mui/icons-material';
import { jobAPI } from '../../services/recruitmentAPI';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        department: 'IT',
        location: 'Bangalore',
        employmentType: 'Full-time',
        experience: { min: 0, max: 5 },
        skills: '',
        responsibilities: '',
        salary: { min: '', max: '' },
        openings: 1,
        description: '',
        closingDate: ''
    });

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const response = await jobAPI.getAll();
            setJobs(response.data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load jobs' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (job = null) => {
        if (job) {
            setCurrentJob(job);
            setFormData({
                ...job,
                skills: job.skills?.join(', ') || '',
                closingDate: job.closingDate ? new Date(job.closingDate).toISOString().split('T')[0] : ''
            });
        } else {
            setCurrentJob(null);
            setFormData({
                title: '',
                department: 'IT',
                location: 'Bangalore',
                employmentType: 'Full-time',
                experience: { min: 0, max: 5 },
                skills: '',
                responsibilities: '',
                salary: { min: '', max: '' },
                openings: 1,
                description: '',
                closingDate: ''
            });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const jobData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                salary: {
                    min: parseFloat(formData.salary.min) || 0,
                    max: parseFloat(formData.salary.max) || 0
                }
            };

            if (currentJob) {
                await jobAPI.update(currentJob._id, jobData);
                setMessage({ type: 'success', text: 'Job updated successfully' });
            } else {
                await jobAPI.create(jobData);
                setMessage({ type: 'success', text: 'Job created successfully' });
            }

            setDialogOpen(false);
            loadJobs();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save job' });
        }
    };

    const handlePublish = async (id) => {
        try {
            await jobAPI.publish(id);
            setMessage({ type: 'success', text: 'Job published successfully' });
            loadJobs();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to publish job' });
        }
    };

    const handleClose = async (id) => {
        if (window.confirm('Are you sure you want to close this job posting?')) {
            try {
                await jobAPI.close(id);
                setMessage({ type: 'success', text: 'Job closed successfully' });
                loadJobs();
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to close job' });
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Draft': 'default',
            'Published': 'success',
            'Closed': 'error',
            'On-Hold': 'warning'
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

            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ mb: 2 }}
            >
                Create Job Posting
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Job ID</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Openings</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">Loading...</TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No jobs found</TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job._id}>
                                    <TableCell>{job.jobId}</TableCell>
                                    <TableCell>{job.title}</TableCell>
                                    <TableCell>{job.department}</TableCell>
                                    <TableCell>{job.location}</TableCell>
                                    <TableCell>{job.openings}</TableCell>
                                    <TableCell>
                                        <Chip label={job.status} color={getStatusColor(job.status)} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleOpenDialog(job)}>
                                            <Edit />
                                        </IconButton>
                                        {job.status === 'Draft' && (
                                            <IconButton size="small" color="success" onClick={() => handlePublish(job._id)}>
                                                <Publish />
                                            </IconButton>
                                        )}
                                        {job.status === 'Published' && (
                                            <IconButton size="small" color="error" onClick={() => handleClose(job._id)}>
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Job Form Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{currentJob ? 'Edit Job' : 'Create Job Posting'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Job Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            select
                            label="Department"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            fullWidth
                        >
                            {['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Support', 'Management'].map((dept) => (
                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Employment Type"
                            value={formData.employmentType}
                            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                            fullWidth
                        >
                            {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Min Experience (years)"
                                type="number"
                                value={formData.experience.min}
                                onChange={(e) => setFormData({ ...formData, experience: { ...formData.experience, min: parseInt(e.target.value) } })}
                                fullWidth
                            />
                            <TextField
                                label="Max Experience (years)"
                                type="number"
                                value={formData.experience.max}
                                onChange={(e) => setFormData({ ...formData, experience: { ...formData.experience, max: parseInt(e.target.value) } })}
                                fullWidth
                            />
                        </Box>
                        <TextField
                            label="Skills (comma-separated)"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            fullWidth
                            placeholder="JavaScript, React, Node.js"
                        />
                        <TextField
                            label="Responsibilities"
                            value={formData.responsibilities}
                            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                            multiline
                            rows={3}
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Min Salary (₹)"
                                type="number"
                                value={formData.salary.min}
                                onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, min: e.target.value } })}
                                fullWidth
                            />
                            <TextField
                                label="Max Salary (₹)"
                                type="number"
                                value={formData.salary.max}
                                onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, max: e.target.value } })}
                                fullWidth
                            />
                        </Box>
                        <TextField
                            label="Number of Openings"
                            type="number"
                            value={formData.openings}
                            onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) })}
                            fullWidth
                        />
                        <TextField
                            label="Closing Date"
                            type="date"
                            value={formData.closingDate}
                            onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Job Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={4}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default JobList;
