import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Card, CardContent, CircularProgress,
    Alert, Button, Radio, RadioGroup, FormControlLabel, FormControl,
    FormLabel, Divider, Tooltip, IconButton
} from '@mui/material';
import { ArrowBack, CheckCircle, Warning } from '@mui/icons-material';
import { courseAPI } from '../../services/studentPortalAPI';

const LessonViewer = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mcqs, setMcqs] = useState([]);
    
    const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOption }
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    useEffect(() => {
        const fetchMCQs = async () => {
            try {
                setLoading(true);
                const res = await courseAPI.getLessonMCQs(lessonId);
                if (res.data.success) {
                    setMcqs(res.data.data || []);
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load lesson quiz.');
            } finally {
                setLoading(false);
            }
        };

        fetchMCQs();
    }, [lessonId]);

    const handleOptionChange = (qIndex, option) => {
        if (submitted) return; // prevent changes after submission
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const calculateScore = () => {
        let correctCount = 0;
        mcqs.forEach((q, index) => {
            const correctOptionString = q.options[q.correctAnswer];
            if (answers[index] === correctOptionString) {
                correctCount++;
            }
        });
        // Assuming percentage score
        return {
            correctCount,
            scorePercentage: mcqs.length > 0 ? Math.round((correctCount / mcqs.length) * 100) : 0
        };
    };

    const handleSubmitQuiz = async () => {
        if (Object.keys(answers).length < mcqs.length) {
            if (!window.confirm("You have unanswered questions. Are you sure you want to submit?")) {
                return;
            }
        }
        
        try {
            setLoading(true);
            const { correctCount, scorePercentage } = calculateScore();
            setScore(scorePercentage);
            
            // Post score to backend
            await courseAPI.submitQuizScore(lessonId, { 
                score: scorePercentage,
                totalQuestions: mcqs.length,
                correctAnswers: correctCount
            });
            
            setSubmitted(true);
        } catch (err) {
            console.error('Failed to submit score', err);
            setError('Failed to submit score to server, but your local score was calculated.');
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !submitted && mcqs.length === 0) {
        return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
                <Tooltip title="Back to Course">
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                </Tooltip>
                <Typography variant="h5" fontWeight="bold">Lesson Quiz & MCQs</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {mcqs.length === 0 && !loading && !error && (
                <Alert severity="info">There are no Multiple Choice Questions for this lesson.</Alert>
            )}

            {mcqs.length > 0 && (
                <Card sx={{ p: 2 }}>
                    <CardContent>
                        {submitted && score !== null && (
                            <Alert 
                                severity={score >= 70 ? "success" : "warning"} 
                                icon={score >= 70 ? <CheckCircle fontSize="inherit" /> : <Warning fontSize="inherit" />}
                                sx={{ mb: 4, py: 2, '& .MuiAlert-message': { width: '100%', textAlign: 'center' } }}
                            >
                                <Typography variant="h5" fontWeight="bold">
                                    Your Score: {score}%
                                </Typography>
                                <Typography variant="body1">
                                    {score >= 70 ? 'Great job! You passed the quiz.' : 'You might want to review the lesson and try again.'}
                                </Typography>
                            </Alert>
                        )}

                        <Typography variant="h6" gutterBottom color="primary">
                            Questions ({mcqs.length})
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        {mcqs.map((q, qIndex) => (
                            <Box key={q._id || qIndex} sx={{ mb: 4 }}>
                                <FormControl component="fieldset" fullWidth>
                                    <FormLabel 
                                        component="legend" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            color: 'text.primary', 
                                            mb: 1,
                                            '&.Mui-focused': { color: 'text.primary' } 
                                        }}
                                    >
                                        {qIndex + 1}. {q.question}
                                    </FormLabel>
                                    <RadioGroup
                                        value={answers[qIndex] || ''}
                                        onChange={(e) => handleOptionChange(qIndex, e.target.value)}
                                    >
                                        {q.options?.map((option, oIndex) => {
                                            const isSelected = answers[qIndex] === option;
                                            const correctOptionString = q.options[q.correctAnswer];
                                            let textColor = 'inherit';
                                            
                                            if (submitted) {
                                                if (option === correctOptionString) textColor = 'success.main';
                                                else if (isSelected && option !== correctOptionString) textColor = 'error.main';
                                            }

                                            return (
                                                <FormControlLabel 
                                                    key={oIndex} 
                                                    value={option} 
                                                    control={<Radio disabled={submitted} />} 
                                                    label={<span style={{ color: textColor }}>{option}</span>}
                                                    sx={{ 
                                                        bgcolor: isSelected && !submitted ? 'action.hover' : 'transparent',
                                                        borderRadius: 1,
                                                        pr: 2,
                                                        mb: 0.5
                                                    }}
                                                />
                                            );
                                        })}
                                    </RadioGroup>
                                    
                                    {submitted && (
                                        <Typography 
                                            variant="body2" 
                                            sx={{ mt: 1, color: answers[qIndex] === q.options[q.correctAnswer] ? 'success.main' : 'error.main' }}
                                        >
                                            {answers[qIndex] === q.options[q.correctAnswer] ? '✓ Correct' : `✗ Incorrect. The correct answer is: ${q.options[q.correctAnswer]}`}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>
                        ))}

                        {!submitted && (
                            <Box mt={4} textAlign="center">
                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    color="primary" 
                                    onClick={handleSubmitQuiz}
                                    disabled={loading}
                                    sx={{ minWidth: 200 }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Quiz'}
                                </Button>
                            </Box>
                        )}
                        
                        {submitted && (
                            <Box mt={4} textAlign="center">
                                <Button 
                                    variant="outlined" 
                                    size="large" 
                                    onClick={() => navigate(-1)}
                                >
                                    Return to Lesson
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default LessonViewer;
