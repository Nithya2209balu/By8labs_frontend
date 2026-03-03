import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PayrollList from '../components/payroll/PayrollList';
import PayrollForm from '../components/payroll/PayrollForm';
import AccessDenied from '../components/access/AccessDenied';

const PayrollManagement = () => {
    const { user, isHR } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);

    // Check if employee has data access
    if (!isHR && user && !user.hasDataAccess) {
        return <AccessDenied />;
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Payroll Management
            </Typography>

            {isHR ? (
                <Box>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
                    >
                        <Tab label="Payroll List" />
                        <Tab label="Generate Payroll" />
                    </Tabs>

                    {tabValue === 0 && <PayrollList />}
                    {tabValue === 1 && <PayrollForm />}
                </Box>
            ) : (
                // Employee view - only show their own payroll
                <PayrollList />
            )}
        </Box>
    );
};

export default PayrollManagement;
