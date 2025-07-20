import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { updateEmail, sendPasswordResetEmail, onAuthStateChanged, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { Box, Button, TextField, Typography, Paper, Stack, Alert, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DeleteAccountDialog } from '../components/community';
import { adminService } from '../services/adminService';

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return navigate('/auth');
      setUser(u);
      const ref = doc(db, 'profiles', u.uid);
      const snap = await getDoc(ref);
      setProfile(snap.exists() ? snap.data() : {});
      setLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const handleChange = (e: any) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await setDoc(doc(db, 'profiles', user.uid), profile, { merge: true });
      setInfo('Profile updated!');
      setEdit(false);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEmailChange = async () => {
    setError('');
    setInfo('');
    try {
      await updateEmail(user, profile.email);
      setInfo('Email updated! Please verify your new email.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setInfo('');
    try {
      await sendPasswordResetEmail(auth, user.email);
      setInfo('Password reset email sent!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setError('');
    setInfo('');
    try {
      // 1. Delete all posts by user
      const postsSnap = await getDocs(query(collection(db, 'posts'), where('authorId', '==', user.uid)));
      for (const postDoc of postsSnap.docs) {
        await deleteDoc(doc(db, 'posts', postDoc.id));
      }
      // 2. Delete all comments by user
      const commentsSnap = await getDocs(query(collection(db, 'comments'), where('authorId', '==', user.uid)));
      for (const commentDoc of commentsSnap.docs) {
        await deleteDoc(doc(db, 'comments', commentDoc.id));
      }
      // 3. Delete all likes/dislikes by user
      const likesSnap = await getDocs(query(collection(db, 'likes'), where('userId', '==', user.uid)));
      for (const likeDoc of likesSnap.docs) {
        await deleteDoc(doc(db, 'likes', likeDoc.id));
      }
      // 4. Delete user profile and membership
      await adminService.deleteMember(user.uid);
      // 5. Delete user from Firebase Auth
      await deleteUser(user);
      setInfo('Account deleted successfully.');
      setTimeout(() => {
        navigate('/auth');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to delete account.');
    }
    setDeleteLoading(false);
  };

  if (loading) return <Box textAlign="center" mt={8}><Alert severity="info">Loading...</Alert></Box>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 350, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" mb={2} textAlign="center">Profile</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {info && <Alert severity="success">{info}</Alert>}
        <Stack spacing={2}>
          <TextField label="First Name" name="firstName" value={profile.firstName || ''} onChange={handleChange} disabled={!edit} />
          <TextField label="Last Name" name="lastName" value={profile.lastName || ''} onChange={handleChange} disabled={!edit} />
          <TextField label="Email" name="email" value={user.email} disabled />
          <Link component="button" onClick={handleEmailChange} disabled={!edit}>Change Email (link will be sent)</Link>
          <Link component="button" onClick={handlePasswordReset}>Reset Password</Link>
          <TextField label="Mobile" name="mobile" value={profile.mobile || ''} onChange={handleChange} disabled={!edit} />
          <TextField label="Village" name="village" value={profile.village || ''} onChange={handleChange} disabled={!edit} />
          <TextField label="Taluka" name="taluka" value={profile.taluka || ''} onChange={handleChange} disabled={!edit} />
          <TextField label="District" name="district" value={profile.district || ''} onChange={handleChange} disabled={!edit} />
          <TextField label="State" name="state" value={profile.state || ''} onChange={handleChange} disabled={!edit} />
          {edit ? (
            <Button variant="contained" onClick={handleSave}>Save</Button>
          ) : (
            <Button variant="outlined" onClick={() => setEdit(true)}>Edit</Button>
          )}
          <Button onClick={() => navigate('/')}>Back to Home</Button>
          <Button color="error" variant="outlined" onClick={() => setDeleteDialogOpen(true)}>
            Delete Account
          </Button>
        </Stack>
      </Paper>
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setConfirmName(''); }}
        fullName={`${profile.firstName || ''} ${profile.lastName || ''}`.trim()}
        confirmName={confirmName}
        onConfirmNameChange={setConfirmName}
        onDelete={handleDeleteAccount}
        loading={deleteLoading}
      />
    </Box>
  );
};

export default ProfilePage; 