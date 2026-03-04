import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import logoImg from '../../assets/logo.png';
import NotificationBell from './NotificationBell';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Box,
    useMediaQuery
} from '@mui/material';
import {
    AccountCircle,
    Logout,
    Menu as MenuIcon
} from '@mui/icons-material';

const Header = ({ onMenuToggle }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };
    const handleProfile = () => {
        handleClose();
        navigate('/profile');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (t) => t.zIndex.drawer + 1,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
            }}
        >
            <Toolbar sx={{ gap: 1, minHeight: 100 }}>

                {/* Hamburger - mobile only */}
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onMenuToggle}
                    sx={{ display: { md: 'none' }, mr: 1 }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Logo + Brand */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexGrow: 1,
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/')}
                >
                    <Box
                        component="img"
                        src={logoImg}
                        alt="BY8labs Logo"
    sx={{
        height: { xs: 55, sm: 60, md: 64  },
        width: 'auto',
        mr: 2,
        objectFit: 'contain'
    }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.35rem' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        BY8labs
                    </Typography>
                </Box>

                {/* User Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                    {/* Notification Bell */}
                    <NotificationBell />

                    {/* Email - hide on small screens */}
                    <Typography
                        variant="body2"
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            fontWeight: 500,
                            opacity: 0.9,
                            maxWidth: { sm: 180, md: 250 },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {user?.role} — {user?.email}
                    </Typography>

                    <IconButton
                        onClick={handleMenu}
                        sx={{
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 42,
                                height: 42,
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontWeight: 700,
                                border: '2px solid rgba(255,255,255,0.3)',
                                fontSize: '1rem',
                            }}
                        >
                            {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                    </IconButton>
                </Box>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            borderRadius: 2,
                            minWidth: 200,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }
                    }}
                >
                    <MenuItem
                        onClick={handleProfile}
                        sx={{
                            py: 1.5,
                            '&:hover': {
                                bgcolor: '#f0fdf4',
                                color: '#10b981'
                            }
                        }}
                    >
                        <AccountCircle sx={{ mr: 1.5, color: '#10b981' }} />
                        Profile
                    </MenuItem>

                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            py: 1.5,
                            '&:hover': {
                                bgcolor: '#fef2f2',
                                color: '#ef4444'
                            }
                        }}
                    >
                        <Logout sx={{ mr: 1.5, color: '#ef4444' }} />
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Header;