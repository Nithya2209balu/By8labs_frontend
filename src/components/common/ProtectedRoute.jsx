import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Handle Pending Approval Status
    if (user?.approvalStatus === 'Pending' && user?.role !== 'HR') {
        if (location.pathname !== '/pending-approval') {
            return <Navigate to="/pending-approval" replace />;
        }
        return children;
    }

    // Redirect away from pending-approval if already approved
    if (user?.approvalStatus === 'Approved' && location.pathname === '/pending-approval') {
        return <Navigate to="/dashboard" replace />;
    }

    // Strict Access Control for New Users (Approved but no data access yet)
    if (!user?.hasDataAccess && user?.role !== 'HR' && location.pathname !== '/dashboard' && location.pathname !== '/profile') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
