import { Box, Button, Typography, Stack, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Post } from '../../types';
import PostCard from './PostCard';

interface PostsListProps {
  posts: Post[];
  user: any;
  isJoined: boolean;
  userRole: string;
  category: string;
  onLike: (postId: string, type: 'like' | 'dislike') => void;
  onComment: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (post: Post) => void;
  onCreatePost: () => void;
  filterByCreator: boolean;
  onFilterByCreatorChange: (filter: boolean) => void;
  sortOrder: 'newest' | 'oldest';
  onSortOrderChange: (order: 'newest' | 'oldest') => void;
  comments: any[];
  likes: any[];
  onDeleteComment: (commentId: string) => void;
}

const PostsList = ({
  posts,
  user,
  isJoined,
  userRole,
  category,
  onLike,
  onComment,
  onDelete,
  onEdit,
  onCreatePost,
  filterByCreator,
  onFilterByCreatorChange,
  sortOrder,
  onSortOrderChange,
  comments,
  likes,
  onDeleteComment
}: PostsListProps) => {
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    onFilterByCreatorChange(event.target.value === 'true');
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    onSortOrderChange(event.target.value as 'newest' | 'oldest');
  };

  return (
    <Box>
      {/* Create Post Button */}
      {(userRole === 'creator' || userRole === 'admin') && isJoined && (
        <Box textAlign="center" mb={3}>
          <Button variant="contained" onClick={onCreatePost}>
            Create New Post
          </Button>
        </Box>
      )}

      {/* Filter and Sort Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Creator Filter - Only show for creators */}
        {userRole === 'creator' && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter Posts</InputLabel>
            <Select
              value={filterByCreator ? 'true' : 'false'}
              label="Filter Posts"
              onChange={handleFilterChange}
            >
              <MenuItem value="false">All Posts</MenuItem>
              <MenuItem value="true">My Posts Only</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Sort Order - Available for all users */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sort Order</InputLabel>
          <Select
            value={sortOrder}
            label="Sort Order"
            onChange={handleSortChange}
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Posts */}
      <Stack spacing={2}>
        {posts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No posts yet</Typography>
            {isJoined && (userRole === 'creator' || userRole === 'admin') && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Be the first to create a post!
              </Typography>
            )}
          </Paper>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              isJoined={isJoined}
              userRole={userRole}
              category={category}
              onLike={onLike}
              onComment={onComment}
              onDelete={onDelete}
              onEdit={onEdit}
              comments={comments.filter(c => c.postId === post.id)}
              likes={likes.filter(l => l.targetId === post.id && l.targetType === 'post')}
              onDeleteComment={onDeleteComment}
            />
          ))
        )}
      </Stack>
    </Box>
  );
};

export default PostsList; 