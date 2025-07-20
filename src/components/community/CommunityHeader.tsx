import { Typography } from '@mui/material';
import type { Community } from '../../types';

interface CommunityHeaderProps {
  community: Community;
}

const CommunityHeader = ({ 
  community
}: CommunityHeaderProps) => {
  return (
    <>
      <Typography variant="h4" mb={2} textAlign="center">
        {community.name.charAt(0).toUpperCase() + community.name.slice(1)} Community
      </Typography>
      
    </>
  );
};

export default CommunityHeader; 