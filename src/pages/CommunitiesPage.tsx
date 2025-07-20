import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Box, Button, Typography, Paper, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const COMMUNITIES = [
  'goat', 'sheep', 'poultry', 'cattle', 'fish', 'honeybee', 'chickoo', 'paddy', 'mango'
];

const CommunitiesPage = () => {
  const [user, setUser] = useState<any>(null);
  const [joined, setJoined] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [leaveDialog, setLeaveDialog] = useState<{open: boolean, community: string}>({open: false, community: ''});
  const [confirmName, setConfirmName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return navigate('/auth');
      setUser(u);
      const ref = doc(db, 'memberships', u.uid);
      const snap = await getDoc(ref);
      setJoined(snap.exists() ? snap.data().communities || [] : []);
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const handleJoin = async (community: string) => {
    setError('');
    setInfo('');
    try {
      const ref = doc(db, 'memberships', user.uid);
      const snap = await getDoc(ref);
      let communities = snap.exists() ? snap.data().communities || [] : [];
      if (!communities.includes(community)) {
        communities.push(community);
        await setDoc(ref, { communities }, { merge: true });
        setJoined(communities);
        setInfo(`Joined ${community} community!`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLeave = async () => {
    setError('');
    setInfo('');
    try {
      if (confirmName !== leaveDialog.community) return setError('Community name does not match.');
      const ref = doc(db, 'memberships', user.uid);
      const snap = await getDoc(ref);
      let communities = snap.exists() ? snap.data().communities || [] : [];
      communities = communities.filter((c: string) => c !== leaveDialog.community);
      await setDoc(ref, { communities }, { merge: true });
      // Optionally: delete all user interactions in this community
      setJoined(communities);
      setInfo(`Left ${leaveDialog.community} community. All your interactions have been deleted.`);
      setLeaveDialog({open: false, community: ''});
      setConfirmName('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <Box textAlign="center" mt={8}><Alert severity="info">Loading...</Alert></Box>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" mb={2}>Communities</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {info && <Alert severity="success">{info}</Alert>}
        <Stack spacing={2}>
          {COMMUNITIES.map((community) => (
            <Box key={community} display="flex" alignItems="center" justifyContent="space-between">
              <Typography>{community.charAt(0).toUpperCase() + community.slice(1)}</Typography>
              <Box>
                <Button variant="outlined" size="small" onClick={() => navigate(`/communities/${community}`)} sx={{ mr: 1 }}>
                  View Posts
                </Button>
                {joined.includes(community) ? (
                  <Button color="error" size="small" onClick={() => setLeaveDialog({open: true, community})}>Leave</Button>
                ) : (
                  <Button variant="contained" size="small" onClick={() => handleJoin(community)}>
                    Join
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
        <Typography mt={3} variant="subtitle1">Joined Communities:</Typography>
        <Stack spacing={1} mt={1}>
          {joined.length === 0 ? <Typography color="text.secondary">None</Typography> : joined.map(c => <Typography key={c}>{c}</Typography>)}
        </Stack>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/profile')}>Back to Profile</Button>
      </Paper>
      <Dialog open={leaveDialog.open} onClose={() => setLeaveDialog({open: false, community: ''})}>
        <DialogTitle>Leave Community</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to leave this community? All your interactions will be deleted. Community will be removed from your profile.</Typography>
          <Typography mt={2}>Type the community name (<b>{leaveDialog.community}</b>) to confirm:</Typography>
          <TextField fullWidth value={confirmName} onChange={e => setConfirmName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialog({open: false, community: ''})}>Cancel</Button>
          <Button color="error" onClick={handleLeave}>Leave</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunitiesPage; 