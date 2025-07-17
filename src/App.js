import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DisasterList from './pages/DisasterList';
import DisasterDetail from './pages/DisasterDetail';
import ResourceMap from './pages/ResourceMap';
import SocialMedia from './pages/SocialMedia';
import Reports from './pages/Reports';
import ImageVerification from './pages/ImageVerification';

// Context
import { SocketProvider } from './context/SocketContext';
import { DisasterProvider } from './context/DisasterContext';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <DisasterProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/disasters" element={<DisasterList />} />
                  <Route path="/disasters/:id" element={<DisasterDetail />} />
                  <Route path="/resources" element={<ResourceMap />} />
                  <Route path="/social-media" element={<SocialMedia />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/image-verification" element={<ImageVerification />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </DisasterProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
