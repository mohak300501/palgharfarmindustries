import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, deleteDoc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { Box, Button, TextField, Typography, Paper, Stack, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab } from '@mui/material';
import { Delete, FilterList, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Member {
  uid: string;
  profile: any;
  memberships: string[];
  role: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  createdAt: any;
}

const AdminPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [filter, setFilter] = useState({ field: '', value: '' });
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [tab, setTab] = useState(0);
  const [deleteCommunityDialog, setDeleteCommunityDialog] = useState<{open: boolean, community: Community | null, step: number}>({open: false, community: null, step: 1});
  const [confirmCommunityName, setConfirmCommunityName] = useState('');
  const [newCommunityDialog, setNewCommunityDialog] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return navigate('/auth');
      const profileRef = doc(db, 'profiles', u.uid);
      const profileSnap = await getDoc(profileRef);
      const profile = profileSnap.exists() ? profileSnap.data() : {};
      if (!profile.isAdmin) {
        setError('Access denied. Admin privileges required.');
        return;
      }
      loadData();
    });
    return () => unsub();
  }, [navigate]);

  const loadData = async () => {
    try {
      // Load members
      const profilesSnap = await getDocs(collection(db, 'profiles'));
      const membershipsSnap = await getDocs(collection(db, 'memberships'));
      
      const profiles = profilesSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      const memberships = membershipsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      
      const membersData: Member[] = profiles.map(profile => {
        const membership = memberships.find(m => m.uid === profile.uid);
        return {
          uid: profile.uid,
          profile,
          memberships: (membership as any)?.communities || [],
          role: determineRole(profile, membership)
        };
      });
      
      setMembers(membersData);
      setFilteredMembers(membersData);

      // Load communities
      const communitiesSnap = await getDocs(collection(db, 'communities'));
      const communitiesData = communitiesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Community));
      setCommunities(communitiesData);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const determineRole = (profile: any, membership: any): string => {
    if (profile.isAdmin) return 'Admin';
    if (profile.isCreator) return 'Creator';
    if ((membership as any)?.communities?.length > 0) return 'Member';
    return 'User';
  };

  const handleFilter = () => {
    if (!filter.field || !filter.value) {
      setFilteredMembers(members);
      return;
    }
    
    const filtered = members.filter(member => {
      const value = filter.value.toLowerCase();
      switch (filter.field) {
        case 'name':
          const fullName = `${member.profile.firstName || ''} ${member.profile.lastName || ''}`.toLowerCase();
          return fullName.includes(value);
        case 'village':
          return member.profile.village?.toLowerCase().includes(value);
        case 'taluka':
          return member.profile.taluka?.toLowerCase().includes(value);
        case 'district':
          return member.profile.district?.toLowerCase().includes(value);
        case 'state':
          return member.profile.state?.toLowerCase().includes(value);
        case 'community':
          return member.memberships.some(c => c.toLowerCase().includes(value));
        default:
          return true;
      }
    });
    
    setFilteredMembers(filtered);
  };

  const handleDeleteMember = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) return;
    
    try {
      await deleteDoc(doc(db, 'profiles', uid));
      await deleteDoc(doc(db, 'memberships', uid));
      setInfo('Member deleted successfully!');
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleCreator = async (uid: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'Creator' ? 'Member' : 'Creator';
      await updateDoc(doc(db, 'profiles', uid), {
        isCreator: newRole === 'Creator'
      });
      setInfo(`Member role updated to ${newRole}!`);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      const communityData = {
        name: newCommunity.name.toLowerCase(),
        description: newCommunity.description,
        createdAt: new Date()
      };
      
      await addDoc(collection(db, 'communities'), communityData);
      setInfo('Community created successfully!');
      setNewCommunityDialog(false);
      setNewCommunity({ name: '', description: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCommunity = async (community: Community) => {
    if (deleteCommunityDialog.step === 1) {
      setDeleteCommunityDialog({open: true, community, step: 2});
      return;
    }
    
    if (deleteCommunityDialog.step === 2) {
      if (confirmCommunityName !== community.name) {
        setError('Community name does not match');
        return;
      }
      
      try {
        // Delete community
        await deleteDoc(doc(db, 'communities', community.id));
        
        // Delete all posts in this community
        const postsSnap = await getDocs(collection(db, `communities/${community.id}/posts`));
        const deletePromises = postsSnap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Remove community from all memberships
        const membershipsSnap = await getDocs(collection(db, 'memberships'));
        const updatePromises = membershipsSnap.docs.map(doc => {
          const data = doc.data();
          if (data.communities && data.communities.includes(community.name)) {
            const updatedCommunities = data.communities.filter((c: string) => c !== community.name);
            return updateDoc(doc.ref, { communities: updatedCommunities });
          }
          return Promise.resolve();
        });
        await Promise.all(updatePromises);
        
        setInfo('Community and all its data deleted successfully!');
        setDeleteCommunityDialog({open: false, community: null, step: 1});
        setConfirmCommunityName('');
        loadData();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const getStats = () => {
    const totalMembers = members.length;
    const totalCommunities = communities.length;
    const totalVillages = new Set(members.map(m => m.profile.village).filter(Boolean)).size;
    
    return { totalMembers, totalCommunities, totalVillages };
  };

  if (loading) return <Box textAlign="center" mt={8}><Alert severity="info">Loading...</Alert></Box>;

  const stats = getStats();

  return (
    <Box>
      <Typography variant="h4" mb={2} textAlign="center">Admin Panel</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {info && <Alert severity="success">{info}</Alert>}
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" mb={1} textAlign="center">Statistics</Typography>
        <Stack direction="row" spacing={4} justifyContent="center">
          <Typography>Total Members: {stats.totalMembers}</Typography>
          <Typography>Total Communities: {stats.totalCommunities}</Typography>
          <Typography>Total Villages: {stats.totalVillages}</Typography>
        </Stack>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
        <Tab label="Members" />
        <Tab label="Communities" />
      </Tabs>

      {tab === 0 && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" mb={1} textAlign="center">Filter Members</Typography>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Filter by</InputLabel>
                <Select
                  value={filter.field}
                  onChange={(e) => setFilter({...filter, field: e.target.value})}
                  label="Filter by"
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="village">Village</MenuItem>
                  <MenuItem value="taluka">Taluka</MenuItem>
                  <MenuItem value="district">District</MenuItem>
                  <MenuItem value="state">State</MenuItem>
                  <MenuItem value="community">Community</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Value"
                value={filter.value}
                onChange={(e) => setFilter({...filter, value: e.target.value})}
                sx={{ minWidth: 200 }}
              />
              <Button variant="contained" onClick={handleFilter} startIcon={<FilterList />}>
                Filter
              </Button>
              <Button onClick={() => {setFilter({field: '', value: ''}); setFilteredMembers(members);}}>
                Clear
              </Button>
            </Stack>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Village</TableCell>
                  <TableCell>Taluka</TableCell>
                  <TableCell>District</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Communities</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.uid}>
                    <TableCell>{`${member.profile.firstName || ''} ${member.profile.lastName || ''}`}</TableCell>
                    <TableCell>{member.profile.email || 'N/A'}</TableCell>
                    <TableCell>{member.profile.mobile || 'N/A'}</TableCell>
                    <TableCell>{member.profile.village || 'N/A'}</TableCell>
                    <TableCell>{member.profile.taluka || 'N/A'}</TableCell>
                    <TableCell>{member.profile.district || 'N/A'}</TableCell>
                    <TableCell>{member.profile.state || 'N/A'}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.memberships.join(', ') || 'None'}</TableCell>
                    <TableCell>
                      {member.role !== 'Admin' && (
                        <Button
                          size="small"
                          onClick={() => handleToggleCreator(member.uid, member.role)}
                          sx={{ mr: 1 }}
                        >
                          {member.role === 'Creator' ? 'Remove Creator' : 'Make Creator'}
                        </Button>
                      )}
                      <IconButton color="error" onClick={() => handleDeleteMember(member.uid)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tab === 1 && (
        <>
          <Box textAlign="center" mb={2}>
            <Button variant="contained" onClick={() => setNewCommunityDialog(true)} startIcon={<Add />}>
              Create New Community
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {communities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell>{community.name.charAt(0).toUpperCase() + community.name.slice(1)}</TableCell>
                    <TableCell>{community.description}</TableCell>
                    <TableCell>{community.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeleteCommunity(community)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Box textAlign="center" mt={2}>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Box>

      {/* Create Community Dialog */}
      <Dialog open={newCommunityDialog} onClose={() => setNewCommunityDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Community</DialogTitle>
        <DialogContent>
          <TextField
            label="Community Name"
            fullWidth
            margin="normal"
            value={newCommunity.name}
            onChange={e => setNewCommunity({...newCommunity, name: e.target.value})}
            required
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={newCommunity.description}
            onChange={e => setNewCommunity({...newCommunity, description: e.target.value})}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCommunityDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCommunity} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Community Dialog */}
      <Dialog open={deleteCommunityDialog.open} onClose={() => setDeleteCommunityDialog({open: false, community: null, step: 1})}>
        <DialogTitle>Delete Community</DialogTitle>
        <DialogContent>
          {deleteCommunityDialog.step === 1 && (
            <Typography>
              Are you sure you want to delete this community? This will delete ALL data in this community - posts, comments, and likes/dislikes...
            </Typography>
          )}
          {deleteCommunityDialog.step === 2 && (
            <>
              <Typography>
                Please check again, are you sure? Be prepared to incur the wrath of members!
              </Typography>
              <Typography mt={2}>
                Type the community name (<b>{deleteCommunityDialog.community?.name}</b>) to confirm deletion:
              </Typography>
              <TextField
                fullWidth
                value={confirmCommunityName}
                onChange={e => setConfirmCommunityName(e.target.value)}
                sx={{ mt: 1 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCommunityDialog({open: false, community: null, step: 1})}>
            Cancel
          </Button>
          <Button 
            color="error" 
            onClick={() => deleteCommunityDialog.community && handleDeleteCommunity(deleteCommunityDialog.community)}
            disabled={deleteCommunityDialog.step === 2 && confirmCommunityName !== deleteCommunityDialog.community?.name}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage; 