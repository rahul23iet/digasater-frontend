import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment
} from '@mui/material';
import { Search, TrendingUp, Refresh } from '@mui/icons-material';
import { socialMediaService } from '../services/socialMediaService';
import { useSocket } from '../context/SocketContext';
import { safeFormatDate } from '../utils/dateUtils';

const SocialMedia = () => {
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrendingKeywords();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('social_media_updated', (data) => {
        console.log('Social media updated:', data);
        // Update search results if they match current query
        if (searchQuery && data.query === searchQuery) {
          setSearchResults(data.posts);
        }
      });

      socket.on('trending_keywords_updated', (keywords) => {
        setTrendingKeywords(keywords);
      });

      return () => {
        socket.off('social_media_updated');
        socket.off('trending_keywords_updated');
      };
    }
  }, [socket, searchQuery]);

  const loadTrendingKeywords = async () => {
    try {
      const keywords = await socialMediaService.getTrending();
      setTrendingKeywords(keywords);
    } catch (error) {
      setError('Failed to load trending keywords');
      console.error('Error loading trending keywords:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await socialMediaService.search({
        query: searchQuery,
        limit: 50
      });
      setSearchResults(results);
    } catch (error) {
      setError('Failed to search social media');
      console.error('Error searching social media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    setActiveTab(0); // Switch to search tab
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'twitter':
        return '🐦';
      case 'bluesky':
        return '🦋';
      default:
        return '📱';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'twitter':
        return '#1DA1F2';
      case 'bluesky':
        return '#00D4FF';
      default:
        return '#757575';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Social Media Monitoring
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadTrendingKeywords}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<Search />} label="Search" />
          <Tab icon={<TrendingUp />} label="Trending" />
        </Tabs>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search social media posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                >
                  Search
                </Button>
              </Box>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {searchResults.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Search Results ({searchResults.length})
                  </Typography>
                  <List>
                    {(Array.isArray(searchResults) ? searchResults : []).map((post, index) => (
                      <ListItem key={index} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getPlatformColor(post.platform) }}>
                            {getPlatformIcon(post.platform)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={post.content}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                By {post.author} • {safeFormatDate(post.created_at, 'MMM dd, yyyy HH:mm')}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={post.platform}
                                  size="small"
                                  sx={{ bgcolor: getPlatformColor(post.platform), color: 'white' }}
                                />
                                {post.hashtags?.map((tag, i) => (
                                  <Chip
                                    key={i}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleKeywordClick(tag)}
                                    sx={{ cursor: 'pointer' }}
                                  />
                                ))}
                              </Box>
                              {post.engagement && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    👍 {post.engagement.likes} • 
                                    🔄 {post.engagement.shares} • 
                                    💬 {post.engagement.comments}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {searchResults.length === 0 && searchQuery && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No posts found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try searching for different keywords or hashtags
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Trending Keywords
              </Typography>
              
              {trendingKeywords.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No trending keywords available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check back later for trending topics
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {(Array.isArray(trendingKeywords) ? trendingKeywords : []).map((keyword, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 2 }
                        }}
                        onClick={() => handleKeywordClick(keyword.keyword)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" component="h3">
                              {keyword.keyword}
                            </Typography>
                            <Chip
                              label={keyword.count}
                              color="primary"
                              size="small"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={keyword.platform}
                              size="small"
                              sx={{ bgcolor: getPlatformColor(keyword.platform), color: 'white' }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Score: {keyword.trend_score?.toFixed(2)}
                            </Typography>
                          </Box>

                          {keyword.related_disasters && keyword.related_disasters.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Related disasters:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                {(Array.isArray(keyword.related_disasters) ? keyword.related_disasters : []).slice(0, 3).map((disaster, i) => (
                                  <Chip
                                    key={i}
                                    label={disaster}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quick Search Suggestions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Search Suggestions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['earthquake', 'flood', 'hurricane', 'wildfire', 'emergency', 'rescue', 'evacuation', 'shelter'].map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              onClick={() => handleKeywordClick(suggestion)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default SocialMedia;
