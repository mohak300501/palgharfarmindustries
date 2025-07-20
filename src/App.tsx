import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityPostsPage from './pages/CommunityPostsPage';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#388e3c' },
    secondary: { main: '#fbc02d' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
            <Routes>
              <Route path="/auth/*" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/communities/:community" element={<CommunityPostsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/*" element={<HomePage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
