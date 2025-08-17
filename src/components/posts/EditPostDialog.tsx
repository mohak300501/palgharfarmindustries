import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import type { Post } from "../../types";

interface EditPostDialogProps {
  open: boolean;
  onClose: () => void;
  post: Post | null;
  onPostChange: (field: string, value: string) => void;
  onSavePost: () => void;
}

const EditPostDialog = ({
  open,
  onClose,
  post,
  onPostChange,
  onSavePost,
}: EditPostDialogProps) => {
  const categories = {'expert': "Experts' Corner", 'scheme': "Schemes and Subsidies", 'success': "Success Stories", 'product': "Products and Services", 'tourism': "Tourism Venues"}

  if (!post) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Post</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
          sx={{
            backgroundColor: "#f5f5f5",
            p: 2,
            borderRadius: 1,
            border: "1px solid #e0e0e0",
          }}
        >
          <strong>Formatting Instructions:</strong>
          <br />• <code>[text](url)</code> for links
          <br />• <code>*text*</code> for <strong>bold</strong>
          <br />• <code>_text_</code> for <em>italics</em>
          <br />• <code>`text`</code> for{" "}
          <span
            style={{
              backgroundColor: "#ffeb3b",
              padding: "1px 3px",
              borderRadius: "2px",
            }}
          >
            highlight
          </span>
          <br />• <code>~text~</code> for{" "}
          <span style={{ textDecoration: "underline" }}>underline</span>
          <br />• <code>- text</code> for bullet points
        </Typography>
        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={post.title}
          onChange={(e) => onPostChange("title", e.target.value)}
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={post.category}
            label="Category"
            onChange={(e) => onPostChange("category", e.target.value)}
          >
            {Object.entries(categories).map(([category, label]) => (
              <MenuItem key={category} value={category}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Content"
          fullWidth
          margin="normal"
          multiline
          rows={6}
          value={post.content}
          onChange={(e) => onPostChange("content", e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSavePost} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostDialog;
