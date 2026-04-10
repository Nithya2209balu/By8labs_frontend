import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Toolbar } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOTP from './components/auth/VerifyOTP';
import PendingApproval from './components/auth/PendingApproval';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import EmployeeDetails from './components/employees/EmployeeDetails';
import MyProfile from './pages/MyProfile';
import AttendanceManagement from './pages/AttendanceManagement';
import LeaveManagement from './pages/LeaveManagement';
import PayrollManagement from './pages/PayrollManagement';
import RecruitmentManagement from './pages/RecruitmentManagement';
import AccessRequests from './pages/AccessRequests';
import PendingUsers from './pages/PendingUsers';
import Reports from './pages/Reports';
import AnnouncementManagement from './pages/AnnouncementManagement';
import EmailManagement from './pages/EmailManagement';
import Feedback from './pages/Feedback';
import PerformanceManagement from './pages/PerformanceManagement';
import DocumentManagement from './pages/DocumentManagement';
import StudentModule from './pages/student/StudentModule';
import StudentAssignment from './pages/student/StudentAssignment';
import CertificateManagement from './pages/CertificateManagement';
import CourseCatalog from './pages/studentPortal/CourseCatalog';
import CourseDetails from './pages/studentPortal/CourseDetails';
import LessonViewer from './pages/studentPortal/LessonViewer';
import StudentAttendance from './pages/studentPortal/StudentAttendance';
import Leaderboard from './pages/studentPortal/Leaderboard';
import StudentNotifications from './pages/studentPortal/StudentNotifications';
import MyCourses from './pages/studentPortal/MyCourses';
import MyCertificates from './pages/studentPortal/MyCertificates';

// Shared component overrides (same for both themes)
const sharedComponents = {
    MuiButton: {
        styleOverrides: {
            root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                '&:hover': {
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                },
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: { borderRadius: 8 },
            elevation1: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
            elevation2: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
            elevation3: { boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)' },
        },
    },
    MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTab: {
        styleOverrides: {
            root: {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
            },
        },
    },
};

const sharedTypography = {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
};

// Green/Teal theme for HR and Manager
const greenTheme = createTheme({
    palette: {
        primary: {
            main: '#10b981', // Emerald green
            light: '#34d399',
            dark: '#059669',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#14b8a6', // Teal
            light: '#2dd4bf',
            dark: '#0d9488',
            contrastText: '#ffffff',
        },
        success: {
            main: '#10b981',
            light: '#6ee7b7',
            dark: '#047857',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        info: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
        },
        background: {
            default: '#f9fafb',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                },
                contained: {
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                elevation1: {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                },
                elevation2: {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
                elevation3: {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 700,
                        // backgroundColor: '#f0fdf4',
                        color: '#065f46',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                },
            },
        },
    },
    MuiTableHead: {
        styleOverrides: {
            root: {
                '& .MuiTableCell-head': {
                    fontWeight: 700,
                    backgroundColor: '#f0fdf4',
                    color: '#065f46',
                },
            },
        },
    },
    ...sharedComponents,
});

// Wethers Field 415E theme for Employee role (muted sage green)
const employeeTheme = createTheme({
    palette: {
        primary: {
            main: '#0f172a ',        // Wethers Field 415E
            light: '#0f172a ',
            dark: '#0f172a ',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#0f172a ',
            light: '#0f172a ',
            dark: '#0f172a ',
            contrastText: '#ffffff',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
        },
        background: {
            default: '#f5f6f5',
            paper: '#ffffff',
        },
    },
    typography: sharedTypography,
    shape: { borderRadius: 8 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                },
                contained: {
                    boxShadow: '0 2px 8px rgba(107, 124, 110, 0.25)',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(107, 124, 110, 0.35)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6B7C6E 0%, #4A5A4C 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #4A5A4C 0%, #3A4A3C 100%)',
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 700,
                        backgroundColor: '#eef0ee',
                        color: '#3A4A3C',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    '&:hover': { boxShadow: '0 4px 16px rgba(107, 124, 110, 0.2)' },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { borderRadius: 8 },
                elevation1: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
                elevation2: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
                elevation3: { boxShadow: '0 6px 16px rgba(107, 124, 110, 0.12)' },
            },
        },
        MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                },
            },
        },
    },
});


// Dark navy theme for Student role (#0f172a)
const studentTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366f1',        // Indigo accent – visible on dark bg
            light: '#818cf8',
            dark: '#4f46e5',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#38bdf8',        // Sky blue accent
            light: '#7dd3fc',
            dark: '#0284c7',
            contrastText: '#ffffff',
        },
        success: { main: '#22c55e', light: '#86efac', dark: '#15803d' },
        error:   { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
        warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
        background: {
            default: '#0f172a',     // Slate-950 – main background
            paper:   '#1e293b',     // Slate-800 – cards / dialogs
        },
        text: {
            primary:   '#f1f5f9',
            secondary: '#94a3b8',
            disabled:  '#475569',
        },
        divider: 'rgba(255,255,255,0.08)',
    },
    typography: sharedTypography,
    shape: { borderRadius: 8 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
                contained: {
                    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                    '&:hover': { boxShadow: '0 4px 14px rgba(99,102,241,0.45)' },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1e293b',
                    borderRadius: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    '&:hover': { boxShadow: '0 4px 20px rgba(99,102,241,0.2)' },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundColor: '#1e293b', borderRadius: 8 },
                elevation1: { boxShadow: '0 2px 10px rgba(0,0,0,0.35)' },
                elevation2: { boxShadow: '0 4px 14px rgba(0,0,0,0.4)' },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 700,
                        backgroundColor: '#0f172a',
                        color: '#6366f1',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { backgroundColor: '#1e293b', boxShadow: '0 1px 0 rgba(255,255,255,0.06)' },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: { backgroundColor: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.06)' },
            },
        },
        MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
        MuiTab: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
            },
        },
    },
});

// Picks the right theme based on role
function ThemedApp({ children }) {
    const { user } = useAuth();
    const theme = useMemo(
        () => {
            if (user?.role === 'Employee') return employeeTheme;
            if (user?.role === 'Student')  return studentTheme;
            return greenTheme; // HR / Manager / default
        },
        [user?.role]
    );
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}

const drawerWidth = 240;

const AppLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prev) => !prev);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Header onMenuToggle={handleDrawerToggle} />
            <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 2, md: 3 },
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    minWidth: 0, // prevent overflow
                    overflowX: 'hidden',
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

function AppRoutes() {
    const { isAuthenticated, user } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated 
                        ? (user?.approvalStatus === 'Pending' && user?.role !== 'HR' 
                            ? <Navigate to="/pending-approval" replace /> 
                            : <Navigate to="/dashboard" replace />)
                        : <Login />
                }
            />
            <Route
                path="/register"
                element={
                    isAuthenticated 
                        ? (user?.approvalStatus === 'Pending' && user?.role !== 'HR' 
                            ? <Navigate to="/pending-approval" replace /> 
                            : <Navigate to="/dashboard" replace />)
                        : <Register />
                }
            />
            <Route
                path="/pending-approval"
                element={
                    <ProtectedRoute>
                        <PendingApproval />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/verify-email"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <VerifyOTP />}
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Dashboard />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/employees"
                element={
                    <ProtectedRoute requiredRole="HR">
                        <AppLayout>
                            <EmployeeManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/employees/:id/details"
                element={
                    <ProtectedRoute requiredRole="HR">
                        <AppLayout>
                            <EmployeeDetails />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <MyProfile />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/attendance"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <AttendanceManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/access-requests"
                element={
                    <ProtectedRoute requiredRole="HR">
                        <AppLayout>
                            <AccessRequests />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recruitment"
                element={
                    <ProtectedRoute requiredRole="HR">
                        <AppLayout>
                            <RecruitmentManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/pending-users"
                element={
                    <ProtectedRoute requiredRole="HR">
                        <AppLayout>
                            <PendingUsers />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/leaves"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <LeaveManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payroll"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <PayrollManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/performance"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <PerformanceManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/documents"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <DocumentManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/students"
                element={
                    <ProtectedRoute requiredRole="HR">
                        <AppLayout>
                            <StudentModule />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student-assignments"
                element={
                    <ProtectedRoute requiredRole="HR">
                        <AppLayout>
                            <StudentAssignment />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/certificates"
                element={
                    <ProtectedRoute requiredRole="HR">
                        <AppLayout>
                            <CertificateManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            
            {/* Student Portal Routes */}
            <Route
                path="/student-courses"
                element={
                    <ProtectedRoute requiredRole="Student">
                        <AppLayout>
                            <CourseCatalog />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-courses"
                element={
                    <ProtectedRoute requiredRole="Student">
                        <AppLayout>
                            <MyCourses />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student-courses/:id"
                element={
                    <ProtectedRoute requiredRole="Student">
                        <AppLayout>
                            <CourseDetails />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student-lessons/:lessonId/mcq"
                element={
                    <ProtectedRoute requiredRole="Student">
                        <AppLayout>
                            <LessonViewer />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student-attendance"
                element={
                    <ProtectedRoute requiredRole="Student">
                        <AppLayout>
                            <StudentAttendance />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student-leaderboard"
                element={
                    <ProtectedRoute requiredRole="Student">
                        <AppLayout>
                            <Leaderboard />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/student-notifications"
                element={
                    <ProtectedRoute requiredRole="Student">
                        <AppLayout>
                            <StudentNotifications />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-certificates"
                element={
                    <ProtectedRoute requiredRole="Student">
                        <AppLayout>
                            <MyCertificates />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recruitment"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Box sx={{ p: 3 }}>
                                <h1>Recruitment Management</h1>
                                <p>Coming soon...</p>
                            </Box>
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            {/* <Route
                path="/expenses"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Box sx={{ p: 3 }}>
                                <h1>Expense Management</h1>
                                <p>Coming soon...</p>
                            </Box>
                        </AppLayout>
                    </ProtectedRoute>
                }
            /> */}
            {/* <Route
                path="/exit"
                element={
                    <ProtectedRoute requiredRole="HR">
                        <AppLayout>
                            <Box sx={{ p: 3 }}>
                                <h1>Exit Management</h1>
                                <p>Coming soon...</p>
                            </Box>
                        </AppLayout>
                    </ProtectedRoute>
                }
            /> */}
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Reports />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/announcements"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <AnnouncementManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/email"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <EmailManagement />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/feedback"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Feedback />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ThemedApp>
                    <AppRoutes />
                </ThemedApp>
            </AuthProvider>
        </Router>
    );
}

export default App;
