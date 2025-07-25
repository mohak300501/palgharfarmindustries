import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface Community {
  id: string;
  name: string;
  description: string;
  createdAt: any;
}

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userRole, setUserRole] = useState('user');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

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
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const communitiesSnap = await getDocs(collection(db, 'communities'));
      const communitiesData = communitiesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Community));
      setCommunities(communitiesData);
    } catch (err) {
      console.error('Error loading communities:', err);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    handleUserMenuClose();
    navigate('/');
  };

  const handleCommunityClick = (community: Community) => {
    navigate(`/c/${community.name}`);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActiveCommunity = (community: Community) => {
    return location.pathname === `/c/${community.name}`;
  };

  const drawer = (
    <Box>
      <Typography variant="h6" sx={{ p: 2, textAlign: 'center' }}>
        Communities
      </Typography>
      <List>
        {communities.map((community) => (
          <ListItemButton
            key={community.id}
            onClick={() => handleCommunityClick(community)}
            selected={isActiveCommunity(community)}
          >
            <ListItemText 
              primary={community.name.charAt(0).toUpperCase() + community.name.slice(1)}
              sx={{ textAlign: 'center' }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            🌾 Palghar Farm Industries
          </Typography>

          {/* Desktop Community Tabs */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, justifyContent: 'center' }}>
            {communities.map((community) => (
              <Button
                key={community.id}
                color="inherit"
                onClick={() => handleCommunityClick(community)}
                sx={{
                  mx: 0.5,
                  backgroundColor: isActiveCommunity(community) ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {community.name.charAt(0).toUpperCase() + community.name.slice(1)}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user ? (
              <>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleUserMenuOpen}
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                    Profile
                  </MenuItem>
                  {userRole === 'admin' && (
                    <MenuItem onClick={() => { navigate('/admin'); handleUserMenuClose(); }}>
                      Admin Panel
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" onClick={() => navigate('/auth')}>
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar; 