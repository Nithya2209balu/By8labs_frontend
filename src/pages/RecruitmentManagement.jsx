import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    Paper
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import JobList from '../components/recruitment/JobList';
import CandidateList from '../components/recruitment/CandidateList';
import InterviewCalendar from '../components/recruitment/InterviewCalendar';
import OfferManagement from '../components/recruitment/OfferManagement';

const RecruitmentManagement = () => {
    const { isHR } = useAuth();
    const [tabValue, setTabValue] = useState(0);

    // Only HR can access recruitment
    if (!isHR) {
        return (
            <Container>
                <Typography variant="h6" color="error">
                    Access Denied. Only HR can access recruitment management.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Recruitment Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage job postings, candidates, interviews, and offers
            </Typography>

            <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Job Postings" />
                    <Tab label="Candidates" />
                    <Tab label="Interviews" />
                    <Tab label="Offers" />
                </Tabs>
            </Paper>

            <Box>
                {tabValue === 0 && <JobList />}
                {tabValue === 1 && <CandidateList />}
                {tabValue === 2 && <InterviewCalendar />}
                {tabValue === 3 && <OfferManagement />}
            </Box>
        </Container>
    );
};

export default RecruitmentManagement;
