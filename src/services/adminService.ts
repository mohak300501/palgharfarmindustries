import { db } from '../firebase';
import { collection, doc, getDocs, deleteDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import type { Community, Member } from '../types';

export const adminService = {
  // Load all members data
  async loadMembers(): Promise<Member[]> {
    try {
      const profilesSnap = await getDocs(collection(db, 'profiles'));
      const membershipsSnap = await getDocs(collection(db, 'memberships'));
      
      const profiles = profilesSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      const memberships = membershipsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      
      return profiles.map(profile => {
        const membership = memberships.find(m => m.uid === profile.uid);
        return {
          uid: profile.uid,
          profile,
          memberships: (membership as any)?.communities || [],
          role: this.determineRole(profile, membership)
        };
      });
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Load all communities
  async loadCommunities(): Promise<Community[]> {
    try {
      const communitiesSnap = await getDocs(collection(db, 'communities'));
      return communitiesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Community));
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Determine user role
  determineRole(profile: any, membership: any): string {
    if (profile.isAdmin) return 'Admin';
    if (profile.isCreator) return 'Creator';
    if ((membership as any)?.communities?.length > 0) return 'Member';
    return 'User';
  },

  // Delete member
  async deleteMember(uid: string): Promise<void> {
    try {
      // Delete all posts by user
      const postsSnap = await getDocs(query(collection(db, 'posts'), where('authorId', '==', uid)));
      for (const postDoc of postsSnap.docs) {
        await deleteDoc(doc(db, 'posts', postDoc.id));
      }
      // Delete all comments by user
      const commentsSnap = await getDocs(query(collection(db, 'comments'), where('authorId', '==', uid)));
      for (const commentDoc of commentsSnap.docs) {
        await deleteDoc(doc(db, 'comments', commentDoc.id));
      }
      // Delete all likes/dislikes by user
      const likesSnap = await getDocs(query(collection(db, 'likes'), where('userId', '==', uid)));
      for (const likeDoc of likesSnap.docs) {
        await deleteDoc(doc(db, 'likes', likeDoc.id));
      }
      // Delete profile and membership
      await deleteDoc(doc(db, 'profiles', uid));
      await deleteDoc(doc(db, 'memberships', uid));
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Toggle creator role
  async toggleCreator(uid: string, currentRole: string): Promise<void> {
    try {
      const newRole = currentRole === 'Creator' ? 'Member' : 'Creator';
      await updateDoc(doc(db, 'profiles', uid), {
        isCreator: newRole === 'Creator'
      });
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Create community
  async createCommunity(name: string, description: string, info: string): Promise<void> {
    try {
      const communityData = {
        name: name.toLowerCase(),
        description,
        info,
        createdAt: new Date()
      };
      await addDoc(collection(db, 'communities'), communityData);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Update community
  async updateCommunity(communityId: string, updates: { name?: string; description?: string; info?: string }): Promise<void> {
    try {
      const communityRef = doc(db, 'communities', communityId);
      const updateData: any = {};
      
      if (updates.name !== undefined) {
        updateData.name = updates.name.toLowerCase();
      }
      if (updates.description !== undefined) {
        updateData.description = updates.description;
      }
      if (updates.info !== undefined) {
        updateData.info = updates.info;
      }
      
      await updateDoc(communityRef, updateData);
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  // Delete community and all its data
  async deleteCommunity(community: Community): Promise<void> {
    try {
      // Delete community
      await deleteDoc(doc(db, 'communities', community.id));
      
      // Delete all posts in this community
      const postsSnap = await getDocs(collection(db, `communities/${community.id}/posts`));
      const deletePromises = postsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Remove community from all memberships
      const membershipsSnap = await getDocs(collection(db, 'memberships'));
      const updatePromises = membershipsSnap.docs.map(doc => {
        const data = doc.data();
        if (data.communities && data.communities.includes(community.name)) {
          const updatedCommunities = data.communities.filter((c: string) => c !== community.name);
          return updateDoc(doc.ref, { communities: updatedCommunities });
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}; 