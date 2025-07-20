import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import type { Community } from '../../types';

interface EditCommunityDialogProps {
  open: boolean;
  onClose: () => void;
  community: Community | null;
  editedCommunity: { name: string; description: string; info: string };
  onEditedCommunityChange: (field: string, value: string) => void;
  onUpdateCommunity: () => void;
}

const EditCommunityDialog = ({ 
  open, 
  onClose, 
  community,
  editedCommunity, 
  onEditedCommunityChange, 
  onUpdateCommunity 
}: EditCommunityDialogProps) => {
  if (!community) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Community: {community.name}</DialogTitle>
      <DialogContent>
        <TextField
          label="Community Name"
          fullWidth
          margin="normal"
          value={editedCommunity.name}
          onChange={e => onEditedCommunityChange('name', e.target.value)}
          required
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={editedCommunity.description}
          onChange={e => onEditedCommunityChange('description', e.target.value)}
          required
        />
        <TextField
          label="Community Info"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={editedCommunity.info}
          onChange={e => onEditedCommunityChange('info', e.target.value)}
          placeholder="Add detailed information about this community, its purpose, rules, and what members can expect..."
          helperText="This information will be displayed on the community page"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onUpdateCommunity} variant="contained">Update</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCommunityDialog; 