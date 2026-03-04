import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    IconButton,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Stack,
    CircularProgress,
    Alert,
    Tooltip
} from '@mui/material';
import { Add, FilterList, Refresh } from '@mui/icons-material';
import { feedbackAPI } from '../services/api';
import FeedbackCard from '../components/feedback/FeedbackCard';
import FeedbackForm from '../components/feedback/FeedbackForm';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('latest');
    const [category, setCategory] = useState('All');
    const [status, setStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadFeedback();
    }, [sortBy, category, status, searchTerm]);

    const loadFeedback = async () => {
        try {
            setLoading(true);
            const params = {
                sort: sortBy,
                category: category !== 'All' ? category : undefined,
                status: status !== 'All' ? status : undefined,
                search: searchTerm || undefined
            };

            const response = await feedbackAPI.getAll(params);
            setFeedbacks(response.data);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to load feedback'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSubmit = async (formData) => {
        try {
            await feedbackAPI.create(formData);
            setMessage({
                type: 'success',
                text: 'Feedback posted successfully!'
            });
            setOpenForm(false);
            loadFeedback();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to post feedback'
            });
        }
    };

    const handleReact = async (feedbackId, reactionType) => {
        try {
            await feedbackAPI.react(feedbackId, reactionType);
            loadFeedback();
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to add reaction'
            });
        }
    };

    const handleAddComment = async (feedbackId, text) => {
        try {
            await feedbackAPI.addComment(feedbackId, text);
            loadFeedback();
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to add comment'
            });
        }
    };

    const handleDeleteFeedback = async (feedbackId) => {
        if (window.confirm('Are you sure you want to delete this feedback?')) {
            try {
                await feedbackAPI.delete(feedbackId);
                setMessage({
                    type: 'success',
                    text: 'Feedback deleted successfully'
                });
                loadFeedback();
            } catch (error) {
                setMessage({
                    type: 'error',
                    text: 'Failed to delete feedback'
                });
            }
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Company Feedback
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Refresh feedback">
                        <IconButton onClick={loadFeedback} color="default" size="large">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenForm(true)}
                        size="large"
                    >
                        Share Feedback
                    </Button>
                </Box>
            </Box>

            {message.text && (
                <Alert
                    severity={message.type}
                    sx={{ mb: 3 }}
                    onClose={() => setMessage({ type: '', text: '' })}
                >
                    {message.text}
                </Alert>
            )}

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
                {/* Sort Tabs */}
                <Tabs
                    value={sortBy}
                    onChange={(e, newValue) => setSortBy(newValue)}
                    sx={{ mb: 2 }}
                >
                    <Tab label="Latest" value="latest" />
                    <Tab label="Most Popular" value="popular" />
                    <Tab label="Most Discussed" value="discussed" />
                </Tabs>

                {/* Filter Controls */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            label="Category"
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <MenuItem value="All">All Categories</MenuItem>
                            <MenuItem value="General">General</MenuItem>
                            <MenuItem value="HR Policy">HR Policy</MenuItem>
                            <MenuItem value="Work Environment">Work Environment</MenuItem>
                            <MenuItem value="Salary">Salary & Benefits</MenuItem>
                            <MenuItem value="Culture">Company Culture</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value="All">All Status</MenuItem>
                            <MenuItem value="Open">Open</MenuItem>
                            <MenuItem value="Under Review">Under Review</MenuItem>
                            <MenuItem value="Resolved">Resolved</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        placeholder="Search feedback..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ minWidth: 300 }}
                        InputProps={{
                            startAdornment: <FilterList sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                    />
                </Box>
            </Box>

            {/* Feedback Feed */}
            {feedbacks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No feedback found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Be the first to share your thoughts!
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenForm(true)}
                        sx={{ mt: 3 }}
                    >
                        Share Feedback
                    </Button>
                </Box>
            ) : (
                <Stack spacing={3}>
                    {feedbacks.map((feedback) => (
                        <FeedbackCard
                            key={feedback._id}
                            feedback={feedback}
                            onReact={handleReact}
                            onComment={handleAddComment}
                            onDelete={handleDeleteFeedback}
                            onRefresh={loadFeedback}
                        />
                    ))}
                </Stack>
            )}

            {/* Feedback Form Dialog */}
            <FeedbackForm
                open={openForm}
                onClose={() => setOpenForm(false)}
                onSubmit={handleFeedbackSubmit}
            />
        </Container>
    );
};

export default Feedback;
