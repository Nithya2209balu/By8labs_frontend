import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Grid,
    Tab,
    Tabs,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem
} from '@mui/material';
import {
    VideoCall,
    PersonPin,
    Phone,
    CalendarToday,
    Add,
    Download
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { interviewAPI, candidateAPI, jobAPI } from '../../services/recruitmentAPI';
import api from '../../services/api';

const InterviewCalendar = () => {
    const { user, isHR } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [publicFeed, setPublicFeed] = useState([]);
    const [myInterviews, setMyInterviews] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);
    const [scheduleDialog, setScheduleDialog] = useState(false);
    const [formData, setFormData] = useState({
        candidateId: '',
        jobId: '',
        round: 'HR',
        scheduledDate: '',
        scheduledTime: '',
        mode: 'Video Call',
        duration: 60,
        assignedInterviewer: '',
        meetingLink: ''
    });

    useEffect(() => {
        loadData();
    }, [tabValue]);

    useEffect(() => {
        if (isHR) {
            loadHRData();
        }
    }, [isHR]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (tabValue === 0) {
                const response = await interviewAPI.getPublicFeed();
                setPublicFeed(response.data);
            } else if (tabValue === 1) {
                const response = await interviewAPI.getMyInterviews();
                setMyInterviews(response.data);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load interviews' });
        } finally {
            setLoading(false);
        }
    };

    const loadHRData = async () => {
        try {
            const [candidatesRes, jobsRes, employeesRes] = await Promise.all([
                candidateAPI.getAll(),  // Load all candidates, not just Interview status
                jobAPI.getAll({ status: 'Published' }),
                api.get('/employees')
            ]);
            setCandidates(candidatesRes.data);
            setJobs(jobsRes.data);
            setEmployees(employeesRes.data);

            // Debug: Show if data is empty
            if (!candidatesRes.data || candidatesRes.data.length === 0) {
                setMessage({ type: 'warning', text: 'No candidates found. Please add candidates first.' });
            }
        } catch (error) {
            console.error('Failed to load HR data:', error);
            setMessage({ type: 'error', text: 'Failed to load candidates, jobs, or employees. Please try again.' });
        }
    };

    const handleScheduleInterview = async () => {
        try {
            await interviewAPI.create(formData);
            setMessage({ type: 'success', text: 'Interview scheduled successfully' });
            setScheduleDialog(false);
            setFormData({
                candidateId: '',
                jobId: '',
                round: 'HR',
                scheduledDate: '',
                scheduledTime: '',
                mode: 'Video Call',
                duration: 60,
                assignedInterviewer: '',
                meetingLink: ''
            });
            loadData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to schedule interview' });
        }
    };

    const handleDownloadResume = async (candidateId, candidateName) => {
        try {
            const response = await candidateAPI.downloadResume(candidateId);

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${candidateName}_resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Resume downloaded successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to download resume' });
        }
    };

    const getModeIcon = (mode) => {
        switch (mode) {
            case 'Video Call':
                return <VideoCall />;
            case 'In-person':
                return <PersonPin />;
            case 'Phone':
                return <Phone />;
            default:
                return <CalendarToday />;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const InterviewCard = ({ interview, showFullDetails = false }) => (
        <Card sx={{ mb: 2, border: interview.isAssignedToMe ? '2px solid #1976d2' : 'none' }}>
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Candidate</Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {showFullDetails
                                ? `${interview.candidateId?.firstName} ${interview.candidateId?.lastName}`
                                : interview.candidateName}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle2" color="text.secondary">Job</Typography>
                        <Typography variant="body2">
                            {interview.jobTitle || interview.jobId?.title}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle2" color="text.secondary">Date & Time</Typography>
                        <Typography variant="body2">{formatDate(interview.scheduledDate || interview.interviewDate)}</Typography>
                        <Typography variant="caption">{interview.scheduledTime || interview.interviewTime}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle2" color="text.secondary">Mode</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getModeIcon(interview.mode)}
                            <Typography variant="body2">{interview.mode}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Typography variant="subtitle2" color="text.secondary">Round</Typography>
                        <Chip label={interview.round} size="small" color="primary" variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={1}>
                        {interview.isAssignedToMe && (
                            <Chip label="Your Interview" size="small" color="primary" />
                        )}
                        {interview.assignedTo && !interview.isAssignedToMe && (
                            <Typography variant="caption">
                                Assigned: {interview.assignedTo}
                            </Typography>
                        )}
                    </Grid>
                </Grid>

                {showFullDetails && interview.candidateId && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                <Typography variant="body2">{interview.candidateId?.email}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                                <Typography variant="body2">{interview.candidateId?.phone}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">Experience</Typography>
                                <Typography variant="body2">{interview.candidateId?.experience} years</Typography>
                            </Grid>
                            {interview.candidateId?.resume?.fileName && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Resume</Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Download />}
                                        onClick={() => handleDownloadResume(
                                            interview.candidateId._id,
                                            `${interview.candidateId.firstName}_${interview.candidateId.lastName}`
                                        )}
                                    >
                                        Download Resume
                                    </Button>
                                </Grid>
                            )}
                            {interview.meetingLink && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Meeting Link</Typography>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => window.open(interview.meetingLink, '_blank')}
                                    >
                                        Join Meeting
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Box>
            {message.text && (
                <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            {isHR && (
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setScheduleDialog(true)}
                    sx={{ mb: 2 }}
                >
                    Schedule Interview
                </Button>
            )}

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                <Tab label="Public Interview Feed" />
                <Tab label="My Assigned Interviews" />
            </Tabs>

            {tabValue === 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        📅 Upcoming Interviews
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        View all scheduled interviews across the organization
                    </Typography>

                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : publicFeed.length === 0 ? (
                        <Typography>No upcoming interviews scheduled</Typography>
                    ) : (
                        publicFeed.map((interview) => (
                            <InterviewCard key={interview._id} interview={interview} />
                        ))
                    )}
                </Box>
            )}

            {tabValue === 1 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        📋 My Assigned Interviews
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Interviews where you are the assigned interviewer
                    </Typography>

                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : myInterviews.length === 0 ? (
                        <Alert severity="info">
                            No interviews assigned to you yet
                        </Alert>
                    ) : (
                        myInterviews.map((interview) => (
                            <InterviewCard
                                key={interview._id}
                                interview={interview}
                                showFullDetails={true}
                            />
                        ))
                    )}
                </Box>
            )}

            <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Schedule Interview</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            select
                            label="Candidate"
                            value={formData.candidateId}
                            onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                            required
                            fullWidth
                        >
                            {candidates.map((cand) => (
                                <MenuItem key={cand._id} value={cand._id}>
                                    {cand.firstName} {cand.lastName} - {cand.jobId?.title}
                                </MenuItem>
                            ))}
                        </TextField>
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
                            select
                            label="Interview Round"
                            value={formData.round}
                            onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                            fullWidth
                        >
                            {['HR', 'Technical', 'Managerial', 'Final'].map((round) => (
                                <MenuItem key={round} value={round}>{round}</MenuItem>
                            ))}
                        </TextField>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    type="date"
                                    label="Interview Date"
                                    value={formData.scheduledDate}
                                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                    required
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    type="time"
                                    label="Interview Time"
                                    value={formData.scheduledTime}
                                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                                    required
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            select
                            label="Interview Mode"
                            value={formData.mode}
                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                            fullWidth
                        >
                            {['Video Call', 'In-person', 'Phone'].map((mode) => (
                                <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="Assign Interviewer"
                            value={formData.assignedInterviewer}
                            onChange={(e) => setFormData({ ...formData, assignedInterviewer: e.target.value })}
                            required
                            fullWidth
                            helperText="Select employee who will conduct this interview"
                        >
                            {employees.map((emp) => (
                                <MenuItem key={emp._id} value={emp._id}>
                                    {emp.firstName} {emp.lastName} ({emp.department})
                                </MenuItem>
                            ))}
                        </TextField>
                        {formData.mode === 'Video Call' && (
                            <TextField
                                label="Meeting Link"
                                value={formData.meetingLink}
                                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                fullWidth
                                placeholder="https://meet.google.com/..."
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
                    <Button onClick={handleScheduleInterview} variant="contained">Schedule</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InterviewCalendar;
