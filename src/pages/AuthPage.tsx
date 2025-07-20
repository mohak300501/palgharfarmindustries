import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  Box,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Link,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) navigate('/');
    });
    return () => unsub();
  }, [navigate]);

  const handleTab = (_: any, v: number) => {
    setTab(v);
    setError('');
    setInfo('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setInfo('Login successful!');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: `${firstName} ${lastName}` });
      await sendEmailVerification(cred.user);
      
      // Create member record in Firestore
      const memberData = {
        firstName,
        lastName,
        email,
        isAdmin: false,
        isCreator: false,
        createdAt: new Date(),
        // Optional fields
        mobile: '',
        village: '',
        taluka: '',
        district: '',
        state: ''
      };
      
      await setDoc(doc(db, 'profiles', cred.user.uid), memberData);
      
      setInfo('Registration successful! Please verify your email.');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSendVerification = async () => {
    if (auth.currentUser) {
      setLoading(true);
      setError('');
      try {
        await sendEmailVerification(auth.currentUser);
        setInfo('Verification email sent!');
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setInfo('Password reset email sent!');
      setShowReset(false);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Paper elevation={3} sx={{ p: 4, minWidth: 350, width: '100%', maxWidth: 450 }}>
        <Tabs value={tab} onChange={handleTab} centered>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {info && <Alert severity="success" sx={{ mt: 2 }}>{info}</Alert>}
        {showReset ? (
          <Box component="form" onSubmit={handleResetPassword} mt={2}>
            <Typography variant="h6" textAlign="center">Reset Password</Typography>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>
              {loading ? <CircularProgress size={24} /> : 'Send Reset Email'}
            </Button>
            <Button onClick={() => setShowReset(false)} fullWidth sx={{ mt: 1 }}>Back</Button>
          </Box>
        ) : tab === 0 ? (
          <Box component="form" onSubmit={handleLogin} mt={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            <Box mt={2} textAlign="center">
              <Link component="button" onClick={() => setShowReset(true)}>
                Forgot password?
              </Link>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegister} mt={2}>
            <TextField
              label="First Name"
              fullWidth
              margin="normal"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
            <TextField
              label="Last Name"
              fullWidth
              margin="normal"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 2 }}>
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </Box>
        )}
        {user && !user.emailVerified && (
          <Box mt={2} textAlign="center">
            <Alert severity="warning">
              Please verify your email address. <Button onClick={handleSendVerification} size="small">Resend Verification Email</Button>
            </Alert>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AuthPage; 