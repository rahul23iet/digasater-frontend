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
  Chip
} from '@mui/material';
import {
  Home,
  Warning,
  Map,
  Twitter,
  Report,
  PhotoCamera,
  NotificationsActive,
  WifiTethering
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connected, connectionStats } = useSocket();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <Home /> },
    { label: 'Disasters', path: '/disasters', icon: <Warning /> },
    { label: 'Resources', path: '/resources', icon: <Map /> },
    { label: 'Social Media', path: '/social-media', icon: <Twitter /> },
    { label: 'Reports', path: '/reports', icon: <Report /> },
    { label: 'Image Verification', path: '/image-verification', icon: <PhotoCamera /> }
  ];

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🚨 Disaster Response Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {navItems.map((item) => (
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
        </Box>

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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
