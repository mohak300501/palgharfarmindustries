import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { Box, Button, TextField, Typography, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Card, CardContent, CardActions, Paper } from '@mui/material';
import { ThumbUp, ThumbDown, Comment, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  likes: string[];
  dislikes: string[];
  comments: Comment[];
}

interface Comment {
  id?: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  likes: string[];
  dislikes: string[];
}

const CommunityPostsPage = () => {
  const { community } = useParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [commentDialog, setCommentDialog] = useState<{open: boolean, postId: string}>({open: false, postId: ''});
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [isJoined, setIsJoined] = useState(false);
  const [joinDialog, setJoinDialog] = useState(false);
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check user role and membership
        const profileRef = doc(db, 'profiles', u.uid);
        const profileSnap = await getDoc(profileRef);
        const profile = profileSnap.exists() ? profileSnap.data() : {};
        const membershipRef = doc(db, 'memberships', u.uid);
        const membershipSnap = await getDoc(membershipRef);
        const joined = membershipSnap.exists() ? membershipSnap.data().communities || [] : [];
        setIsJoined(joined.includes(community));
        if (joined.includes(community)) {
          setUserRole('member');
          // Check if creator or admin
          if (profile.isAdmin) setUserRole('admin');
          else if (profile.isCreator) setUserRole('creator');
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [community]);

  useEffect(() => {
    if (community) {
      loadPosts();
    }
  }, [community]);

  const loadPosts = async () => {
    if (!community) return;
    try {
      const q = query(collection(db, `communities/${community}/posts`), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const postsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user) {
      setError('Please login to join this community');
      return;
    }
    setError('');
    setInfo('');
    try {
      const ref = doc(db, 'memberships', user.uid);
      const snap = await getDoc(ref);
      let communities = snap.exists() ? snap.data().communities || [] : [];
      if (!communities.includes(community)) {
        communities.push(community);
        await setDoc(ref, { communities }, { merge: true });
        setIsJoined(true);
        setUserRole('member');
        setInfo(`Joined ${community} community! You can now interact with posts and comments.`);
      }
      setJoinDialog(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLeaveCommunity = async () => {
    if (confirmName !== community) {
      setError('Community name does not match.');
      return;
    }
    setError('');
    setInfo('');
    try {
      const ref = doc(db, 'memberships', user.uid);
      const snap = await getDoc(ref);
      let communities = snap.exists() ? snap.data().communities || [] : [];
      communities = communities.filter((c: string) => c !== community);
      await setDoc(ref, { communities }, { merge: true });
      setIsJoined(false);
      setUserRole('user');
      setInfo(`Left ${community} community. All your interactions have been deleted.`);
      setLeaveDialog(false);
      setConfirmName('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !community) return;
    setLoading(true);
    setError('');
    try {
      const postData = {
        title: newPost.title,
        content: newPost.content,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: new Date(),
        likes: [],
        dislikes: [],
        comments: []
      };
      await addDoc(collection(db, `communities/${community}/posts`), postData);
      setInfo('Post created!');
      setCreateDialog(false);
      setNewPost({ title: '', content: '' });
      loadPosts();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!user || !community) return;
    setLoading(true);
    setError('');
    try {
      const commentData = {
        content: newComment,
        authorId: user.uid,
        authorName: user.displayName || user.email,
        createdAt: new Date(),
        likes: [],
        dislikes: []
      };
      const postRef = doc(db, `communities/${community}/posts`, commentDialog.postId);
      const postSnap = await getDoc(postRef);
      const post = postSnap.data() as Post;
      const comments = post.comments || [];
      comments.push(commentData);
      await updateDoc(postRef, { comments });
      setInfo('Comment added!');
      setCommentDialog({open: false, postId: ''});
      setNewComment('');
      loadPosts();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLike = async (postId: string, type: 'like' | 'dislike') => {
    if (!user || !community) return;
    if (!isJoined) {
      setError('Please join this community to interact with posts');
      return;
    }
    try {
      const postRef = doc(db, `communities/${community}/posts`, postId);
      const postSnap = await getDoc(postRef);
      const post = postSnap.data() as Post;
      const likes = post.likes || [];
      const dislikes = post.dislikes || [];
      
      if (type === 'like') {
        if (likes.includes(user.uid)) {
          likes.splice(likes.indexOf(user.uid), 1);
        } else {
          likes.push(user.uid);
          dislikes.splice(dislikes.indexOf(user.uid), 1);
        }
      } else {
        if (dislikes.includes(user.uid)) {
          dislikes.splice(dislikes.indexOf(user.uid), 1);
        } else {
          dislikes.push(user.uid);
          likes.splice(likes.indexOf(user.uid), 1);
        }
      }
      
      await updateDoc(postRef, { likes, dislikes });
      loadPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user || !community) return;
    try {
      await deleteDoc(doc(db, `communities/${community}/posts`, postId));
      setInfo('Post deleted!');
      loadPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <Box textAlign="center" mt={8}><Alert severity="info">Loading...</Alert></Box>;
  if (!community) return <Box textAlign="center" mt={8}><Alert severity="error">Community not found</Alert></Box>;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" mb={2} textAlign="center">
        {community.charAt(0).toUpperCase() + community.slice(1)} Community
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {info && <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert>}
      
      {/* Community Join/Leave Section */}
      <Paper sx={{ p: 2, mb: 3, textAlign: 'center' }}>
        {!user ? (
          <Box>
            <Typography variant="h6" mb={1}>Join this community to interact with posts and comments</Typography>
            <Button variant="contained" onClick={() => navigate('/auth')}>
              Login to Join
            </Button>
          </Box>
        ) : !isJoined ? (
          <Box>
            <Typography variant="h6" mb={1}>Do you want to join this community?</Typography>
            <Typography variant="body2" mb={2} color="text.secondary">
              You will be able to interact with posts and comments. It will be added to your profile.
            </Typography>
            <Button variant="contained" onClick={() => setJoinDialog(true)}>
              Join Community
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" mb={1}>You are a member of this community</Typography>
            <Button variant="outlined" color="error" onClick={() => setLeaveDialog(true)}>
              Leave Community
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Create Post Button */}
      {(userRole === 'creator' || userRole === 'admin') && isJoined && (
        <Box textAlign="center" mb={3}>
          <Button variant="contained" onClick={() => setCreateDialog(true)}>
            Create New Post
          </Button>
        </Box>
      )}

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
            <Card key={post.id}>
              <CardContent>
                <Typography variant="h6">{post.title}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Added by {post.authorName} on {post.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{post.content}</Typography>
              </CardContent>
              <CardActions>
                <IconButton 
                  onClick={() => handleLike(post.id, 'like')} 
                  color={post.likes?.includes(user?.uid) ? 'primary' : 'default'}
                  disabled={!isJoined}
                >
                  <ThumbUp />
                </IconButton>
                <Typography>{post.likes?.length || 0}</Typography>
                <IconButton 
                  onClick={() => handleLike(post.id, 'dislike')} 
                  color={post.dislikes?.includes(user?.uid) ? 'primary' : 'default'}
                  disabled={!isJoined}
                >
                  <ThumbDown />
                </IconButton>
                <Typography>{post.dislikes?.length || 0}</Typography>
                {isJoined && (
                  <IconButton onClick={() => setCommentDialog({open: true, postId: post.id})}>
                    <Comment />
                  </IconButton>
                )}
                {(user?.uid === post.authorId || userRole === 'admin') && (
                  <IconButton color="error" onClick={() => handleDeletePost(post.id)}>
                    <Delete />
                  </IconButton>
                )}
              </CardActions>
              {post.comments && post.comments.length > 0 && (
                <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" mb={1}>Comments:</Typography>
                  {post.comments.map((comment, idx) => (
                    <Box key={idx} sx={{ ml: 2, mb: 1 }}>
                      <Typography variant="body2">
                        <strong>{comment.authorName}</strong>: {comment.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          ))
        )}
      </Stack>

      {/* Join Community Dialog */}
      <Dialog open={joinDialog} onClose={() => setJoinDialog(false)}>
        <DialogTitle>Join Community</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to join this community? You will be able to interact with posts and comments. It will be added to your profile.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialog(false)}>Cancel</Button>
          <Button onClick={handleJoinCommunity} variant="contained">Join</Button>
        </DialogActions>
      </Dialog>

      {/* Leave Community Dialog */}
      <Dialog open={leaveDialog} onClose={() => setLeaveDialog(false)}>
        <DialogTitle>Leave Community</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to leave this community? All your interactions will be deleted. Community will be removed from your profile.</Typography>
          <Typography mt={2}>Type the community name (<b>{community}</b>) to confirm:</Typography>
          <TextField fullWidth value={confirmName} onChange={e => setConfirmName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialog(false)}>Cancel</Button>
          <Button color="error" onClick={handleLeaveCommunity}>Leave</Button>
        </DialogActions>
      </Dialog>

      {/* Create Post Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Post</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Formatting instructions:
            • [text](url) for links
            • *text* for bold
            • _text_ for italics
            • `text` for highlight
            • ~text~ for underline
            • * followed by space for bullet points
          </Typography>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={newPost.title}
            onChange={e => setNewPost({...newPost, title: e.target.value})}
            required
          />
          <TextField
            label="Content"
            fullWidth
            margin="normal"
            multiline
            rows={6}
            value={newPost.content}
            onChange={e => setNewPost({...newPost, content: e.target.value})}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePost} variant="contained">Create Post</Button>
        </DialogActions>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog open={commentDialog.open} onClose={() => setCommentDialog({open: false, postId: ''})}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <TextField
            label="Comment"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog({open: false, postId: ''})}>Cancel</Button>
          <Button onClick={handleAddComment} variant="contained">Add Comment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunityPostsPage; 