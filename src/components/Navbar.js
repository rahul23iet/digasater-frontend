import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Home,
  Warning,
  Map,
  Twitter,
  Report,
  PhotoCamera,
  NotificationsActive,
  WifiTethering,
  AccountCircle,
  Logout,
  AdminPanelSettings,
  Support,
  Person,
  SupervisorAccount
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connected, connectionStats } = useSocket();
  const { user, logout, hasRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };

  const getUserIcon = (role) => {
    switch (role) {
      case 'admin':
        return user.id === 'netrunnerX' ? <AdminPanelSettings /> : <SupervisorAccount />;
      case 'contributor':
        return <Support />;
      case 'user':
        return <Person />;
      default:
        return <AccountCircle />;
    }
  };

  const getUserColor = (role, userId) => {
    if (userId === 'netrunnerX') return '#e53e3e';
    if (userId === 'reliefAdmin') return '#3182ce';
    if (userId === 'contributor') return '#38a169';
    if (userId === 'user') return '#805ad5';
    return '#1976d2';
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <Home /> },
    { label: 'Disasters', path: '/disasters', icon: <Warning /> },
    { label: 'Resources', path: '/resources', icon: <Map /> },
    { label: 'Social Media', path: '/social-media', icon: <Twitter /> },
    { label: 'Reports', path: '/reports', icon: <Report /> },
    { 
      label: 'Image Verification', 
      path: '/image-verification', 
      icon: <PhotoCamera />,
      requiredRole: 'contributor'
    }
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.requiredRole || hasRole(item.requiredRole)
  );

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🚨 Disaster Response Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {filteredNavItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              {item.label}
            </Button>
          ))}

          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 2 }}
          >
            <Badge badgeContent={connectionStats.totalConnections || 0} color="secondary">
              <NotificationsActive />
            </Badge>
          </IconButton>

          <Chip
            icon={<WifiTethering />}
            label={connected ? 'Connected' : 'Disconnected'}
            color={connected ? 'success' : 'error'}
            size="small"
            sx={{ ml: 1 }}
          />

          {/* User Menu */}
          <IconButton
            color="inherit"
            onClick={handleUserMenuOpen}
            sx={{ ml: 2 }}
          >
            <Avatar
              sx={{
                bgcolor: getUserColor(user?.role, user?.id),
                width: 32,
                height: 32
              }}
            >
              {getUserIcon(user?.role)}
            </Avatar>
          </IconButton>
        </Box>

        {/* Connection Stats Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Typography variant="body2">
              Active Connections: {connectionStats.totalConnections || 0}
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Typography variant="body2">
              Disaster Rooms: {connectionStats.disasterRooms || 0}
            </Typography>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Typography variant="body2">
              Location Rooms: {connectionStats.locationRooms || 0}
            </Typography>
          </MenuItem>
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          PaperProps={{
            sx: { minWidth: 200 }
          }}
        >
          <MenuItem disabled>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: getUserColor(user?.role, user?.id),
                  width: 24,
                  height: 24
                }}
              >
                {getUserIcon(user?.role)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role?.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
