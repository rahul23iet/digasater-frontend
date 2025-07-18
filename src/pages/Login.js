import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  Alert,
  Container,
  Paper
} from '@mui/material';
import {
  AdminPanelSettings,
  Support,
  Person,
  SupervisorAccount
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const userTypes = [
  {
    id: 'netrunnerX',
    name: 'NetRunner X',
    role: 'admin',
    description: 'System Administrator with full access',
    icon: <AdminPanelSettings />,
    color: '#e53e3e',
    features: ['Full system access', 'User management', 'System configuration', 'All disaster operations']
  },
  {
    id: 'reliefAdmin',
    name: 'Relief Admin',
    role: 'admin',
    description: 'Relief Operations Administrator',
    icon: <SupervisorAccount />,
    color: '#3182ce',
    features: ['Disaster management', 'Resource coordination', 'Report verification', 'Team oversight']
  },
  {
    id: 'contributor',
    name: 'Contributor',
    role: 'contributor',
    description: 'Active contributor to disaster response',
    icon: <Support />,
    color: '#38a169',
    features: ['Create reports', 'Verify images', 'Add resources', 'Social media monitoring']
  },
  {
    id: 'user',
    name: 'User',
    role: 'user',
    description: 'General user with basic access',
    icon: <Person />,
    color: '#805ad5',
    features: ['View disasters', 'Basic reporting', 'Resource viewing', 'Limited access']
  }
];

const Login = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setError('');
  };

  const handleLogin = async () => {
    if (!selectedUser) {
      setError('Please select a user type to continue');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use AuthContext login function to properly set user state
      login({
        id: selectedUser.id,
        name: selectedUser.name,
        role: selectedUser.role
      });

      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 1000,
            borderRadius: 2
          }}
        >
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h1" gutterBottom color="primary">
              Disaster Signal
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Emergency Response Platform
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select your user type to access the platform
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {userTypes.map((user) => (
              <Grid item xs={12} sm={6} md={3} key={user.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: selectedUser?.id === user.id ? `2px solid ${user.color}` : '2px solid transparent',
                    transform: selectedUser?.id === user.id ? 'scale(1.02)' : 'scale(1)',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleUserSelect(user)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: user.color,
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      {user.icon}
                    </Avatar>
                    
                    <Typography variant="h6" gutterBottom>
                      {user.name}
                    </Typography>
                    
                    <Chip
                      label={user.role.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: user.color,
                        color: 'white',
                        mb: 2
                      }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {user.description}
                    </Typography>
                    
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        Features:
                      </Typography>
                      {user.features.map((feature, index) => (
                        <Typography key={index} variant="caption" display="block" color="text.secondary">
                          • {feature}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {selectedUser && (
            <Box
              sx={{
                p: 3,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: `1px solid ${selectedUser.color}`,
                mb: 3
              }}
            >
              <Typography variant="h6" gutterBottom>
                Selected: {selectedUser.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You will be logged in as <strong>{selectedUser.name}</strong> with <strong>{selectedUser.role}</strong> privileges.
              </Typography>
            </Box>
          )}

          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={!selectedUser || isLoading}
              sx={{
                px: 6,
                py: 1.5,
                bgcolor: selectedUser?.color || 'primary.main',
                '&:hover': {
                  bgcolor: selectedUser?.color || 'primary.dark',
                  opacity: 0.9
                }
              }}
            >
              {isLoading ? 'Logging in...' : 'Login to Platform'}
            </Button>
          </Box>

          <Box mt={4} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              This is a demo platform. Select any user type to explore the features.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
