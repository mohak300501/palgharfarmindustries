import { Paper, Typography, Stack } from '@mui/material';
import type { Member, Community } from '../../types';

interface AdminStatsProps {
  members: Member[];
  communities: Community[];
}

const AdminStats = ({ members, communities }: AdminStatsProps) => {
  const getStats = () => {
    const totalMembers = members.length;
    const totalCommunities = communities.length;
    const totalVillages = new Set(members.map(m => m.profile.village).filter(Boolean)).size;
    
    return { totalMembers, totalCommunities, totalVillages };
  };

  const stats = getStats();

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" mb={1} textAlign="center">Statistics</Typography>
      <Stack direction="row" spacing={4} justifyContent="center">
        <Typography>Total Members: {stats.totalMembers}</Typography>
        <Typography>Total Communities: {stats.totalCommunities}</Typography>
        <Typography>Total Villages: {stats.totalVillages}</Typography>
      </Stack>
    </Paper>
  );
};

export default AdminStats; 