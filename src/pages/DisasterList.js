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
  Chip,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import { Add, Edit, Delete, LocationOn, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDisaster } from '../context/DisasterContext';
import { useSocket } from '../context/SocketContext';
import { safeFormatDate } from '../utils/dateUtils';

const DisasterList = () => {
  const navigate = useNavigate();
  const { disasters, fetchDisasters, createDisaster, updateDisaster, deleteDisaster, loading, error } = useDisaster();
  const { socket } = useSocket();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDisaster, setEditingDisaster] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    location_name: '',
    description: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchDisasters();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('disaster_created', (disaster) => {
        console.log('New disaster created:', disaster);
      });

      socket.on('disaster_updated', (disaster) => {
        console.log('Disaster updated:', disaster);
      });

      socket.on('disaster_deleted', (disasterId) => {
        console.log('Disaster deleted:', disasterId);
      });

      return () => {
        socket.off('disaster_created');
        socket.off('disaster_updated');
        socket.off('disaster_deleted');
      };
    }
  }, [socket]);

  const handleOpenDialog = (disaster = null) => {
    if (disaster) {
      setEditingDisaster(disaster);
      setFormData({
        title: disaster.title,
        location_name: disaster.location_name,
        description: disaster.description,
        tags: disaster.tags || []
      });
    } else {
      setEditingDisaster(null);
      setFormData({
        title: '',
        location_name: '',
        description: '',
        tags: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDisaster(null);
    setTagInput('');
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
      if (editingDisaster) {
        await updateDisaster(editingDisaster.id, formData);
      } else {
        await createDisaster(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving disaster:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this disaster?')) {
      try {
        await deleteDisaster(id);
      } catch (error) {
        console.error('Error deleting disaster:', error);
      }
    }
  };

  const getSeverityColor = (tags) => {
    if (tags?.includes('critical')) return 'error';
    if (tags?.includes('high')) return 'warning';
    if (tags?.includes('medium')) return 'info';
    return 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Disasters
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Disaster
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
        {(Array.isArray(disasters) ? disasters : []).map((disaster) => {
          // Defensive programming: ensure disaster object has required properties
          if (!disaster || typeof disaster !== 'object') {
            console.warn('Invalid disaster object:', disaster);
            return null;
          }
          
          return (
            <Grid item xs={12} sm={6} md={4} key={disaster.id || Math.random()}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
                onClick={() => disaster.id && navigate(`/disasters/${disaster.id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {disaster.title || 'Untitled Disaster'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {disaster.location_name || 'Unknown location'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {safeFormatDate(disaster.created_at, 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {disaster.description && disaster.description.length > 100 
                      ? `${disaster.description.substring(0, 100)}...` 
                      : disaster.description || 'No description available'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {(Array.isArray(disaster.tags) ? disaster.tags : []).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag || 'Unknown tag'}
                        size="small"
                        color={getSeverityColor(disaster.tags)}
                      />
                    ))}
                  </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(disaster);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(disaster.id);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          );
        })}
      </Grid>

      {(disasters && disasters.length === 0) && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No disasters found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first disaster report to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Disaster
          </Button>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDisaster ? 'Edit Disaster' : 'Create New Disaster'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            variant="outlined"
            value={formData.location_name}
            onChange={(e) => handleInputChange('location_name', e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            sx={{ mb: 2 }}
          />

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
            {editingDisaster ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default DisasterList;
