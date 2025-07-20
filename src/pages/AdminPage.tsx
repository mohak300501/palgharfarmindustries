import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { Box, Button, TextField, Typography, Paper, Stack, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Delete, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Member {
  uid: string;
  profile: any;
  memberships: string[];
  role: string;
}

const AdminPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [filter, setFilter] = useState({ field: '', value: '' });
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return navigate('/auth');
      // Check if user is admin (simplified for now - you'll need to implement proper role checking)
      const profileRef = doc(db, 'profiles', u.uid);
      const profileSnap = await getDoc(profileRef);
      const profile = profileSnap.exists() ? profileSnap.data() : {};
      if (!profile.isAdmin) {
        setError('Access denied. Admin privileges required.');
        return;
      }
      loadMembers();
    });
    return () => unsub();
  }, [navigate]);

  const loadMembers = async () => {
    try {
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
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const determineRole = (profile: any, membership: any): string => {
    // Simplified role determination - in real app, this would be more sophisticated
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
      // Delete profile
      await deleteDoc(doc(db, 'profiles', uid));
      // Delete memberships
      await deleteDoc(doc(db, 'memberships', uid));
      setInfo('Member deleted successfully!');
      loadMembers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStats = () => {
    const totalMembers = members.length;
    const totalCommunities = new Set(members.flatMap(m => m.memberships)).size;
    const totalVillages = new Set(members.map(m => m.profile.village).filter(Boolean)).size;
    
    return { totalMembers, totalCommunities, totalVillages };
  };

  if (loading) return <Box textAlign="center" mt={8}><Alert severity="info">Loading...</Alert></Box>;

  const stats = getStats();

  return (
    <Box sx={{ width: '100%' }}>
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
                  <IconButton color="error" onClick={() => handleDeleteMember(member.uid)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box textAlign="center" mt={2}>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Box>
    </Box>
  );
};

export default AdminPage; 