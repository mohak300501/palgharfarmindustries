import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const useAuth = (communityName?: string) => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState('user');
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check user role and membership
        const profileRef = doc(db, 'profiles', u.uid);
        const profileSnap = await getDoc(profileRef);
        const profile = profileSnap.exists() ? profileSnap.data() : {};
        
        if (communityName) {
          const membershipRef = doc(db, 'memberships', u.uid);
          const membershipSnap = await getDoc(membershipRef);
          const joined = membershipSnap.exists() ? membershipSnap.data().communities || [] : [];
          setIsJoined(joined.includes(communityName));
          
          if (joined.includes(communityName)) {
            setUserRole('member');
            // Check if creator or admin
            if (profile.isAdmin) setUserRole('admin');
            else if (profile.isCreator) setUserRole('creator');
          }
        } else {
          // For admin page, just check role
          if (profile.isAdmin) setUserRole('admin');
          else if (profile.isCreator) setUserRole('creator');
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [communityName]);

  return { user, userRole, isJoined, loading, setUserRole, setIsJoined };
}; 