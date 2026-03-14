import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
    Box,
    useMediaQuery
} from '@mui/material';
import {
    Dashboard,
    People,
    AccessTime,
    EventNote,
    AttachMoney,
    Assessment,
    WorkOutline,
    Receipt,
    ExitToApp,
    BarChart,
    VerifiedUser,
    PersonAdd,
    Campaign,
    Feedback as FeedbackIcon,
    Mail,
    FolderShared,
    SchoolOutlined,
    MenuBook
} from '@mui/icons-material';
import SidebarCalendar from './SidebarCalendar';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, onClose }) => {
    const { user, isHR, isManager } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const selectedBg = `${theme.palette.primary.main}18`;
    const selectedHoverBg = `${theme.palette.primary.main}28`;
    const selectedBorder = theme.palette.primary.main;
    const selectedIconColor = theme.palette.primary.main;
    const selectedTextColor = theme.palette.primary.dark;

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['HR', 'Manager', 'Employee', 'Student'] },
        { text: 'My Courses', icon: <MenuBook />, path: '/my-courses', roles: ['Student'] },
        { text: 'Course Catalog', icon: <MenuBook />, path: '/student-courses', roles: ['Student'] },
        { text: 'My Attendance', icon: <AccessTime />, path: '/student-attendance', roles: ['Student'] },
        { text: 'Leaderboard', icon: <Assessment />, path: '/student-leaderboard', roles: ['Student'] },
        { text: 'Notifications', icon: <Campaign />, path: '/student-notifications', roles: ['Student'] },
        { text: 'Employees', icon: <People />, path: '/employees', roles: ['HR'] },
        { text: 'Students', icon: <SchoolOutlined />, path: '/students', roles: ['HR'] },
        { text: 'Assignments', icon: <Assessment />, path: '/student-assignments', roles: ['HR', 'Manager'] },
        { text: 'Attendance', icon: <AccessTime />, path: '/attendance', roles: ['HR', 'Manager', 'Employee'] },
        { text: 'Leave Management', icon: <EventNote />, path: '/leaves', roles: ['HR', 'Manager', 'Employee'] },
        { text: 'Announcements', icon: <Campaign />, path: '/announcements', roles: ['HR', 'Manager', 'Employee'] },
        { text: 'Email', icon: <Mail />, path: '/email', roles: ['HR', 'Manager', 'Employee'] },
        { text: 'Feedback', icon: <FeedbackIcon />, path: '/feedback', roles: ['HR', 'Manager', 'Employee'] },
        { text: 'Pending Users', icon: <PersonAdd />, path: '/pending-users', roles: ['HR'] },
        { text: 'Access Requests', icon: <VerifiedUser />, path: '/access-requests', roles: ['HR'] },
        { text: 'Payroll', icon: <AttachMoney />, path: '/payroll', roles: ['HR', 'Employee'] },
        { text: 'Performance', icon: <Assessment />, path: '/performance', roles: ['HR', 'Manager', 'Employee'] },
        { text: 'Documents', icon: <FolderShared />, path: '/documents', roles: ['HR', 'Manager', 'Employee'] },
        { text: 'Recruitment', icon: <WorkOutline />, path: '/recruitment', roles: ['HR'] },
        { text: 'Reports', icon: <BarChart />, path: '/reports', roles: ['HR', 'Manager'] }
    ];

    if (!isHR && !user?.hasDataAccess) return null;

    const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile && onClose) onClose();
    };

    const drawerContent = (
        <Box sx={{ overflow: 'auto' }}>
            <Toolbar />
            <List>
                {filteredMenuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => handleNavigate(item.path)}
                            sx={{
                                mx: 1,
                                my: 0.5,
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&.Mui-selected': {
                                    bgcolor: selectedBg,
                                    borderLeft: `4px solid ${selectedBorder}`,
                                    '& .MuiListItemIcon-root': { color: selectedIconColor },
                                    '& .MuiListItemText-primary': { color: selectedTextColor, fontWeight: 700 },
                                    '&:hover': { bgcolor: selectedHoverBg },
                                },
                                '&:hover': {
                                    bgcolor: '#f9fafb',
                                    borderLeft: '4px solid #d1d5db',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, transition: 'color 0.2s' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ my: 1 }} />
            {/* Hide calendar on mobile to save space */}
            {!isMobile && <SidebarCalendar />}
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            {/* Mobile: temporary drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #e5e7eb',
                        bgcolor: '#fafafa',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop: permanent drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #e5e7eb',
                        bgcolor: '#fafafa',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
