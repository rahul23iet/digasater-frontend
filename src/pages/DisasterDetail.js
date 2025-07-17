import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Twitter,
  Map,
  Update,
  PhotoCamera,
  ArrowBack
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisaster } from '../context/DisasterContext';
import { useSocket } from '../context/SocketContext';
import { disasterService } from '../services/disasterService';
import { safeFormatDate } from '../utils/dateUtils';

const DisasterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentDisaster, fetchDisaster, loading } = useDisaster();
  const { socket, joinDisasterRoom, leaveDisasterRoom } = useSocket();
  const [activeTab, setActiveTab] = useState(0);
  const [socialMedia, setSocialMedia] = useState([]);
  const [resources, setResources] = useState([]);
  const [officialUpdates, setOfficialUpdates] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDisaster(id);
      joinDisasterRoom(id);
      loadDisasterData();
    }

    return () => {
      if (id) {
        leaveDisasterRoom(id);
      }
    };
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on('social_media_updated', (data) => {
        if (data.disaster_id === id) {
          setSocialMedia(data.posts);
        }
      });

      socket.on('resource_created', (resource) => {
        if (resource.disaster_id === id) {
          setResources(prev => [resource, ...prev]);
        }
      });

      socket.on('official_updates_fetched', (data) => {
        if (data.disaster_id === id) {
          setOfficialUpdates(data.updates);
        }
      });

      return () => {
        socket.off('social_media_updated');
        socket.off('resource_created');
        socket.off('official_updates_fetched');
      };
    }
  }, [socket, id]);

  const loadDisasterData = async () => {
    if (!id) return;
    
    setLoadingData(true);
    try {
      const [socialData, resourceData, updatesData] = await Promise.all([
        disasterService.getSocialMedia(id),
        disasterService.getResources(id),
        disasterService.getOfficialUpdates(id)
      ]);

      setSocialMedia(socialData);
      setResources(resourceData);
      setOfficialUpdates(updatesData);
    } catch (error) {
      console.error('Error loading disaster data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getSeverityColor = (tags) => {
    if (tags?.includes('critical')) return 'error';
    if (tags?.includes('high')) return 'warning';
    if (tags?.includes('medium')) return 'info';
    return 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentDisaster) {
    return (
      <Alert severity="error">
        Disaster not found
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/disasters')}
          sx={{ mr: 2 }}
        >
          Back to Disasters
        </Button>
        <Typography variant="h4" component="h1">
          {currentDisaster.title}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Disaster Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {currentDisaster.location_name}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="action" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {safeFormatDate(currentDisaster.created_at, 'MMMM dd, yyyy HH:mm')}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentDisaster.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {currentDisaster.tags?.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    color={getSeverityColor(currentDisaster.tags)}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab icon={<Twitter />} label="Social Media" />
              <Tab icon={<Map />} label="Resources" />
              <Tab icon={<Update />} label="Official Updates" />
              <Tab icon={<PhotoCamera />} label="Image Verification" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {loadingData && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {activeTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Social Media Posts
                  </Typography>
                  {socialMedia.length === 0 ? (
                    <Typography color="text.secondary">
                      No social media posts found for this disaster.
                    </Typography>
                  ) : (
                    <List>
                      {(Array.isArray(socialMedia) ? socialMedia : []).map((post, index) => (
                        <ListItem key={index} divider>
                          <ListItemAvatar>
                            <Avatar>
                              {post.platform === 'twitter' ? '🐦' : '🦋'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={post.content}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  By {post.author} • {safeFormatDate(post.created_at, 'MMM dd, HH:mm')}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  {post.hashtags?.map((tag, i) => (
                                    <Chip key={i} label={tag} size="small" variant="outlined" />
                                  ))}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Available Resources
                  </Typography>
                  {resources.length === 0 ? (
                    <Typography color="text.secondary">
                      No resources found for this disaster.
                    </Typography>
                  ) : (
                    <List>
                      {(Array.isArray(resources) ? resources : []).map((resource, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={resource.name}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  📍 {resource.location_name}
                                </Typography>
                                <Typography variant="body2">
                                  Type: {resource.type}
                                </Typography>
                                {resource.description && (
                                  <Typography variant="body2">
                                    {resource.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Official Updates
                  </Typography>
                  {officialUpdates.length === 0 ? (
                    <Typography color="text.secondary">
                      No official updates found for this disaster.
                    </Typography>
                  ) : (
                    <List>
                      {officialUpdates.map((update, index) => (
                        <ListItem key={index} divider>
                          <ListItemText
                            primary={update.title}
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {update.content}
                                </Typography>
                                <Typography variant="caption">
                                  Source: {update.source} • {safeFormatDate(update.published_at, 'MMM dd, yyyy HH:mm')}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Image Verification
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/image-verification')}
                  >
                    Go to Image Verification
                  </Button>
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Map />}
                onClick={() => navigate('/resources')}
              >
                View on Map
              </Button>
              <Button
                variant="outlined"
                startIcon={<Twitter />}
                onClick={() => navigate('/social-media')}
              >
                Monitor Social Media
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => navigate('/image-verification')}
              >
                Verify Images
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Social Media Posts:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {socialMedia.length}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Resources:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {resources.length}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Official Updates:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {officialUpdates.length}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DisasterDetail;
