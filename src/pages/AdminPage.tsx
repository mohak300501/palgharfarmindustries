import { useEffect, useState } from 'react';
import { Box, Button, Typography, Alert, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminService } from '../services/adminService';
import type { Community, Member } from '../types';
import MemberFilter from '../components/admin/MemberFilter';
import MembersTable from '../components/admin/MembersTable';
import CommunitiesTable from '../components/admin/CommunitiesTable';
import CreateCommunityDialog from '../components/admin/CreateCommunityDialog';
import EditCommunityDialog from '../components/admin/EditCommunityDialog';
import DeleteCommunityDialog from '../components/admin/DeleteCommunityDialog';

const AdminPage = () => {
  const { user, userRole, loading } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [filter, setFilter] = useState({ field: '', value: '' });
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [tab, setTab] = useState(0);
  const [deleteCommunityDialog, setDeleteCommunityDialog] = useState<{open: boolean, community: Community | null, step: number}>({open: false, community: null, step: 1});
  const [confirmCommunityName, setConfirmCommunityName] = useState('');
  const [newCommunityDialog, setNewCommunityDialog] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', info: '', category: '' });
  const [editCommunityDialog, setEditCommunityDialog] = useState<{open: boolean, community: Community | null}>({open: false, community: null});
  const [editedCommunity, setEditedCommunity] = useState({ name: '', description: '', info: '', category: '' });
  const [deleteMemberDialog, setDeleteMemberDialog] = useState<{open: boolean, member: Member | null, confirmName: string, error: string}>({open: false, member: null, confirmName: '', error: ''});
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (userRole !== 'admin') {
        setError('Access denied. Admin privileges required.');
        return;
      }
      loadData();
    }
  }, [user, userRole, loading, navigate]);

  const loadData = async () => {
    try {
      const [membersData, communitiesData] = await Promise.all([
        adminService.loadMembers(),
        adminService.loadCommunities()
      ]);
      
      setMembers(membersData);
      setFilteredMembers(membersData);
      setCommunities(communitiesData);
    } catch (err: any) {
      setError(err.message);
    }
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

  const handleDeleteMember = (uid: string) => {
    const member = members.find(m => m.uid === uid);
    if (!member) return;
    setDeleteMemberDialog({open: true, member, confirmName: '', error: ''});
  };

  const confirmDeleteMember = async () => {
    if (!deleteMemberDialog.member) return;
    const fullName = `${deleteMemberDialog.member.profile.firstName || ''} ${deleteMemberDialog.member.profile.lastName || ''}`.trim();
    if (deleteMemberDialog.confirmName.trim() !== fullName) {
      setDeleteMemberDialog(prev => ({...prev, error: 'Full name does not match.'}));
      return;
    }
    try {
      await adminService.deleteMember(deleteMemberDialog.member.uid);
      setInfo('Member and all their data deleted successfully!');
      setDeleteMemberDialog({open: false, member: null, confirmName: '', error: ''});
      loadData();
    } catch (err: any) {
      setDeleteMemberDialog(prev => ({...prev, error: err.message || 'Failed to delete member.'}));
    }
  };

  const handleToggleCreator = async (uid: string, currentRole: string) => {
    try {
      await adminService.toggleCreator(uid, currentRole);
      setInfo(`Member role updated to ${currentRole === 'Creator' ? 'Member' : 'Creator'}!`);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.description.trim() || !newCommunity.category.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      await adminService.createCommunity(newCommunity.name, newCommunity.description, newCommunity.info, newCommunity.category);
      setInfo('Community created successfully!');
      setNewCommunityDialog(false);
      setNewCommunity({ name: '', description: '', info: '', category: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditCommunity = (community: Community) => {
    setEditedCommunity({
      name: community.name,
      description: community.description,
      info: community.info || '',
      category: community.category
    });
    setEditCommunityDialog({ open: true, community });
  };

  const handleUpdateCommunity = async () => {
    if (!editCommunityDialog.community) return;
    
    if (!editedCommunity.name.trim() || !editedCommunity.description.trim() || !editedCommunity.category.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      await adminService.updateCommunity(editCommunityDialog.community.id, {
        name: editedCommunity.name,
        description: editedCommunity.description,
        info: editedCommunity.info,
        category: editedCommunity.category
      });
      setInfo('Community updated successfully!');
      setEditCommunityDialog({ open: false, community: null });
      setEditedCommunity({ name: '', description: '', info: '', category: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCommunity = async (community: Community) => {
    // Initial call - show first confirmation
    if (!deleteCommunityDialog.open) {
      setDeleteCommunityDialog({open: true, community, step: 1});
      return;
    }
    
    // Step 1 confirmed - move to step 2
    if (deleteCommunityDialog.step === 1) {
      setDeleteCommunityDialog({open: true, community, step: 2});
      return;
    }
    
    // Step 2 confirmed - perform deletion
    if (deleteCommunityDialog.step === 2) {
      if (confirmCommunityName !== community.name) {
        setError('Community name does not match');
        return;
      }
      
      try {
        await adminService.deleteCommunity(community);
        setInfo('Community and all its data deleted successfully!');
        setDeleteCommunityDialog({open: false, community: null, step: 1});
        setConfirmCommunityName('');
        loadData();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) return <Box textAlign="center" mt={8}><Alert severity="info">Loading...</Alert></Box>;

  return (
    <Box>
      <Typography variant="h4" mb={2} textAlign="center">Admin Panel</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {info && <Alert severity="success">{info}</Alert>}
      
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
        <Tab label="Members" />
        <Tab label="Communities" />
      </Tabs>

      {tab === 0 && (
        <>
          <MemberFilter
            filter={filter}
            onFilterChange={(field, value) => setFilter({...filter, [field]: value})}
            onFilter={handleFilter}
            onClear={() => {setFilter({field: '', value: ''}); setFilteredMembers(members);}}
          />

          <MembersTable
            members={filteredMembers}
            onDeleteMember={handleDeleteMember}
            onToggleCreator={handleToggleCreator}
          />
        </>
      )}

      {tab === 1 && (
        <>
          <Box textAlign="center" mb={2}>
            <Button variant="contained" onClick={() => setNewCommunityDialog(true)} startIcon={<Add />}>
              Create New Community
            </Button>
          </Box>

          <CommunitiesTable
            communities={communities}
            onDeleteCommunity={handleDeleteCommunity}
            onEditCommunity={handleEditCommunity}
          />
        </>
      )}

      <Box textAlign="center" mt={2}>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Box>

      {/* Dialogs */}
      <CreateCommunityDialog
        open={newCommunityDialog}
        onClose={() => setNewCommunityDialog(false)}
        newCommunity={newCommunity}
        onNewCommunityChange={(field, value) => setNewCommunity({...newCommunity, [field]: value})}
        onCreateCommunity={handleCreateCommunity}
      />

      <EditCommunityDialog
        open={editCommunityDialog.open}
        onClose={() => setEditCommunityDialog({open: false, community: null})}
        community={editCommunityDialog.community}
        editedCommunity={editedCommunity}
        onEditedCommunityChange={(field, value) => setEditedCommunity({...editedCommunity, [field]: value})}
        onUpdateCommunity={handleUpdateCommunity}
      />

      <DeleteCommunityDialog
        open={deleteCommunityDialog.open}
        onClose={() => setDeleteCommunityDialog({open: false, community: null, step: 1})}
        community={deleteCommunityDialog.community}
        step={deleteCommunityDialog.step}
        confirmName={confirmCommunityName}
        onConfirmNameChange={setConfirmCommunityName}
        onDelete={() => deleteCommunityDialog.community && handleDeleteCommunity(deleteCommunityDialog.community)}
      />

      <Dialog open={deleteMemberDialog.open} onClose={() => setDeleteMemberDialog({open: false, member: null, confirmName: '', error: ''})}>
        <DialogTitle>Delete Member</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete <b>{`${deleteMemberDialog.member?.profile.firstName || ''} ${deleteMemberDialog.member?.profile.lastName || ''}`.trim()}</b>?<br/>
            <b>This will delete ALL of this member's posts, comments, and likes/dislikes. This action cannot be undone.</b>
          </Alert>
          <TextField
            label="Type full name to confirm"
            fullWidth
            value={deleteMemberDialog.confirmName}
            onChange={e => setDeleteMemberDialog(prev => ({...prev, confirmName: e.target.value}))}
            autoFocus
          />
          {deleteMemberDialog.error && <Alert severity="error" sx={{ mt: 2 }}>{deleteMemberDialog.error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteMemberDialog({open: false, member: null, confirmName: '', error: ''})}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteMember}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;
