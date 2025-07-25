import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Box, Button, Typography, Paper, Stack, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // User is logged in
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loading) return <Box textAlign="center" mt={8}><Alert severity="info">Loading...</Alert></Box>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 350, textAlign: 'center' }}>
        {user ? (
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5">Welcome, {user.displayName || user.email}!</Typography>
            {!user.emailVerified && (
              <Alert severity="warning">Please verify your email to access all features.</Alert>
            )}
            <Typography variant="body1" color="text.secondary">
              Explore communities using the navigation bar above to view posts and interact with other members.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/profile')}>Go to Profile</Button>
            <Button color="error" onClick={handleLogout}>Logout</Button>
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5">Welcome to Palghar Farm Industries Portal</Typography>
            <Typography variant="body1" color="text.secondary">
              Browse communities using the navigation bar above. Login to join communities and interact with posts.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/auth')}>Login / Register</Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default HomePage; 