import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import type { Community } from '../../types';

interface DeleteCommunityDialogProps {
  open: boolean;
  onClose: () => void;
  community: Community | null;
  step: number;
  confirmName: string;
  onConfirmNameChange: (value: string) => void;
  onDelete: () => void;
}

const DeleteCommunityDialog = ({ 
  open, 
  onClose, 
  community, 
  step, 
  confirmName, 
  onConfirmNameChange, 
  onDelete 
}: DeleteCommunityDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Community</DialogTitle>
      <DialogContent>
        {step === 1 && (
          <Typography>
            Are you sure you want to delete this community? This will delete ALL data in this community - posts, comments, and likes/dislikes!
          </Typography>
        )}
        {step === 2 && (
          <>
            <Typography>
              Please check again, are you sure? Be prepared to incur the wrath of members if you wrongfully delete this community!
            </Typography>
            <Typography mt={2}>
              Type the community name (<b>{community?.name}</b>) to confirm deletion:
            </Typography>
            <TextField
              fullWidth
              value={confirmName}
              onChange={e => onConfirmNameChange(e.target.value)}
              sx={{ mt: 1 }}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          color="error" 
          onClick={onDelete}
          disabled={step === 2 && confirmName !== community?.name}
        >
          {step === 1 ? 'Continue' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCommunityDialog; 