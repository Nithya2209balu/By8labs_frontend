import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Divider, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Dashboard, People, MenuBook, AccessTime, AttachMoney, EventNote, Assignment, Assessment, HowToReg } from '@mui/icons-material';

import StudentDashboard from './student/StudentDashboard';
import StudentManagement from './student/StudentManagement';
import CourseManagement from './student/CourseManagement';
import StudentAttendance from './student/StudentAttendance';
import FeesManagement from './student/FeesManagement';
import StudentLeaveManagement from './student/StudentLeaveManagement';
import StudentAssignment from './student/StudentAssignment';
import StudentReport from './student/StudentReport';
import AdmissionManagement from './student/AdmissionManagement';

const MENU = [
    { key: 'dashboard', label: 'Student Dashboard', icon: <Dashboard /> },
    { key: 'admission', label: 'Admission', icon: <HowToReg /> },
    { key: 'students', label: 'Student Management', icon: <People /> },
    { key: 'courses', label: 'Course Management', icon: <MenuBook /> },
    { key: 'attendance', label: 'Attendance', icon: <AccessTime /> },
    { key: 'fees', label: 'Fees Management', icon: <AttachMoney /> },
    { key: 'leaves', label: 'Leave Management', icon: <EventNote /> },
    { key: 'assignments', label: 'Assignment', icon: <Assignment /> },
    { key: 'reports', label: 'Report', icon: <Assessment /> },
];

const SIDEBAR_WIDTH = 220;

export default function StudentModule() {
    const [active, setActive] = useState('dashboard');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const renderContent = () => {
        switch (active) {
            case 'dashboard': return <StudentDashboard />;
            case 'admission': return <AdmissionManagement />;
            case 'students': return <StudentManagement />;
            case 'courses': return <CourseManagement />;
            case 'attendance': return <StudentAttendance />;
            case 'fees': return <FeesManagement />;
            case 'leaves': return <StudentLeaveManagement />;
            case 'assignments': return <StudentAssignment />;
            case 'reports': return <StudentReport />;
            default: return <StudentDashboard />;
        }
    };

    const selectedColor = theme.palette.primary.main;

    const sidebar = (
        <Paper
            elevation={0}
            sx={{
                width: SIDEBAR_WIDTH,
                minWidth: SIDEBAR_WIDTH,
                borderRight: '1px solid #e5e7eb',
                bgcolor: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100%',
            }}
        >
            <Box sx={{ px: 2, py: 2, background: `linear-gradient(135deg, ${selectedColor} 0%, ${theme.palette.primary.dark} 100%)` }}>
                <Typography variant="subtitle1" fontWeight={700} color="white" display="flex" alignItems="center" gap={1}>
                    🎓 Student Module
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.75)">HR Management Only</Typography>
            </Box>
            <Divider />
            <List sx={{ py: 1, flex: 1 }}>
                {MENU.map(item => {
                    const isActive = active === item.key;
                    return (
                        <ListItem key={item.key} disablePadding>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => setActive(item.key)}
                                sx={{
                                    mx: 0.5,
                                    my: 0.25,
                                    borderRadius: 1.5,
                                    transition: 'all 0.2s',
                                    '&.Mui-selected': {
                                        bgcolor: `${selectedColor}18`,
                                        borderLeft: `3px solid ${selectedColor}`,
                                        '& .MuiListItemIcon-root': { color: selectedColor },
                                        '& .MuiListItemText-primary': { color: theme.palette.primary.dark, fontWeight: 700 },
                                        '&:hover': { bgcolor: `${selectedColor}28` },
                                    },
                                    '&:hover': {
                                        bgcolor: '#f0fdf4',
                                        borderLeft: '3px solid #d1d5db',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: isActive ? selectedColor : '#6b7280', transition: 'color 0.2s' }}>
                                    {React.cloneElement(item.icon, { sx: { fontSize: '1.1rem' } })}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: '0.83rem', fontWeight: isActive ? 700 : 500 }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );

    return (
        <Box sx={{ display: 'flex', height: '100%', minHeight: '80vh', gap: 0, borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            {!isMobile && sidebar}
            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: '#fff', minWidth: 0 }}>
                {isMobile && (
                    <Box sx={{ overflowX: 'auto', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, pb: 1 }}>
                            {MENU.map(item => (
                                <Box key={item.key}
                                    onClick={() => setActive(item.key)}
                                    sx={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                                        px: 1.5, py: 1, borderRadius: 2, cursor: 'pointer', whiteSpace: 'nowrap',
                                        bgcolor: active === item.key ? `${selectedColor}18` : 'transparent',
                                        border: active === item.key ? `1px solid ${selectedColor}` : '1px solid #e5e7eb',
                                        minWidth: 80,
                                    }}>
                                    {React.cloneElement(item.icon, { sx: { fontSize: '1rem', color: active === item.key ? selectedColor : '#6b7280' } })}
                                    <Typography variant="caption" fontWeight={active === item.key ? 700 : 400} color={active === item.key ? selectedColor : 'text.secondary'}>{item.label}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
                {renderContent()}
            </Box>
        </Box>
    );
}
