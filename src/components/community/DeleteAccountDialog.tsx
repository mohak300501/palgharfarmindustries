import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  fullName: string;
  confirmName: string;
  onConfirmNameChange: (value: string) => void;
  onDelete: () => void;
  loading: boolean;
}

const DeleteAccountDialog = ({ 
  open, 
  onClose, 
  fullName, 
  confirmName, 
  onConfirmNameChange, 
  onDelete,
  loading
}: DeleteAccountDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Account</DialogTitle>
      <DialogContent>
        <Typography color="error" fontWeight="bold">
          Are you sure you want to delete your account? <br/>
          <b>This action is irreversible and will delete all your posts, comments, likes/dislikes, and your account.</b>
        </Typography>
        <Typography mt={2}>
          Type your full name (<b>{fullName}</b>) to confirm:
        </Typography>
        <TextField 
          fullWidth 
          value={confirmName} 
          onChange={e => onConfirmNameChange(e.target.value)} 
          sx={{ mt: 1 }} 
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button color="error" onClick={onDelete} disabled={confirmName !== fullName || loading}>
          {loading ? 'Deleting...' : 'Delete Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog; 