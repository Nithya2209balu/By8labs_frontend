import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, CardMedia,
    Chip, Button, CircularProgress, Alert, Tabs, Tab, Dialog,
    DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import { MenuBook, AccessTime, Star, CheckCircle, Refresh } from '@mui/icons-material';
import { courseAPI } from '../../services/studentPortalAPI';
import { useNavigate } from 'react-router-dom';

const CourseCatalog = () => {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Enrollment state
    const [enrollingMap, setEnrollingMap] = useState({});
    const [successMsg, setSuccessMsg] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [coursesRes, categoriesRes] = await Promise.allSettled([
                    courseAPI.getAllCourses(),
                    courseAPI.getCategories()
                ]);

                if (coursesRes.status === 'fulfilled' && coursesRes.value?.data?.success) {
                    setCourses(coursesRes.value.data.data || []);
                } else if (coursesRes.status === 'fulfilled') {
                    const data = coursesRes.value?.data;
                    if (Array.isArray(data)) setCourses(data);
                    else if (Array.isArray(data?.data)) setCourses(data.data);
                    else if (Array.isArray(data?.courses)) setCourses(data.courses);
                    else if (typeof data === 'object') {
                        setCourses(Object.values(data).find(Array.isArray) || []);
                    }
                } else if (coursesRes.status === 'rejected') {
                    console.error('Failed to fetch courses:', coursesRes.reason);
                    setError('Failed to load courses. Please try again later.');
                }
                
                let catData = [];
                if (categoriesRes.status === 'fulfilled') {
                    const data = categoriesRes.value?.data;
                    if (Array.isArray(data)) catData = data;
                    else if (Array.isArray(data?.data)) catData = data.data;
                    else if (Array.isArray(data?.categories)) catData = data.categories;
                    else if (typeof data === 'object') {
                        // find the first array value in the object
                        catData = Object.values(data).find(Array.isArray) || [];
                    }
                } else {
                    console.error('Failed to fetch categories:', categoriesRes.reason);
                }

                setCategories(['All', ...catData.map(c => 
                    (typeof c === 'string' ? c : c?.name || c?.categoryName || c?.title || 'Unknown')
                ).filter(Boolean)]);
                
            } catch (err) {
                console.error('Failed to fetch catalog:', err);
                setError('An unexpected error occurred. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        setError('');
        try {
            const [coursesRes, categoriesRes] = await Promise.allSettled([
                courseAPI.getAllCourses(),
                courseAPI.getCategories()
            ]);

            if (coursesRes.status === 'fulfilled' && coursesRes.value?.data?.success) {
                setCourses(coursesRes.value.data.data || []);
            } else if (coursesRes.status === 'fulfilled') {
                const data = coursesRes.value?.data;
                if (Array.isArray(data)) setCourses(data);
                else if (Array.isArray(data?.data)) setCourses(data.data);
                else if (Array.isArray(data?.courses)) setCourses(data.courses);
                else if (typeof data === 'object') {
                    setCourses(Object.values(data).find(Array.isArray) || []);
                }
            } else {
                setError('Failed to refresh courses.');
            }

            let catData = [];
            if (categoriesRes.status === 'fulfilled') {
                const data = categoriesRes.value?.data;
                if (Array.isArray(data)) catData = data;
                else if (Array.isArray(data?.data)) catData = data.data;
                else if (Array.isArray(data?.categories)) catData = data.categories;
                else if (typeof data === 'object') {
                    catData = Object.values(data).find(Array.isArray) || [];
                }
                setCategories(['All', ...catData.map(c => 
                    (typeof c === 'string' ? c : c?.name || c?.categoryName || c?.title || 'Unknown')
                ).filter(Boolean)]);
            }

        } catch (err) {
            setError('Refresh failed.');
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = selectedCategory === 'All' 
        ? courses 
        : courses.filter(c => c.category === selectedCategory || c.category?.name === selectedCategory);

    const handleCategoryChange = (event, newValue) => {
        setSelectedCategory(newValue);
    };

    const handleEnroll = async (courseId) => {
        try {
            setEnrollingMap(prev => ({ ...prev, [courseId]: true }));
            const res = await courseAPI.enrollCourse(courseId);
            setSuccessMsg('Successfully enrolled in the course!');
            
            // Re-fetch courses so that the "isEnrolled" tag updates
            const updated = await courseAPI.getAllCourses();
            if (updated.data.success) {
                setCourses(updated.data.data || []);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enroll in the course.');
        } finally {
            setEnrollingMap(prev => ({ ...prev, [courseId]: false }));
            // clear success/error msgs after 3 seconds
            setTimeout(() => { setError(''); setSuccessMsg(''); }, 3000);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Course Catalog
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Browse and enroll in available courses to upgrade your skills.
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<Refresh />} 
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                    value={selectedCategory} 
                    onChange={handleCategoryChange} 
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {categories.map((cat, idx) => (
                        <Tab label={cat} value={cat} key={idx} sx={{ fontWeight: 600 }} />
                    ))}
                </Tabs>
            </Box>

            {filteredCourses.length === 0 ? (
                <Box textAlign="center" py={5}>
                    <MenuBook sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No courses available in this category.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={4}>
                    {filteredCourses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} key={course._id}>
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
                                        {course.isEnrolled && (
                                            <Chip 
                                                label="Enrolled" 
                                                size="small" 
                                                color="success" 
                                                icon={<CheckCircle />}
                                            />
                                        )}
                                    </Box>
                                    
                                    <Typography gutterBottom variant="h6" component="h2" fontWeight="bold">
                                        {course.title}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {course.description}
                                    </Typography>
                                    
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
                                        <Box display="flex" alignItems="center" color="text.secondary">
                                            <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="caption">{course.duration || 'Flexible'}</Typography>
                                        </Box>
                                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                            {course.price > 0 ? `₹${course.price}` : 'Free'}
                                        </Typography>
                                    </Box>

                                    {course.isEnrolled ? (
                                        <Button 
                                            variant="contained" 
                                            fullWidth 
                                            onClick={() => navigate(`/student-courses/${course._id}`)}
                                        >
                                            Go to Course
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="outlined" 
                                            fullWidth 
                                            onClick={() => handleEnroll(course._id)}
                                            disabled={enrollingMap[course._id]}
                                        >
                                            {enrollingMap[course._id] ? 'Enrolling...' : 'Enroll Now'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default CourseCatalog;
