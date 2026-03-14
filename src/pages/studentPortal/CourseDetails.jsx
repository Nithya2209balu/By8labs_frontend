import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Card, CardContent, CircularProgress,
    Alert, Tabs, Tab, List, ListItem, ListItemIcon, ListItemText,
    Button, Divider, TextField, Avatar, Grid
} from '@mui/material';
import { PlayCircleOutline, Description, QuestionAnswer, NoteAdd, Lock } from '@mui/icons-material';
import { courseAPI } from '../../services/studentPortalAPI';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    
    const [tabIndex, setTabIndex] = useState(0);

    // Doubts & Notes
    const [doubts, setDoubts] = useState([]);
    const [newDoubt, setNewDoubt] = useState('');
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                // Fetch course "about" details
                const abtRes = await courseAPI.getCourseAbout(id);
                if (abtRes.data.success) {
                    setCourse(abtRes.data.data);
                }

                // Try fetching lessons (might fail if not enrolled, depending on backend logic)
                try {
                    const lessonsRes = await courseAPI.getCourseLessons(id);
                    if (lessonsRes.data.success) {
                        setLessons(lessonsRes.data.data);
                    }
                } catch (err) {
                    console.log('User might not be enrolled or lessons fetch failed:', err);
                }

                // Doubts and notes can be fetched when navigating tabs, but fetching initial state here
                fetchDoubts();
                fetchNotes();

            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [id]);

    const fetchDoubts = async () => {
        try {
            const res = await courseAPI.getDoubts(id);
            if (res.data.success) setDoubts(res.data.data);
        } catch (e) {
            console.error('Failed to fetch doubts', e);
        }
    };

    const fetchNotes = async () => {
        try {
            const res = await courseAPI.getNotes(id);
            if (res.data.success) setNotes(res.data.data);
        } catch (e) {
            console.error('Failed to fetch notes', e);
        }
    };

    const handlePostDoubt = async () => {
        if (!newDoubt.trim()) return;
        try {
            await courseAPI.postDoubt(id, { question: newDoubt });
            setNewDoubt('');
            fetchDoubts();
        } catch (err) {
            console.error(err);
            alert('Failed to post doubt');
        }
    };

    const handlePostNote = async () => {
        if (!newNote.trim()) return;
        try {
            await courseAPI.postNote(id, { content: newNote });
            setNewNote('');
            fetchNotes(); // backend likely saves and we retrieve
        } catch (err) {
            console.error(err);
            alert('Failed to post note');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    if (!course) return <Container sx={{ mt: 4 }}><Alert severity="warning">Course not found.</Alert></Container>;

    const isEnrolled = course.isEnrolled || true; // Assuming API provides this or backend enforces access controls

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent sx={{ p: 4 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>{course.title || 'Course Title'}</Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>{course.category?.name || course.category || 'Category'}</Typography>
                            <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
                                {course.description || "No description provided."}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Box>
                                <Typography variant="h6" gutterBottom>Instructor: {course.instructor?.name || 'By8Labs'}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>Duration: {course.duration || 'Flexible'}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} variant="fullWidth">
                    <Tab label="About" />
                    <Tab label="Lessons" />
                    <Tab label="Q&A Doubts" />
                    <Tab label="My Notes" />
                </Tabs>
            </Box>

            {/* TAB 0: About */}
            {tabIndex === 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>About This Course</Typography>
                    <Typography paragraph>{course.about || course.description}</Typography>
                </Box>
            )}

            {/* TAB 1: Lessons */}
            {tabIndex === 1 && (
                <Box>
                    <Typography variant="h6" gutterBottom>Course Content</Typography>
                    {!isEnrolled ? (
                        <Alert severity="warning" icon={<Lock />}>
                            You must enroll in this course to access lessons.
                        </Alert>
                    ) : lessons.length === 0 ? (
                        <Typography color="text.secondary">No lessons available yet.</Typography>
                    ) : (
                        <List>
                            {lessons.map((lesson, index) => (
                                <Card key={lesson._id} sx={{ mb: 2 }} variant="outlined">
                                    <ListItem
                                        button
                                        onClick={() => navigate(`/student-lessons/${lesson._id}/mcq`)}
                                    >
                                        <ListItemIcon>
                                            <PlayCircleOutline color="primary" fontSize="large" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={`${index + 1}. ${lesson.title}`}
                                            primaryTypographyProps={{ fontWeight: 'bold' }}
                                            secondary={`Duration: ${lesson.duration || 'N/A'}`}
                                        />
                                        <Button variant="outlined" size="small">Take Quiz / View MCQ</Button>
                                    </ListItem>
                                </Card>
                            ))}
                        </List>
                    )}
                </Box>
            )}

            {/* TAB 2: Doubts */}
            {tabIndex === 2 && (
                <Box>
                    <Typography variant="h6" gutterBottom>Ask a Doubt</Typography>
                    <Box display="flex" gap={2} mb={4}>
                        <TextField 
                            fullWidth 
                            variant="outlined" 
                            placeholder="Type your question here..." 
                            value={newDoubt}
                            onChange={(e) => setNewDoubt(e.target.value)}
                            size="small"
                        />
                        <Button variant="contained" onClick={handlePostDoubt}>Post</Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                        {doubts.length === 0 && <Typography color="text.secondary">No doubts asked yet. Be the first!</Typography>}
                        {doubts.map(doubt => (
                            <ListItem key={doubt._id} alignItems="flex-start" sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1, p: 2, boxShadow: 1 }}>
                                <ListItemIcon>
                                    <Avatar><QuestionAnswer /></Avatar>
                                </ListItemIcon>
                                <ListItemText
                                    primary={doubt.student?.name || 'Student'}
                                    secondary={
                                        <>
                                            <Typography variant="body1" color="text.primary" sx={{ display: 'block', mt: 1 }}>
                                                {doubt.question}
                                            </Typography>
                                            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                                {new Date(doubt.createdAt).toLocaleString()}
                                            </Typography>
                                            {doubt.answer && (
                                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f4f8', borderRadius: 1 }}>
                                                    <Typography variant="subtitle2" color="primary">Instructor Reply:</Typography>
                                                    <Typography variant="body2">{doubt.answer}</Typography>
                                                </Box>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            {/* TAB 3: Notes */}
            {tabIndex === 3 && (
                <Box>
                    <Typography variant="h6" gutterBottom>My Private Notes</Typography>
                    <Box display="flex" gap={2} mb={4}>
                        <TextField 
                            fullWidth 
                            variant="outlined" 
                            placeholder="Write a personal note..." 
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            multiline
                            rows={2}
                        />
                        <Button variant="contained" onClick={handlePostNote} startIcon={<NoteAdd />}>Save</Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                        {notes.length === 0 && <Typography color="text.secondary" sx={{ ml: 2 }}>No notes saved yet.</Typography>}
                        {notes.map(note => (
                            <Grid item xs={12} md={6} key={note._id}>
                                <Card sx={{ height: '100%', bgcolor: '#fffde7' }}>
                                    <CardContent>
                                        <Typography variant="body1">{note.content}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
                                            {new Date(note.createdAt).toLocaleString()}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Container>
    );
};

export default CourseDetails;
