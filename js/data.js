/* =====================================================
   data.js — Firebase Realtime Database data layer
   ===================================================== */

const AUTH_KEY = 'rp_admin_auth';

/* ---- CRUD (async) ---- */
function dbError() { return new Error('Firebase is not initialized'); }

async function getAllProjects() {
  if (!db) { console.error('getAllProjects: Firebase is not initialized'); return []; }
  try {
    const snapshot = await db.ref('projects').once('value');
    const data = snapshot.val();
    if (!data) return [];
    return Object.values(data);
  } catch (err) {
    console.error('getAllProjects: Firebase read failed —', err.message || err);
    return [];
  }
}

async function getApprovedProjects() {
  const all = await getAllProjects();
  return all.filter(p => p.status === 'approved');
}

async function getPendingProjects() {
  const all = await getAllProjects();
  return all.filter(p => p.status === 'pending');
}

async function getProjectById(id) {
  if (!db) { console.error('getProjectById: Firebase is not initialized'); return null; }
  try {
    const snapshot = await db.ref('projects/' + id).once('value');
    return snapshot.val();
  } catch (err) {
    console.error('getProjectById: Firebase read failed —', err.message || err);
    return null;
  }
}

async function saveProject(project) {
  if (!db) throw dbError();
  await db.ref('projects/' + project.id).set(project);
}

async function deleteProject(id) {
  if (!db) throw dbError();
  await db.ref('projects/' + id).remove();
}

async function incrementDownload(id) {
  if (!db) throw dbError();
  await db.ref('projects/' + id + '/downloads').transaction(current => (current || 0) + 1);
}

/* ---- Availability Status ---- */

function getAvailabilityLabel(status) {
  if (status === 'full')     return '🟡 Full';
  if (status === 'finished') return '🔴 Finished';
  return '🟢 Available';
}

function getAvailabilityClass(status) {
  if (status === 'full')     return 'avail-full';
  if (status === 'finished') return 'avail-finished';
  return 'avail-available';
}

async function updateProjectAvailability(id, availabilityStatus) {
  if (!db) throw dbError();
  await db.ref('projects/' + id).update({ availabilityStatus });
}

async function requestProjectFinish(id) {
  if (!db) throw dbError();
  await db.ref('projects/' + id).update({
    finishRequested: true,
    finishRequestedAt: new Date().toISOString(),
  });
}

async function approveFinishRequest(id) {
  if (!db) throw dbError();
  await db.ref('projects/' + id).update({
    availabilityStatus: 'finished',
    finishRequested: false,
    finishRequestedAt: null,
  });
}

async function rejectFinishRequest(id) {
  if (!db) throw dbError();
  await db.ref('projects/' + id).update({
    finishRequested: false,
    finishRequestedAt: null,
  });
}

async function getFinishRequestedProjects() {
  const all = await getAllProjects();
  return all.filter(p => p.status === 'approved' && p.finishRequested === true);
}

function generateId() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ---- Auth ---- */

function setAdminSession(profile) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({
    uid: profile.uid,
    user: profile.displayName || profile.email,
    email: profile.email,
    role: profile.role,
    loginAt: Date.now(),
  }));
}

function getAdminSession() {
  return JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null');
}

function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY);
}

function isAdminLoggedIn() {
  return !!sessionStorage.getItem(AUTH_KEY);
}

function requireAdmin() {
  if (!isAdminLoggedIn()) {
    window.location.href = '../admin/login.html';
    return false;
  }
  return true;
}

/* ---- Categories ---- */
const CATEGORIES = [
  'Computer Science',
  'Data Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Environmental Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Mathematics',
  'Social Sciences',
  'Other',
];

const DEPARTMENTS = [
  'School of Engineering',
  'School of Science',
  'School of Social Sciences',
  'School of Business',
  'School of Humanities',
];

/* ---- Toast helper ---- */
function showToast(msg, type = 'default', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'success', error: 'error', warning: 'warning', default: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type] || icons.default}</span> ${msg}`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(120%)'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, duration);
}

/* ---- Format helpers ---- */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
