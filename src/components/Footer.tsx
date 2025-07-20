import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Box, Typography, Link, Stack, Paper } from '@mui/material';

const Footer = () => {
  const [stats, setStats] = useState({ members: 0, communities: 0, villages: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const profilesSnap = await getDocs(collection(db, 'profiles'));
      const membershipsSnap = await getDocs(collection(db, 'memberships'));
      
      const profiles = profilesSnap.docs.map(doc => doc.data());
      const memberships = membershipsSnap.docs.map(doc => doc.data());
      
      const totalMembers = profiles.length;
      const totalCommunities = new Set(memberships.flatMap(m => m.communities || [])).size;
      const totalVillages = new Set(profiles.map(p => p.village).filter(Boolean)).size;
      
      setStats({ members: totalMembers, communities: totalCommunities, villages: totalVillages });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Paper sx={{ mt: 4, p: 3, bgcolor: 'grey.100' }}>
      <Box textAlign="center">
        <Typography variant="h6" mb={2}>Dahanu Farm Industries Portal</Typography>
        
        <Stack direction="row" spacing={4} justifyContent="center" mb={2}>
          <Typography>Total Members: {stats.members}</Typography>
          <Typography>Total Communities: {stats.communities}</Typography>
          <Typography>Total Villages: {stats.villages}</Typography>
        </Stack>
        
        <Stack direction="row" spacing={3} justifyContent="center">
          <Link href="/about" color="inherit" underline="hover">About</Link>
          <Link href="/contact" color="inherit" underline="hover">Contact</Link>
          <Link href="/terms" color="inherit" underline="hover">Terms & Conditions</Link>
          <Link href="https://github.com/your-repo" target="_blank" color="inherit" underline="hover">GitHub</Link>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" mt={2}>
          © {currentYear} Dahanu Farm Industries. All rights reserved.
        </Typography>
      </Box>
    </Paper>
  );
};

export default Footer; 