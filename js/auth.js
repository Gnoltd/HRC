/* =====================================================
   auth.js — Firebase Authentication & user management
   ===================================================== */

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

/* ---- User profile CRUD ---- */

async function createUserProfile(uid, email, displayName, photoURL, role, status) {
  const profile = {
    uid,
    email,
    displayName: displayName || email.split('@')[0],
    photoURL: photoURL || null,
    role: role || 'user',
    status: status || 'pending',
    createdAt: new Date().toISOString(),
  };
  await db.ref('users/' + uid).set(profile);
  return profile;
}

async function getUserProfile(uid) {
  const snapshot = await db.ref('users/' + uid).once('value');
  return snapshot.val();
}

async function getAllUsers() {
  if (!db) return [];
  try {
    const snapshot = await db.ref('users').once('value');
    const data = snapshot.val();
    if (!data) return [];
    return Object.values(data);
  } catch (err) {
    console.error('getAllUsers:', err);
    return [];
  }
}

async function updateUserProfile(uid, updates) {
  await db.ref('users/' + uid).update(updates);
}

async function adminExists() {
  const snapshot = await db.ref('users').orderByChild('role').equalTo('admin').once('value');
  return !!snapshot.val();
}

/* ---- Sign in / register ---- */

async function signInWithGoogle() {
  const result = await auth.signInWithPopup(googleProvider);
  const { uid, email, displayName, photoURL } = result.user;
  let profile = await getUserProfile(uid);
  if (!profile) {
    profile = await createUserProfile(uid, email, displayName, photoURL);
  }
  return { user: result.user, profile };
}

async function signInWithEmail(email, password) {
  const result = await auth.signInWithEmailAndPassword(email, password);
  const { uid, displayName } = result.user;
  let profile = await getUserProfile(uid);
  if (!profile) {
    profile = await createUserProfile(uid, email, displayName || null, null);
  }
  return { user: result.user, profile };
}

async function registerWithEmail(email, password, displayName) {
  const result = await auth.createUserWithEmailAndPassword(email, password);
  if (displayName) await result.user.updateProfile({ displayName });
  const profile = await createUserProfile(result.user.uid, email, displayName || null, null);
  return { user: result.user, profile };
}

async function authSignOut() {
  adminLogout();
  await auth.signOut();
}

/* ---- Password management ---- */

async function sendPasswordReset(email) {
  await auth.sendPasswordResetEmail(email);
}

async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not signed in');
  if (!user.providerData.some(p => p.providerId === 'password')) {
    throw new Error('Password change is only available for email/password accounts. Google sign-in accounts manage passwords via Google.');
  }
  const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
  await user.reauthenticateWithCredential(credential);
  await user.updatePassword(newPassword);
}

/* ---- Current user helpers ---- */

function getCurrentAuthUser() {
  return auth.currentUser;
}

async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  return getUserProfile(user.uid);
}
