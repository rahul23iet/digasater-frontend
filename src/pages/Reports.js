import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import { Add, LocationOn, Schedule, Image } from '@mui/icons-material';
import { reportService } from '../services/reportService';
import { disasterService } from '../services/disasterService';
import { useSocket } from '../context/SocketContext';
import { safeFormatDate } from '../utils/dateUtils';

const Reports = () => {
  const { socket } = useSocket();
  const [reports, setReports] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    disaster_id: '',
    user_id: 'user123', // Mock user ID
    content: '',
    image_url: '',
    severity: 'medium',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadReports();
    loadDisasters();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('report_created', (report) => {
        setReports(prev => [report, ...prev]);
      });

      socket.on('report_updated', (report) => {
        setReports(prev => prev.map(r => r.id === report.id ? report : r));
      });

      return () => {
        socket.off('report_created');
        socket.off('report_updated');
      };
    }
  }, [socket]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportService.getAll();
      setReports(data);
    } catch (error) {
      setError('Failed to load reports');
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDisasters = async () => {
    try {
      const data = await disasterService.getAll();
      setDisasters(data);
    } catch (error) {
      console.error('Error loading disasters:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      disaster_id: '',
      user_id: 'user123',
      content: '',
      image_url: '',
      severity: 'medium',
      tags: []
    });
    setTagInput('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    try {
      await reportService.create(formData);
      handleCloseDialog();
    } catch (error) {
      setError('Failed to create report');
      console.error('Error creating report:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getVerificationColor = (status) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Create Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {(Array.isArray(reports) ? reports : []).map((report) => (
          <Grid item xs={12} md={6} key={report.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    Report #{report.id?.slice(-6)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={report.severity}
                      color={getSeverityColor(report.severity)}
                      size="small"
                    />
                    <Chip
                      label={report.verification_status}
                      color={getVerificationColor(report.verification_status)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {report.content}
                </Typography>

                {report.image_url && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Image fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Image attached
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {safeFormatDate(report.created_at, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>

                {report.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {report.location.lat.toFixed(4)}, {report.location.lon.toFixed(4)}
                    </Typography>
                  </Box>
                )}

                {report.tags && report.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {report.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary">
                  Disaster: {(Array.isArray(disasters) ? disasters : []).find(d => d.id === report.disaster_id)?.title || 'Unknown'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {reports.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No reports found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first report to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            Create Report
          </Button>
        </Box>
      )}

      {/* Create Report Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Disaster</InputLabel>
            <Select
              value={formData.disaster_id}
              onChange={(e) => handleInputChange('disaster_id', e.target.value)}
              label="Disaster"
            >
              {(Array.isArray(disasters) ? disasters : []).map((disaster) => (
                <MenuItem key={disaster.id} value={disaster.id}>
                  {disaster.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Report Content"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Image URL (optional)"
            fullWidth
            variant="outlined"
            value={formData.image_url}
            onChange={(e) => handleInputChange('image_url', e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              value={formData.severity}
              onChange={(e) => handleInputChange('severity', e.target.value)}
              label="Severity"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="Add Tag"
                variant="outlined"
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button onClick={handleAddTag} variant="outlined">
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create Report
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleOpenDialog}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Reports;
