import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Community } from '../../types';

interface CommunitySidebarProps {
  community: Community;
  memberCount: number;
  postCount: number;
  user: any;
  isJoined: boolean;
  onJoinCommunity: () => void;
  onLeaveCommunity: () => void;
}

const CommunitySidebar = ({
  community,
  memberCount,
  postCount,
  user,
  isJoined,
  onJoinCommunity,
  onLeaveCommunity
}: CommunitySidebarProps) => {
  const navigate = useNavigate();

  return (
    <Paper sx={{ p: 2 }}>
      {/* Community Info */}
      <Typography variant="h5" mb={1} textAlign="center">
        {community.name.charAt(0).toUpperCase() + community.name.slice(1)} Community
      </Typography>
      
      {community.description && (
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
          {community.description}
        </Typography>
      )}
      
      {/* Community Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, mb: 3 }}>
        <Box textAlign="center">
          <Typography variant="h6" color="primary">
            {memberCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Members
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6" color="primary">
            {postCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Posts
          </Typography>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', my: 2 }} />

      {/* Join/Leave Section */}
      {!user ? (
        <Box>
          <Typography variant="h6" mb={1}>Join this community to interact with posts and comments</Typography>
          <Button variant="contained" onClick={() => navigate('/auth')}>
            Login to Join
          </Button>
        </Box>
      ) : !isJoined ? (
        <Box>
          <Typography variant="h6" mb={1}>Do you want to join this community?</Typography>
          <Typography variant="body2" mb={2} color="text.secondary">
            You will be able to interact with posts and comments. It will be added to your profile.
          </Typography>
          <Button variant="contained" onClick={onJoinCommunity}>
            Join Community
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6" mb={1}>You are a member of this community</Typography>
          <Button variant="outlined" color="error" onClick={onLeaveCommunity}>
            Leave Community
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default CommunitySidebar; 