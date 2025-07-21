const admin = require('firebase-admin');

// Load service account from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateStats() {
  // Count profiles
  const profilesSnap = await db.collection('profiles').get();
  const members = profilesSnap.size;
  const villages = new Set(profilesSnap.docs.map(doc => doc.data().village).filter(Boolean)).size;

  // Count communities
  const communitiesSnap = await db.collection('communities').get();
  const communities = communitiesSnap.size;

  // Update stats document
  await db.doc('stats/public').set({
    members,
    communities,
    villages,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('Stats updated:', { members, communities, villages });
}

updateStats().then(() => process.exit()).catch(err => {
  console.error('Failed to update stats:', err);
  process.exit(1);
}); 