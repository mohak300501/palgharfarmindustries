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
  Collapse,
} from '@mui/material';
import { Menu as MenuIcon, Add, Remove } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface Community {
  id: string;
  name: string;
  description: string;
  createdAt: any;
  category: string;
}

interface GroupedCommunities {
  [key: string]: Community[];
}

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [groupedCommunities, setGroupedCommunities] = useState<GroupedCommunities>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userRole, setUserRole] = useState('user');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [desktopMenuAnchor, setDesktopMenuAnchor] = useState<null | HTMLElement>(null);
  const [desktopMenuCategory, setDesktopMenuCategory] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
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
      const grouped = communitiesData.reduce((acc, community) => {
        const category = community.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(community);
        return acc;
      }, {} as GroupedCommunities);
      setGroupedCommunities(grouped);
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
    setDesktopMenuAnchor(null);
  };

  const isActiveCommunity = (community: Community) => {
    return location.pathname === `/c/${community.name}`;
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleDesktopMenuOpen = (event: React.MouseEvent<HTMLElement>, category: string) => {
    setDesktopMenuAnchor(event.currentTarget);
    setDesktopMenuCategory(category);
  };

  const handleDesktopMenuClose = () => {
    setDesktopMenuAnchor(null);
    setDesktopMenuCategory(null);
  };

  const drawer = (
    <Box>
      <Typography variant="h6" sx={{ p: 2, textAlign: 'left' }}>
        Categories
      </Typography>
      <List>
        {Object.keys(groupedCommunities).map(category => (
          <div key={category}>
            <ListItemButton onClick={() => toggleCategory(category)}>
              <ListItemText primary={category} />
              {openCategories.includes(category) ? <Remove /> : <Add />}
            </ListItemButton>
            <Collapse in={openCategories.includes(category)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {groupedCommunities[category].map(community => (
                  <ListItemButton
                    key={community.id}
                    onClick={() => handleCommunityClick(community)}
                    selected={isActiveCommunity(community)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemText primary={community.name.charAt(0).toUpperCase() + community.name.slice(1)} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </div>
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

          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, justifyContent: 'center' }}>
            {Object.keys(groupedCommunities).map(category => (
              <Box key={category} onMouseLeave={handleDesktopMenuClose}>
                <Button
                  color="inherit"
                  onMouseEnter={(e) => handleDesktopMenuOpen(e, category)}
                  sx={{
                    mx: 0.5,
                  }}
                >
                  {category}
                </Button>
                <Menu
                  anchorEl={desktopMenuAnchor}
                  open={Boolean(desktopMenuAnchor) && desktopMenuCategory === category}
                  onClose={handleDesktopMenuClose}
                  MenuListProps={{ onMouseLeave: handleDesktopMenuClose }}
                >
                  {groupedCommunities[category].map(community => (
                    <MenuItem
                      key={community.id}
                      onClick={() => handleCommunityClick(community)}
                      selected={isActiveCommunity(community)}
                    >
                      {community.name.charAt(0).toUpperCase() + community.name.slice(1)}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            ))}
          </Box>

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

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
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
