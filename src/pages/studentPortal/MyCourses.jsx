import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, CardMedia,
    Button, CircularProgress, Alert, Chip
} from '@mui/material';
import { MenuBook, AccessTime } from '@mui/icons-material';
import { enrollmentAPI } from '../../services/studentPortalAPI';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                setLoading(true);
                const res = await enrollmentAPI.getMyCourses();
                if (res.data.success) {
                    setEnrollments(res.data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch enrollments:', err);
                setError(err.response?.data?.message || 'Failed to load your courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyCourses();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    My Enrolled Courses
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Continue learning from where you left off.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {enrollments.length === 0 ? (
                <Box textAlign="center" py={5}>
                    <MenuBook sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        You haven't enrolled in any courses yet.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/student-courses')}>
                        Browse Course Catalog
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={4}>
                    {enrollments.map((enrollment) => {
                        const course = enrollment.course || {};
                        return (
                            <Grid item xs={12} sm={6} md={4} key={enrollment._id}>
                                <Card 
                                    sx={{ 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="160"
                                        image={course.thumbnail || 'https://via.placeholder.com/400x200?text=Course+Thumbnail'}
                                        alt={course.title}
                                    />
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                            <Chip 
                                                label={course.category?.name || course.category || 'General'} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined" 
                                                sx={{ mb: 1 }}
                                            />
                                            <Chip label="Enrolled" size="small" color="success" />
                                        </Box>
                                        
                                        <Typography gutterBottom variant="h6" component="h2" fontWeight="bold">
                                            {course.title || 'Course Title Missing'}
                                        </Typography>
                                        
                                        <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {course.description || "Learn at your own pace."}
                                        </Typography>
                                        
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
                                            <Box display="flex" alignItems="center" color="text.secondary">
                                                <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                                                <Typography variant="caption">Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</Typography>
                                            </Box>
                                        </Box>

                                        <Button 
                                            variant="contained" 
                                            fullWidth 
                                            onClick={() => navigate(`/student-courses/${course._id}`)}
                                        >
                                            Continue Learning
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
};

export default MyCourses;
