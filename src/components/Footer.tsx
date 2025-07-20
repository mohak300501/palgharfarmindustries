import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Box, Typography, Link, Stack, Paper, IconButton } from '@mui/material';
import { Email } from '@mui/icons-material';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  const [stats, setStats] = useState({ members: 0, communities: 0, villages: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const profilesSnap = await getDocs(collection(db, 'profiles'));
      const communitiesSnap = await getDocs(collection(db, 'communities'));
      
      const profiles = profilesSnap.docs.map(doc => doc.data());
      const communities = communitiesSnap.docs.map(doc => doc.data());
      
      const totalMembers = profiles.length;
      const totalCommunities = communities.length;
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
          <Typography>Members: {stats.members}</Typography>
          <Typography>Communities: {stats.communities}</Typography>
          <Typography>Villages: {stats.villages}</Typography>
        </Stack>
        
        <Stack direction="row" spacing={3} justifyContent="center" mb={2}>
          <Link href="/about" color="inherit" underline="hover">About</Link>
          <Link href="/terms" color="inherit" underline="hover">Terms & Conditions</Link>
        </Stack>
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton 
            href="/contact" 
            color="inherit" 
            size="small"
            title="Contact us"
          >
            <Email />
          </IconButton>
          <IconButton 
            href="https://github.com/your-repo" 
            target="_blank" 
            color="inherit" 
            size="small"
            title="Visit our GitHub repository"
          >
            <GitHubIcon />
          </IconButton>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" mt={2}>
          © {currentYear} Dahanu Farm Industries. All rights reserved.
        </Typography>
      </Box>
    </Paper>
  );
};

export default Footer; 