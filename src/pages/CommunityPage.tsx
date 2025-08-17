import { useEffect, useState } from 'react';
import { Box, Button, Typography, Alert, Paper, Stack } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { communityService } from '../services/communityService';
import type { Community } from '../types';

const CommunityPage = () => {
  const { communityName } = useParams();
  const { user, isJoined, loading, setUserRole, setIsJoined } = useAuth(communityName);
  const [communityData, setCommunityData] = useState<Community | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (communityName) {
      loadCommunityData();
    }
  }, [communityName]);

  const loadCommunityData = async () => {
    if (!communityName) return;
    try {
      const community = await communityService.loadCommunityData(communityName);
      if (community) {
        setCommunityData(community);
        // Load member count
        const count = await communityService.getMemberCount(communityName);
        setMemberCount(count);
      } else {
        setError('Community not found');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      setError('Please login to join this community');
      return;
    }
    setError('');
    setInfo('');
    try {
      await communityService.joinCommunity(user.uid, communityName!);
      setIsJoined(true);
      setUserRole('member');
      setInfo(`Joined ${communityData?.name || communityName} community! You can now interact with posts and comments.`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleViewPosts = (postType: string) => {
    navigate(`/c/${communityName}/p/${postType}`);
  };

  if (loading) return <Box textAlign="center" mt={8}><Alert severity="info">Loading...</Alert></Box>;
  if (!communityName || !communityData) return <Box textAlign="center" mt={8}><Alert severity="error">Community not found</Alert></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {info && <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert>}

      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          {communityData.name.charAt(0).toUpperCase() + communityData.name.slice(1)} Community
        </Typography>
        
        {communityData.description && (
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
            {communityData.description}
          </Typography>
        )}

        <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
          <Box textAlign="center">
            <Typography variant="h5" color="primary">
              {memberCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Members
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          <Button variant="contained" onClick={() => handleViewPosts('expert')}>
            Experts' Corner
          </Button>
          <Button variant="contained" onClick={() => handleViewPosts('scheme')}>
            Schemes and Subsidies
          </Button>
          <Button variant="contained" onClick={() => handleViewPosts('success')}>
            Success Stories
          </Button>
          <Button variant="contained" onClick={() => handleViewPosts('product')}>
            Products and Services
          </Button>
          <Button variant="contained" onClick={() => handleViewPosts('tourism')}>
            Tourism Venues
          </Button>
        </Stack>
      </Paper>

      {/* Community Info Card */}
      {communityData.info && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            About this community
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
            {communityData.info}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CommunityPage;
