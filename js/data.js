/* =====================================================
   data.js — Firebase Realtime Database data layer
   ===================================================== */

const AUTH_KEY = 'rp_admin_auth';

/* ---- CRUD (async) ---- */
async function getAllProjects() {
  const snapshot = await db.ref('projects').once('value');
  const data = snapshot.val();
  if (!data) return [];
  return Object.values(data);
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
  const snapshot = await db.ref('projects/' + id).once('value');
  return snapshot.val();
}

async function saveProject(project) {
  await db.ref('projects/' + project.id).set(project);
}

async function deleteProject(id) {
  await db.ref('projects/' + id).remove();
}

function generateId() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

/* ---- Auth ---- */
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123'; // demo only

function adminLogin(user, pass) {
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user, loginAt: Date.now() }));
    return true;
  }
  return false;
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
  const icons = { success: '✅', error: '❌', warning: '⚠️', default: 'ℹ️' };
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
