import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, IconButton, Button, Paper } from '@mui/material';
import { Delete } from '@mui/icons-material';
import type { Member } from '../../types';

interface MembersTableProps {
  members: Member[];
  onDeleteMember: (uid: string) => void;
  onToggleCreator: (uid: string, currentRole: string) => void;
}

const MembersTable = ({ members, onDeleteMember, onToggleCreator }: MembersTableProps) => {
  return (
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
          {members.map((member) => (
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
                    onClick={() => onToggleCreator(member.uid, member.role)}
                    sx={{ mr: 1 }}
                  >
                    {member.role === 'Creator' ? 'Remove Creator' : 'Make Creator'}
                  </Button>
                )}
                <IconButton color="error" onClick={() => onDeleteMember(member.uid)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MembersTable; 