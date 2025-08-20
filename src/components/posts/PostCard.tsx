import { Card, CardContent, CardActions, Typography, IconButton, Box } from '@mui/material';
import { ThumbUp, ThumbDown, Comment, Delete, Edit } from '@mui/icons-material';
import type { Post } from '../../types';
import { formatText } from '../../utils/textFormatter';

interface PostCardProps {
  post: Post;
  user: any;
  isJoined: boolean;
  userRole: string;
  category: string;
  onLike: (postId: string, type: 'like' | 'dislike') => void;
  onComment: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (post: Post) => void;
  comments: any[];
  likes: any[];
  onDeleteComment: (commentId: string) => void;
}

const PostCard = ({ 
  post, 
  user, 
  isJoined, 
  userRole,
  onLike, 
  onComment, 
  onDelete,
  onEdit,
  comments,
  likes,
  onDeleteComment
}: PostCardProps) => {
  // Calculate like/dislike counts and user reaction
  const likeCount = likes.filter(l => l.type === 'like').length;
  const dislikeCount = likes.filter(l => l.type === 'dislike').length;
  const userLike = likes.find(l => l.userId === user?.uid && l.type === 'like');
  const userDislike = likes.find(l => l.userId === user?.uid && l.type === 'dislike');
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{post.title}</Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Added by {post.authorName} on {post.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: formatText(post.content) }}
        />
      </CardContent>
      <CardActions>
        <IconButton 
          onClick={() => onLike(post.id, 'like')} 
          color={userLike ? 'primary' : 'default'}
          disabled={!isJoined}
        >
          <ThumbUp />
        </IconButton>
        <Typography>{likeCount}</Typography>
        <IconButton 
          onClick={() => onLike(post.id, 'dislike')} 
          color={userDislike ? 'primary' : 'default'}
          disabled={!isJoined}
        >
          <ThumbDown />
        </IconButton>
        <Typography>{dislikeCount}</Typography>
        {isJoined && (
          <IconButton onClick={() => onComment(post.id)}>
            <Comment />
          </IconButton>
        )}
        {(user?.uid === post.authorId || userRole === 'admin') && (
          <>
            {user?.uid === post.authorId && (
              <IconButton color="primary" onClick={() => onEdit(post)}>
                <Edit />
              </IconButton>
            )}
            <IconButton color="error" onClick={() => onDelete(post.id)}>
              <Delete />
            </IconButton>
          </>
        )}
      </CardActions>
      {comments && comments.length > 0 && (
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" mb={1}>Comments:</Typography>
          {comments.map((comment, idx) => (
            <Box key={idx} sx={{ ml: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                <strong>{comment.authorName}</strong>: {comment.content}
              </Typography>
              {(user?.uid === comment.authorId || userRole === 'admin') && (
                <IconButton size="small" color="error" onClick={() => onDeleteComment(comment.id)}>
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
};

export default PostCard; 