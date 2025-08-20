import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { communityCategories } from '../../services/categoryService'

interface CreateCommunityDialogProps {
  open: boolean;
  onClose: () => void;
  newCommunity: { name: string; description: string; info: string; category: string };
  onNewCommunityChange: (field: string, value: string) => void;
  onCreateCommunity: () => void;
}

const CreateCommunityDialog = ({
  open,
  onClose,
  newCommunity,
  onNewCommunityChange,
  onCreateCommunity
}: CreateCommunityDialogProps) => {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Community</DialogTitle>
      <DialogContent>
        <TextField
          label="Community Name"
          fullWidth
          margin="normal"
          value={newCommunity.name}
          onChange={e => onNewCommunityChange('name', e.target.value)}
          required
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={newCommunity.description}
          onChange={e => onNewCommunityChange('description', e.target.value)}
          required
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={newCommunity.category}
            label="Category"
            onChange={e => onNewCommunityChange('category', e.target.value)}
          >
            {Object.entries(communityCategories).map(([category, label]) => (
              <MenuItem key={category} value={category}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Community Info"
          fullWidth
          margin="normal"
          multiline
          rows={4}
          value={newCommunity.info}
          onChange={e => onNewCommunityChange('info', e.target.value)}
          placeholder="Add detailed information about this community, its purpose, rules, and what members can expect..."
          helperText="This information will be displayed on the community page"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onCreateCommunity} variant="contained">Create</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCommunityDialog;
