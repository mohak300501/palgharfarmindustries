import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, IconButton, Paper, Tooltip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import type { Community } from '../../types';

interface CommunitiesTableProps {
  communities: Community[];
  onDeleteCommunity: (community: Community) => void;
  onEditCommunity: (community: Community) => void;
}

const CommunitiesTable = ({ communities, onDeleteCommunity, onEditCommunity }: CommunitiesTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Info</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {communities.map((community) => (
            <TableRow key={community.id}>
              <TableCell>{community.name.charAt(0).toUpperCase() + community.name.slice(1)}</TableCell>
              <TableCell>{community.description}</TableCell>
              <TableCell>
                {community.info ? (
                  <Tooltip title={community.info}>
                    <span>{community.info.length > 50 ? `${community.info.substring(0, 50)}...` : community.info}</span>
                  </Tooltip>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>No info</span>
                )}
              </TableCell>
              <TableCell>{community.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</TableCell>
              <TableCell>
                <Tooltip title="Edit Community">
                  <IconButton color="primary" onClick={() => onEditCommunity(community)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Community">
                  <IconButton color="error" onClick={() => onDeleteCommunity(community)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CommunitiesTable; 