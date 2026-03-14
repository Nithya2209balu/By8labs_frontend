import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Card, CircularProgress, Alert, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Avatar, Chip, Stack
} from '@mui/material';
import { EmojiEvents, StarRate, TrendingUp } from '@mui/icons-material';
import { leaderboardAPI } from '../../services/studentPortalAPI';

const Leaderboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const res = await leaderboardAPI.getLeaderboard();
                if (res.data.success) {
                    setLeaderboard(res.data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
                setError(err.response?.data?.message || 'Failed to load leaderboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        switch(index) {
            case 0: return <EmojiEvents sx={{ color: '#FFD700', fontSize: 32 }} />; // Gold
            case 1: return <EmojiEvents sx={{ color: '#C0C0C0', fontSize: 32 }} />; // Silver
            case 2: return <EmojiEvents sx={{ color: '#CD7F32', fontSize: 32 }} />; // Bronze
            default: return <Typography variant="h6" fontWeight="bold" color="text.secondary" sx={{ width: 32, textAlign: 'center' }}>{index + 1}</Typography>;
        }
    };

    const getRowColor = (index) => {
        switch(index) {
            case 0: return 'rgba(255, 215, 0, 0.08)'; // Light Gold
            case 1: return 'rgba(192, 192, 192, 0.08)'; // Light Silver
            case 2: return 'rgba(205, 127, 50, 0.08)'; // Light Bronze
            default: return 'inherit';
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh"><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4} textAlign="center">
                <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <EmojiEvents fontSize="large" /> 
                    Top Students Leaderboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    See where you stand among your peers. Keep learning to climb the ranks!
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Card elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <TableContainer component={Box}>
                    <Table sx={{ minWidth: 500 }}>
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell align="center" width="10%"><strong>Rank</strong></TableCell>
                                <TableCell><strong>Student</strong></TableCell>
                                <TableCell align="right"><strong>Score</strong></TableCell>
                                <TableCell align="center"><strong>Badges</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                        <Typography color="text.secondary">No students on the leaderboard yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leaderboard.map((student, index) => (
                                    <TableRow 
                                        key={student._id || index}
                                        sx={{ 
                                            bgcolor: getRowColor(index),
                                            transition: 'background-color 0.2s',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <TableCell align="center">
                                            {getRankIcon(index)}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar 
                                                    sx={{ 
                                                        bgcolor: index < 3 ? 'primary.main' : 'secondary.main',
                                                        width: 40, height: 40 
                                                    }}
                                                >
                                                    {student.name?.[0] || 'S'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {student.name || 'Anonymous Student'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {student.course?.courseName || 'Enrolled Student'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="h6" fontWeight="bold" color={index < 3 ? 'primary.main' : 'text.primary'}>
                                                {student.totalScore || student.score || 0} pts
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {index === 0 && <Chip size="small" icon={<StarRate />} label="Top Scholar" color="warning" />}
                                            {index > 0 && index < 3 && <Chip size="small" icon={<TrendingUp />} label="Rising Star" color="info" />}
                                            {index >= 3 && <Typography variant="caption" color="text.secondary">—</Typography>}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Container>
    );
};

export default Leaderboard;
