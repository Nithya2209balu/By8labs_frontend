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
import StudentModule from './pages/StudentModule';

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

// Light Blue theme for Employee role
const blueTheme = createTheme({
    palette: {
        primary: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
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
        background: {
            default: '#f0f9ff',
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
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 700,
                        backgroundColor: '#eff6ff',
                        color: '#1e3a8a',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    '&:hover': { boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)' },
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

// Picks the right theme based on role
function ThemedApp({ children }) {
    const { user } = useAuth();
    const theme = useMemo(
        () => user?.role === 'Employee' ? blueTheme : greenTheme,
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
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
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
