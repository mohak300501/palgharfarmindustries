import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Box, Typography, Link, Stack, Paper, IconButton } from '@mui/material';
import { Email } from '@mui/icons-material';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  const [stats, setStats] = useState({ members: 0, communities: 0, villages: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsDoc = await getDoc(doc(db, 'stats', 'public'));
        if (statsDoc.exists()) {
          const data = statsDoc.data();
          setStats({
            members: typeof data.members === 'number' ? data.members : 0,
            communities: typeof data.communities === 'number' ? data.communities : 0,
            villages: typeof data.villages === 'number' ? data.villages : 0,
          });
        }
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    };
    loadStats();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <Paper sx={{ mt: 4, p: 3, bgcolor: 'grey.100' }}>
      <Box textAlign="center">
        <Typography variant="h6" mb={2}>Palghar Farm Industries Portal</Typography>
        
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
            href="https://github.com/mohak300501/palgharfarmindustries" 
            target="_blank" 
            color="inherit" 
            size="small"
            title="Visit our GitHub repository"
          >
            <GitHubIcon />
          </IconButton>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" mt={2}>
          © {currentYear} Palghar Farm Industries. All rights reserved.
        </Typography>
      </Box>
    </Paper>
  );
};

export default Footer; 