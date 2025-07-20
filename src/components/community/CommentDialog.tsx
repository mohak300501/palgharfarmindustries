import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  comment: string;
  onCommentChange: (value: string) => void;
  onAddComment: () => void;
}

const CommentDialog = ({ 
  open, 
  onClose, 
  comment, 
  onCommentChange, 
  onAddComment 
}: CommentDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Comment</DialogTitle>
      <DialogContent>
        <TextField
          label="Comment"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={comment}
          onChange={e => onCommentChange(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onAddComment} variant="contained">Add Comment</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog; 