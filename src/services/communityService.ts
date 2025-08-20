import { db } from '../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc, query, orderBy, setDoc, where } from 'firebase/firestore';
import type { Community, Post } from '../types';

export const communityService = {
  // Load community data by name
  async loadCommunityData(communityName: string): Promise<Community | null> {
    try {
      const communitiesRef = collection(db, 'communities');
      const q = query(communitiesRef, where('name', '==', communityName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const communityDoc = querySnapshot.docs[0];
        return { id: communityDoc.id, ...communityDoc.data() } as Community;
      }
      return null;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Load posts for a community (now from top-level 'posts' collection)
  async loadPosts(communityId: string, postCategory?: string): Promise<Post[]> {
    try {
      let q;
      if (postCategory) {
        q = query(
          collection(db, 'posts'),
          where('communityId', '==', communityId),
          where('category', '==', postCategory),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'posts'),
          where('communityId', '==', communityId),
          orderBy('createdAt', 'desc')
        );
      }
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Join community
  async joinCommunity(userId: string, communityName: string): Promise<void> {
    try {
      const ref = doc(db, 'memberships', userId);
      const snap = await getDoc(ref);
      let communities = snap.exists() ? snap.data().communities || [] : [];
      if (!communities.includes(communityName)) {
        communities.push(communityName);
        await setDoc(ref, { communities }, { merge: true });
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Leave community
  async leaveCommunity(userId: string, communityName: string): Promise<void> {
    try {
      const ref = doc(db, 'memberships', userId);
      const snap = await getDoc(ref);
      let communities = snap.exists() ? snap.data().communities || [] : [];
      communities = communities.filter((c: string) => c !== communityName);
      await setDoc(ref, { communities }, { merge: true });
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Create post (now in 'posts' collection)
  async createPost(communityId: string, postData: Omit<Post, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'posts'), { ...postData, communityId });
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Add comment to post (now in 'comments' collection)
  async addComment(communityId: string, postId: string, commentData: any): Promise<void> {
    try {
      await addDoc(collection(db, 'comments'), { ...commentData, postId, communityId });
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Handle like/dislike (now in 'likes' collection)
  async handleReaction(targetType: 'post' | 'comment', targetId: string, userId: string, type: 'like' | 'dislike'): Promise<void> {
    try {
      // Check if a like/dislike already exists for this user/target
      const likesRef = collection(db, 'likes');
      const q = query(likesRef, where('targetType', '==', targetType), where('targetId', '==', targetId), where('userId', '==', userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        // If same type, remove (toggle off). If different, update.
        const likeDoc = snap.docs[0];
        if (likeDoc.data().type === type) {
          await deleteDoc(doc(db, 'likes', likeDoc.id));
        } else {
          await updateDoc(doc(db, 'likes', likeDoc.id), { type });
        }
      } else {
        await addDoc(likesRef, { targetType, targetId, userId, type });
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Update post (now in 'posts' collection)
  async updatePost(postId: string, postData: Partial<Post>): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, postData);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Delete post (now in 'posts' collection)
  async deletePost(postId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      // Optionally: delete all comments and likes for this post
      // (not implemented here for brevity)
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Get member count for a community
  async getMemberCount(communityName: string): Promise<number> {
    try {
      const membershipsRef = collection(db, 'memberships');
      const q = query(membershipsRef, where('communities', 'array-contains', communityName));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Get total post count for a community
  async getTotalPostCount(communityId: string): Promise<number> {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('communityId', '==', communityId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
};
