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
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { resourceService } from '../services/resourceService';
import { useSocket } from '../context/SocketContext';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ResourceMap = () => {
  const { socket } = useSocket();
  const [resources, setResources] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location_name: '',
    description: '',
    contact_info: '',
    availability: 'available',
    capacity: ''
  });

  useEffect(() => {
    loadResources();
    loadResourceTypes();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('resource_created', (resource) => {
        setResources(prev => [resource, ...prev]);
      });

      socket.on('resource_updated', (resource) => {
        setResources(prev => prev.map(r => r.id === resource.id ? resource : r));
      });

      socket.on('resource_deleted', (resourceId) => {
        setResources(prev => prev.filter(r => r.id !== resourceId));
      });

      return () => {
        socket.off('resource_created');
        socket.off('resource_updated');
        socket.off('resource_deleted');
      };
    }
  }, [socket]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await resourceService.getAll();
      setResources(data);
    } catch (error) {
      setError('Failed to load resources');
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResourceTypes = async () => {
    try {
      const types = await resourceService.getTypes();
      setResourceTypes(types);
    } catch (error) {
      console.error('Error loading resource types:', error);
    }
  };

  const handleCreateResource = async () => {
    try {
      await resourceService.create(formData);
      setOpenDialog(false);
      setFormData({
        name: '',
        type: '',
        location_name: '',
        description: '',
        contact_info: '',
        availability: 'available',
        capacity: ''
      });
    } catch (error) {
      setError('Failed to create resource');
      console.error('Error creating resource:', error);
    }
  };

  const resourcesArray = Array.isArray(resources) ? resources : [];
  const filteredResources = selectedType 
    ? resourcesArray.filter(resource => resource.type === selectedType)
    : resourcesArray;



  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Resource Map
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadResources}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Resource
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Resource Locations
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Filter by Type</InputLabel>
                  <Select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    label="Filter by Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {resourceTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ height: 500, width: '100%' }}>
                <MapContainer
                  center={[40.7128, -74.0060]} // Default to NYC
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {filteredResources.map((resource) => (
                    resource.location && (
                      <Marker
                        key={resource.id}
                        position={[resource.location.lat, resource.location.lon]}
                      >
                        <Popup>
                          <Box>
                            <Typography variant="h6">{resource.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Type: {resource.type}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Location: {resource.location_name}
                            </Typography>
                            {resource.description && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {resource.description}
                              </Typography>
                            )}
                            <Chip
                              label={resource.availability}
                              color={resource.availability === 'available' ? 'success' : 'warning'}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resources ({filteredResources.length})
            </Typography>
            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
              {filteredResources.map((resource) => (
                <ListItem key={resource.id} divider>
                  <ListItemText
                    primary={resource.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          📍 {resource.location_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Type: {resource.type}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            label={resource.availability}
                            color={resource.availability === 'available' ? 'success' : 'warning'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Resource Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Resource</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Resource Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              label="Type"
            >
              {resourceTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Location Name"
            fullWidth
            variant="outlined"
            value={formData.location_name}
            onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Contact Information"
            fullWidth
            variant="outlined"
            value={formData.contact_info}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Availability</InputLabel>
            <Select
              value={formData.availability}
              onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
              label="Availability"
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="limited">Limited</MenuItem>
              <MenuItem value="unavailable">Unavailable</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Capacity"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateResource} variant="contained">
            Create Resource
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourceMap;
