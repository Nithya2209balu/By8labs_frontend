import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import {
    Person as PersonIcon,
    AccountBalance as BankIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import EmployeeAbout from './EmployeeAbout';
import EmployeeBankDetails from './EmployeeBankDetails';
import { employeeAPI } from '../../services/api';

const EmployeeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTab, setSelectedTab] = useState('about');

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const fetchEmployee = async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.getById(id);
            setEmployee(response.data);
        } catch (error) {
            console.error('Error fetching employee:', error);
            setError(error.response?.data?.message || 'Failed to load employee details');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setSelectedTab(tab);
    };

    const handleBack = () => {
        navigate('/employees');
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!employee) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Alert severity="warning">Employee not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={handleBack} color="primary">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4">
                    Employee Details - {employee.firstName} {employee.lastName}
                </Typography>
            </Box>

            {/* Main Content */}
            <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Left Sidebar */}
                <Paper sx={{ width: 250, flexShrink: 0 }}>
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton
                                selected={selectedTab === 'about'}
                                onClick={() => handleTabChange('about')}
                            >
                                <ListItemIcon>
                                    <PersonIcon color={selectedTab === 'about' ? 'primary' : 'inherit'} />
                                </ListItemIcon>
                                <ListItemText primary="About" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                selected={selectedTab === 'bank'}
                                onClick={() => handleTabChange('bank')}
                            >
                                <ListItemIcon>
                                    <BankIcon color={selectedTab === 'bank' ? 'primary' : 'inherit'} />
                                </ListItemIcon>
                                <ListItemText primary="Bank Details" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Paper>

                {/* Right Content Area */}
                <Box sx={{ flexGrow: 1 }}>
                    {selectedTab === 'about' && <EmployeeAbout employee={employee} onUpdate={fetchEmployee} />}
                    {selectedTab === 'bank' && <EmployeeBankDetails employee={employee} onUpdate={fetchEmployee} />}
                </Box>
            </Box>
        </Container>
    );
};

export default EmployeeDetails;
