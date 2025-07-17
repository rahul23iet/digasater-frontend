import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Paper
} from '@mui/material';
import {
  Warning,
  TrendingUp,
  People,
  LocationOn,
  Refresh
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDisaster } from '../context/DisasterContext';
import { useSocket } from '../context/SocketContext';
import { resourceService } from '../services/resourceService';
import { socialMediaService } from '../services/socialMediaService';

const Dashboard = () => {
  const { disasters, fetchDisasters, loading } = useDisaster();
  const { connected, connectionStats } = useSocket();
  const [resourceStats, setResourceStats] = useState(null);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDisasters(),
        loadResourceStats(),
        loadTrendingKeywords()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadResourceStats = async () => {
    try {
      const stats = await resourceService.getStats();
      setResourceStats(stats);
    } catch (error) {
      console.error('Error loading resource stats:', error);
    }
  };

  const loadTrendingKeywords = async () => {
    try {
      const keywords = await socialMediaService.getTrending({ limit: 10 });
      setTrendingKeywords(keywords);
    } catch (error) {
      console.error('Error loading trending keywords:', error);
    }
  };

  const getDisastersByStatus = () => {
    const disastersArray = Array.isArray(disasters) ? disasters : [];
    const statusCounts = disastersArray.reduce((acc, disaster) => {
      const status = disaster.status || 'active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: status === 'active' ? '#f44336' : status === 'resolved' ? '#4caf50' : '#ff9800'
    }));
  };

  const getResourceChartData = () => {
    if (!resourceStats?.by_type) return [];
    
    return Object.entries(resourceStats.by_type).map(([type, count]) => ({
      type,
      count
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadDashboardData}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      {!connected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Real-time connection is offline. Some data may not be up to date.
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Disasters</Typography>
              </Box>
              <Typography variant="h3" color="error">
                {Array.isArray(disasters) ? disasters.filter(d => d.status !== 'resolved').length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {Array.isArray(disasters) ? disasters.length : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Resources</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {resourceStats?.total_resources || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available: {resourceStats?.availability_status?.available || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Connected Users</Typography>
              </Box>
              <Typography variant="h3" color="info">
                {connectionStats.totalConnections || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time monitoring
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Trending Topics</Typography>
              </Box>
              <Typography variant="h3" color="success">
                {trendingKeywords.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Social media monitoring
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resources by Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getResourceChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Disaster Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDisastersByStatus()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {getDisastersByStatus().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Disasters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Disasters
        </Typography>
        <Grid container spacing={2}>
          {(Array.isArray(disasters) ? disasters : []).slice(0, 6).map((disaster) => (
            <Grid item xs={12} sm={6} md={4} key={disaster.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {disaster.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    📍 {disaster.location_name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {disaster.tags?.slice(0, 3).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Trending Keywords */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Trending Keywords
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {trendingKeywords.map((keyword, index) => (
            <Chip
              key={index}
              label={`${keyword.keyword} (${keyword.count})`}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
