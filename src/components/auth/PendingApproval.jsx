import React from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    Box, 
    Button,
    CircularProgress
} from '@mui/material';
import { HourglassEmpty, Refresh, Logout } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
    const { user, refreshUser, logout } = useAuth();
    const navigate = useNavigate();
    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        const updatedUser = await refreshUser();
        setRefreshing(false);
        
        if (updatedUser && updatedUser.approvalStatus === 'Approved') {
            navigate('/dashboard');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)'
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={10} sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
                    <HourglassEmpty sx={{ fontSize: 80, color: 'warning.main', mb: 3 }} />
                    
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Approval Pending
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                        Hello <strong>{user?.username}</strong>,<br /><br />
                        Your account has been successfully created and your email is verified. 
                        However, an administrator must approve your registration before you can access the system.
                    </Typography>

                    <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1, mb: 4, color: 'info.contrastText' }}>
                        <Typography variant="body2">
                            Status: <strong>{user?.approvalStatus}</strong>
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Please check back later or contact HR at <strong>hr@by8labs.com</strong> if you have any questions.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button 
                            variant="contained" 
                            startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            Refresh Status
                        </Button>
                        
                        <Button 
                            variant="outlined" 
                            startIcon={<Logout />}
                            onClick={logout}
                        >
                            Logout
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PendingApproval;
