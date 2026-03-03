import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    IconButton,
    Grid,
    Card,
    CardMedia,
    CardActions
} from '@mui/material';
import { Close, CloudUpload, Delete } from '@mui/icons-material';

const AnnouncementForm = ({ open, onClose, onSubmit, announcement = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: ''
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [existingVideos, setExistingVideos] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);
    const [removedVideos, setRemovedVideos] = useState([]);

    useEffect(() => {
        if (announcement) {
            setFormData({
                title: announcement.title || '',
                message: announcement.message || ''
            });
            setExistingImages(announcement.images || []);
            setExistingVideos(announcement.videos || []);
            setSelectedImages([]);
            setSelectedVideos([]);
            setRemovedImages([]);
            setRemovedVideos([]);
        } else {
            resetForm();
        }
    }, [announcement, open]);

    const resetForm = () => {
        setFormData({ title: '', message: '' });
        setSelectedImages([]);
        setSelectedVideos([]);
        setExistingImages([]);
        setExistingVideos([]);
        setRemovedImages([]);
        setRemovedVideos([]);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages([...selectedImages, ...files]);
    };

    const handleVideoSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedVideos([...selectedVideos, ...files]);
    };

    const removeNewImage = (index) => {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
    };

    const removeNewVideo = (index) => {
        setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
    };

    const removeExistingImage = (image) => {
        setExistingImages(existingImages.filter(img => img !== image));
        setRemovedImages([...removedImages, image]);
    };

    const removeExistingVideo = (video) => {
        setExistingVideos(existingVideos.filter(vid => vid !== video));
        setRemovedVideos([...removedVideos, video]);
    };

    const handleSubmit = () => {
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('message', formData.message);

        // Add new images
        selectedImages.forEach(image => {
            submitData.append('images', image);
        });

        // Add new videos
        selectedVideos.forEach(video => {
            submitData.append('videos', video);
        });

        // Add removed files info (for update only)
        if (announcement) {
            submitData.append('removedImages', JSON.stringify(removedImages));
            submitData.append('removedVideos', JSON.stringify(removedVideos));
        }

        onSubmit(submitData);
        resetForm();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        {announcement ? 'Edit Announcement' : 'Create New Announcement'}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Title */}
                    <TextField
                        name="title"
                        label="Title *"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    {/* Message */}
                    <TextField
                        name="message"
                        label="Message"
                        value={formData.message}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        fullWidth
                    />

                    {/* Image Upload */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Images
                        </Typography>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUpload />}
                        >
                            Upload Images
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                        </Button>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Existing Images:
                                </Typography>
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    {existingImages.map((image, index) => (
                                        <Grid item xs={6} sm={4} key={index}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="100"
                                                    image={`https://by8labs-backend.onrender.com/${image}`}
                                                    alt={`Existing ${index}`}
                                                />
                                                <CardActions>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => removeExistingImage(image)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* New Images Preview */}
                        {selectedImages.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    New Images ({selectedImages.length}):
                                </Typography>
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    {selectedImages.map((image, index) => (
                                        <Grid item xs={6} sm={4} key={index}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="100"
                                                    image={URL.createObjectURL(image)}
                                                    alt={`Preview ${index}`}
                                                />
                                                <CardActions>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => removeNewImage(index)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Box>

                    {/* Video Upload */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            Videos
                        </Typography>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUpload />}
                        >
                            Upload Videos
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="video/*"
                                onChange={handleVideoSelect}
                            />
                        </Button>

                        {/* Existing Videos */}
                        {existingVideos.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Existing Videos:
                                </Typography>
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    {existingVideos.map((video, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <Card>
                                                <video width="100%" height="150" controls>
                                                    <source src={`https://by8labs-backend.onrender.com/${video}`} type="video/mp4" />
                                                </video>
                                                <CardActions>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => removeExistingVideo(video)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        {/* New Videos Preview */}
                        {selectedVideos.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    New Videos ({selectedVideos.length}):
                                </Typography>
                                <Grid container spacing={1} sx={{ mt: 1 }}>
                                    {selectedVideos.map((video, index) => (
                                        <Grid item xs={12} sm={6} key={index}>
                                            <Card>
                                                <video width="100%" height="150" controls>
                                                    <source src={URL.createObjectURL(video)} type="video/mp4" />
                                                </video>
                                                <CardActions>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => removeNewVideo(index)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!formData.title.trim()}
                >
                    {announcement ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AnnouncementForm;
