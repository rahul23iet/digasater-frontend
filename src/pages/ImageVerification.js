import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Cancel,
  Warning,
  Visibility
} from '@mui/icons-material';
import { disasterService } from '../services/disasterService';
import { useSocket } from '../context/SocketContext';
import { safeFormatDate } from '../utils/dateUtils';

const ImageVerification = () => {
  const { socket } = useSocket();
  const [imageUrl, setImageUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('image_verification_complete', (data) => {
        console.log('Image verification complete:', data);
        if (data.batch_id) {
          // Update batch results
          setBatchResults(prev => prev.map(item => 
            item.batch_id === data.batch_id ? { ...item, ...data } : item
          ));
        } else {
          // Single image result
          setResult(data);
          setVerificationHistory(prev => [data, ...prev]);
        }
      });

      socket.on('batch_verification_progress', (data) => {
        console.log('Batch verification progress:', data);
        setBatchResults(prev => prev.map(item => 
          item.batch_id === data.batch_id ? { ...item, progress: data.progress } : item
        ));
      });

      return () => {
        socket.off('image_verification_complete');
        socket.off('batch_verification_progress');
      };
    }
  }, [socket]);

  const handleSingleVerification = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await disasterService.verifyImage(imageUrl);
      setResult(response);
      setVerificationHistory(prev => [response, ...prev]);
    } catch (error) {
      setError('Failed to verify image');
      console.error('Error verifying image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchVerification = async () => {
    const urls = batchUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) {
      setError('Please enter at least one image URL');
      return;
    }

    setBatchLoading(true);
    setError(null);

    try {
      const response = await disasterService.verifyImageBatch(urls);
      setBatchResults(prev => [{
        batch_id: response.batch_id,
        urls: urls,
        status: 'processing',
        progress: 0,
        created_at: new Date().toISOString()
      }, ...prev]);
    } catch (error) {
      setError('Failed to start batch verification');
      console.error('Error starting batch verification:', error);
    } finally {
      setBatchLoading(false);
    }
  };

  const getVerificationIcon = (isDisasterRelated) => {
    if (isDisasterRelated === true) return <CheckCircle color="success" />;
    if (isDisasterRelated === false) return <Cancel color="error" />;
    return <Warning color="warning" />;
  };

  const getVerificationColor = (isDisasterRelated) => {
    if (isDisasterRelated === true) return 'success';
    if (isDisasterRelated === false) return 'error';
    return 'warning';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Image Verification
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Verify if images are related to disasters using AI analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Single Image Verification */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Single Image Verification
              </Typography>
              
              <TextField
                fullWidth
                label="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Visibility />}
                onClick={handleSingleVerification}
                disabled={loading || !imageUrl.trim()}
                fullWidth
              >
                {loading ? 'Verifying...' : 'Verify Image'}
              </Button>

              {result && (
                <Paper sx={{ mt: 3, p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getVerificationIcon(result.is_disaster_related)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Verification Result
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <img
                      src={result.image_url}
                      alt="Verified"
                      style={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                        borderRadius: 8
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={result.is_disaster_related ? 'Disaster Related' : 'Not Disaster Related'}
                      color={getVerificationColor(result.is_disaster_related)}
                    />
                    <Chip
                      label={`Confidence: ${(result.confidence * 100).toFixed(1)}%`}
                      color={getConfidenceColor(result.confidence)}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Analysis:</strong> {result.analysis}
                  </Typography>

                  {result.detected_objects && result.detected_objects.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Detected Objects:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(Array.isArray(result.detected_objects) ? result.detected_objects : []).map((obj, index) => (
                          <Chip
                            key={index}
                            label={obj}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {result.disaster_types && result.disaster_types.length > 0 && (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Potential Disaster Types:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(Array.isArray(result.disaster_types) ? result.disaster_types : []).map((type, index) => (
                          <Chip
                            key={index}
                            label={type}
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Batch Verification */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Batch Image Verification
              </Typography>
              
              <TextField
                fullWidth
                label="Image URLs (one per line)"
                multiline
                rows={6}
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                startIcon={batchLoading ? <CircularProgress size={20} /> : <CloudUpload />}
                onClick={handleBatchVerification}
                disabled={batchLoading || !batchUrls.trim()}
                fullWidth
              >
                {batchLoading ? 'Starting Batch...' : 'Start Batch Verification'}
              </Button>

              {batchResults.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Batch Results
                  </Typography>
                  {(Array.isArray(batchResults) ? batchResults : []).map((batch, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">
                          Batch #{batch.batch_id?.slice(-6)}
                        </Typography>
                        <Chip
                          label={batch.status || 'processing'}
                          color={batch.status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {batch.urls?.length} images • {safeFormatDate(batch.created_at, 'MMM dd, HH:mm')}
                      </Typography>

                      {batch.progress !== undefined && batch.status !== 'completed' && (
                        <Box sx={{ mb: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={batch.progress} 
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {batch.progress}% complete
                          </Typography>
                        </Box>
                      )}

                      {batch.results && (
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Results: {(Array.isArray(batch.results) ? batch.results : []).filter(r => r.is_disaster_related).length} disaster-related, {(Array.isArray(batch.results) ? batch.results : []).filter(r => !r.is_disaster_related).length} not related
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Verification History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Verifications
              </Typography>
              
              {verificationHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No verification history yet
                </Typography>
              ) : (
                <List>
                  {(Array.isArray(verificationHistory) ? verificationHistory : []).slice(0, 10).map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'transparent' }}>
                            {getVerificationIcon(item.is_disaster_related)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                {item.is_disaster_related ? 'Disaster Related' : 'Not Disaster Related'}
                              </Typography>
                              <Chip
                                label={`${(item.confidence * 100).toFixed(1)}%`}
                                size="small"
                                color={getConfidenceColor(item.confidence)}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {item.analysis}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {safeFormatDate(item.created_at || Date.now(), 'MMM dd, yyyy HH:mm')}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < verificationHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImageVerification;
