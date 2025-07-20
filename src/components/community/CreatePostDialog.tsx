import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  newPost: { title: string; content: string };
  onNewPostChange: (field: string, value: string) => void;
  onCreatePost: () => void;
}

const CreatePostDialog = ({ 
  open, 
  onClose, 
  newPost, 
  onNewPostChange, 
  onCreatePost 
}: CreatePostDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Post</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          <strong>Formatting Instructions:</strong><br/>
          • <code>[text](url)</code> for links<br/>
          • <code>*text*</code> for <strong>bold</strong><br/>
          • <code>_text_</code> for <em>italics</em><br/>
          • <code>`text`</code> for <span style={{backgroundColor: '#ffeb3b', padding: '1px 3px', borderRadius: '2px'}}>highlight</span><br/>
          • <code>~text~</code> for <span style={{textDecoration: 'underline'}}>underline</span><br/>
          • <code>- text</code> for bullet points
        </Typography>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={newPost.title}
          onChange={e => onNewPostChange('title', e.target.value)}
          required
        />
        <TextField
          label="Content"
          fullWidth
          margin="normal"
          multiline
          rows={6}
          value={newPost.content}
          onChange={e => onNewPostChange('content', e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onCreatePost} variant="contained">Create Post</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostDialog; 