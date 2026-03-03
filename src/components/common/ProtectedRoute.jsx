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

    if (requiredRole && user?.role !== requiredRole && user?.role !== 'HR') {
        return <Navigate to="/dashboard" replace />;
    }

    // Strict Access Control for New Users
    // If user doesn't have data access (and is not HR), they can ONLY access Dashboard
    // We allow /profile as an exception if needed, but for now strict Dashboard only as requested
    if (!user?.hasDataAccess && user?.role !== 'HR' && location.pathname !== '/dashboard') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
