import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    IconButton,
    Chip,
    Alert
} from '@mui/material';
import {
    Image as ImageIcon,
    VideoLibrary,
    Close,
    CloudUpload
} from '@mui/icons-material';

const FeedbackForm = ({ open, onClose, onSubmit }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('General');
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [error, setError] = useState('');

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            const isImage = file.type.startsWith('image/');
            const isSizeOk = file.size <= 10 * 1024 * 1024; // 10MB

            if (!isImage) {
                setError('Only image files are allowed');
                return false;
            }
            if (!isSizeOk) {
                setError('Image size must be less than 10MB');
                return false;
            }
            return true;
        });

        setSelectedImages([...selectedImages, ...validFiles]);
        setError('');
    };

    const handleVideoUpload = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            const isVideo = file.type.startsWith('video/');
            const isSizeOk = file.size <= 50 * 1024 * 1024; // 50MB

            if (!isVideo) {
                setError('Only video files are allowed');
                return false;
            }
            if (!isSizeOk) {
                setError('Video size must be less than 50MB');
                return false;
            }
            return true;
        });

        setSelectedVideos([...selectedVideos, ...validFiles]);
        setError('');
    };

    const handleRemoveImage = (index) => {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
    };

    const handleRemoveVideo = (index) => {
        setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!subject.trim() || !message.trim()) {
            setError('Subject and message are required');
            return;
        }

        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('message', message);
        formData.append('category', category);

        // Append images
        selectedImages.forEach(image => {
            formData.append('images', image);
        });

        // Append videos
        selectedVideos.forEach(video => {
            formData.append('videos', video);
        });

        onSubmit(formData);
        handleClose();
    };

    const handleClose = () => {
        setSubject('');
        setMessage('');
        setCategory('General');
        setSelectedImages([]);
        setSelectedVideos([]);
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Share Your Feedback
                <Typography variant="caption" display="block" color="text.secondary">
                    Your feedback helps us improve the workplace for everyone
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    label="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief title for your feedback"
                    sx={{ mb: 2, mt: 1 }}
                    required
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={category}
                        label="Category"
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="HR Policy">HR Policy</MenuItem>
                        <MenuItem value="Work Environment">Work Environment</MenuItem>
                        <MenuItem value="Salary">Salary & Benefits</MenuItem>
                        <MenuItem value="Culture">Company Culture</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts, suggestions, or concerns..."
                    sx={{ mb: 3 }}
                    required
                />

                {/* Image Upload Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon fontSize="small" />
                        Attach Images (Optional)
                    </Typography>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        sx={{ mb: 1 }}
                    >
                        Choose Images
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </Button>

                    {/* Image Preview */}
                    {selectedImages.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {selectedImages.map((image, index) => (
                                <Chip
                                    key={index}
                                    label={image.name}
                                    onDelete={() => handleRemoveImage(index)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Video Upload Section */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideoLibrary fontSize="small" />
                        Attach Videos (Optional)
                    </Typography>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                        sx={{ mb: 1 }}
                    >
                        Choose Videos
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="video/*"
                            onChange={handleVideoUpload}
                        />
                    </Button>

                    {/* Video Preview */}
                    {selectedVideos.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {selectedVideos.map((video, index) => (
                                <Chip
                                    key={index}
                                    label={video.name}
                                    onDelete={() => handleRemoveVideo(index)}
                                    color="secondary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Images: Max 10MB each | Videos: Max 50MB each
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!subject.trim() || !message.trim()}
                >
                    Post Feedback
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FeedbackForm;
