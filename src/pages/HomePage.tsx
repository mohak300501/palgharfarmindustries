import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Box, Button, Typography, Paper, Stack, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check user role
        const profileRef = doc(db, 'profiles', u.uid);
        const profileSnap = await getDoc(profileRef);
        const profile = profileSnap.exists() ? profileSnap.data() : {};
        if (profile.isAdmin) setUserRole('admin');
        else if (profile.isCreator) setUserRole('creator');
        else setUserRole('member');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  if (loading) return <Box textAlign="center" mt={8}><Alert severity="info">Loading...</Alert></Box>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
        {user ? (
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5">Welcome, {user.displayName || user.email}!</Typography>
            {!user.emailVerified && (
              <Alert severity="warning">Please verify your email to access all features.</Alert>
            )}
            <Button variant="contained" onClick={() => navigate('/profile')}>Go to Profile</Button>
            <Button variant="outlined" onClick={() => navigate('/communities')}>Explore Communities</Button>
            {userRole === 'admin' && (
              <Button color="secondary" onClick={() => navigate('/admin')}>Admin Panel</Button>
            )}
            <Button color="error" onClick={handleLogout}>Logout</Button>
          </Stack>
        ) : (
          <Stack spacing={2} alignItems="center">
            <Typography variant="h5">Welcome to Dahanu Farm Industries Portal</Typography>
            <Typography>To interact with communities, please login or register.</Typography>
            <Button variant="contained" onClick={() => navigate('/auth')}>Login / Register</Button>
            <Button variant="outlined" onClick={() => navigate('/communities')}>View Communities</Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default HomePage; 