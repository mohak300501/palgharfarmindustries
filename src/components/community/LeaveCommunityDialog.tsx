import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';

interface LeaveCommunityDialogProps {
  open: boolean;
  onClose: () => void;
  communityName: string;
  confirmName: string;
  onConfirmNameChange: (value: string) => void;
  onLeave: () => void;
}

const LeaveCommunityDialog = ({ 
  open, 
  onClose, 
  communityName, 
  confirmName, 
  onConfirmNameChange, 
  onLeave 
}: LeaveCommunityDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Leave Community</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to leave this community? All your interactions will be deleted. Community will be removed from your profile.
        </Typography>
        <Typography mt={2}>
          Type the community name (<b>{communityName}</b>) to confirm:
        </Typography>
        <TextField 
          fullWidth 
          value={confirmName} 
          onChange={e => onConfirmNameChange(e.target.value)} 
          sx={{ mt: 1 }} 
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onLeave}>Leave</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveCommunityDialog; 