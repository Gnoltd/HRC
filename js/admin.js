/* =====================================================
   admin.js — Admin-side logic
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'admin-login') {
    initLoginPage();
    return;
  }

  // All other admin pages require Firebase Auth + admin role
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      if (!profile || profile.role !== 'admin' || profile.status !== 'approved') {
        await authSignOut();
        window.location.href = 'login.html';
        return;
      }
      setAdminSession(profile);

      if (page === 'admin-dashboard') await initDashboardPage();
      if (page === 'admin-pending')   await initPendingPage();
      if (page === 'admin-all')       await initAllProjectsPage();
      if (page === 'admin-review')    await initReviewPage();
      if (page === 'admin-users')     await initUsersPage();
    } catch (err) {
      console.error('Auth check failed:', err);
      window.location.href = 'login.html';
    }
  });
});

/* ===================================================
   LOGIN PAGE
   =================================================== */
function initLoginPage() {
  const form    = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');

  // If already signed in as admin, go to dashboard
  auth.onAuthStateChanged(async (user) => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile && profile.role === 'admin' && profile.status === 'approved') {
        setAdminSession(profile);
        window.location.href = 'dashboard.html';
      }
    } catch (_) {}
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pass  = document.getElementById('password').value;
    const btn   = form.querySelector('[type="submit"]');

    errorEl.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    try {
      const { profile } = await signInWithEmail(email, pass);
      if (profile.role !== 'admin') {
        await auth.signOut();
        errorEl.textContent = 'This account does not have admin privileges.';
        errorEl.classList.remove('hidden');
      } else if (profile.status !== 'approved') {
        await auth.signOut();
        errorEl.textContent = 'Your admin account is pending approval by another admin.';
        errorEl.classList.remove('hidden');
      } else {
        setAdminSession(profile);
        window.location.href = 'dashboard.html';
        return;
      }
    } catch (err) {
      errorEl.textContent = 'Invalid email or password. Please try again.';
      errorEl.classList.remove('hidden');
    }
    btn.disabled = false;
    btn.textContent = 'Sign In';
  });
}

/* ===================================================
   DASHBOARD PAGE
   =================================================== */
async function initDashboardPage() {
  renderAdminMeta();
  await renderDashboardStats();
  await renderRecentPending();
  await renderRecentApproved();
}

function renderAdminMeta() {
  const info = getAdminSession();
  const el = document.getElementById('admin-user');
  if (el) el.textContent = info ? (info.user || 'Admin') : 'Admin';
}

async function renderDashboardStats() {
  const all      = await getAllProjects();
  const pending  = all.filter(p => p.status === 'pending').length;
  const approved = all.filter(p => p.status === 'approved').length;
  const rejected = all.filter(p => p.status === 'rejected').length;
  const downloads= all.reduce((s, p) => s + (p.downloads || 0), 0);

  setText('stat-total',     all.length);
  setText('stat-pending',   pending);
  setText('stat-approved',  approved);
  setText('stat-rejected',  rejected);
  setText('stat-downloads', downloads);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

async function renderRecentPending() {
  const list = (await getPendingProjects()).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5);
  const tbody = document.getElementById('pending-tbody');
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding:1.5rem">No pending submissions</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><a href="review.html?id=${p.id}" style="font-weight:600">${p.title}</a></td>
      <td>${p.category}</td>
      <td>${formatDate(p.submittedAt)}</td>
      <td class="actions">
        <a href="review.html?id=${p.id}" class="btn btn-primary btn-sm">Review</a>
        <button class="btn btn-danger btn-sm" onclick="quickDelete('${p.id}')">Delete</button>
      </td>
    </tr>`).join('');
}

async function renderRecentApproved() {
  const list = (await getApprovedProjects()).sort((a, b) => new Date(b.reviewedAt||0) - new Date(a.reviewedAt||0)).slice(0, 5);
  const tbody = document.getElementById('approved-tbody');
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding:1.5rem">No approved projects yet</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><a href="../project-detail.html?id=${p.id}" target="_blank" style="font-weight:600">${p.title}</a></td>
      <td>${p.category}</td>
      <td>${p.downloads}</td>
      <td class="actions">
        <a href="../project-detail.html?id=${p.id}" target="_blank" class="btn btn-outline btn-sm">View</a>
        <button class="btn btn-danger btn-sm" onclick="quickDelete('${p.id}')">Delete</button>
      </td>
    </tr>`).join('');
}

async function quickDelete(id) {
  if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
  await deleteProject(id);
  showToast('Project deleted.', 'success');
  await renderDashboardStats();
  await renderRecentPending();
  await renderRecentApproved();
}

/* ===================================================
   PENDING PAGE
   =================================================== */
async function initPendingPage() {
  await renderPendingTable();
}

async function renderPendingTable() {
  const list  = (await getPendingProjects()).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const tbody = document.getElementById('pending-full-tbody');
  const count = document.getElementById('pending-count');
  if (count) count.textContent = list.length;
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:2rem"> No pending submissions</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><a href="review.html?id=${p.id}" style="font-weight:600">${p.title}</a><br>
        <span style="font-size:.8rem;color:var(--muted)">${p.department}</span></td>
      <td>${p.category}</td>
      <td>${p.supervisor}</td>
      <td>${formatDate(p.submittedAt)}</td>
      <td class="actions">
        <a href="review.html?id=${p.id}" class="btn btn-primary btn-sm"> Review</a>
        <button class="btn btn-success btn-sm" onclick="quickApprove('${p.id}')"> Approve</button>
        <button class="btn btn-danger btn-sm"  onclick="quickReject('${p.id}')"> Reject</button>
      </td>
    </tr>`).join('');
}

async function quickApprove(id) {
  const p = await getProjectById(id);
  if (!p) return;
  p.status = 'approved';
  p.reviewedAt = new Date().toISOString();
  await saveProject(p);
  showToast('Project approved!', 'success');
  await renderPendingTable();
}

async function quickReject(id) {
  const note = prompt('Reason for rejection (optional):') || '';
  const p = await getProjectById(id);
  if (!p) return;
  p.status = 'rejected';
  p.reviewedAt = new Date().toISOString();
  p.reviewNote = note;
  await saveProject(p);
  showToast('Project rejected.', 'warning');
  await renderPendingTable();
}

/* ===================================================
   ALL PROJECTS PAGE
   =================================================== */
async function initAllProjectsPage() {
  const searchEl  = document.getElementById('admin-search');
  const statusEl  = document.getElementById('status-filter');

  await renderAllTable();

  if (searchEl) searchEl.addEventListener('input', renderAllTable);
  if (statusEl) statusEl.addEventListener('change', renderAllTable);
}

async function renderAllTable() {
  const search = (document.getElementById('admin-search')?.value || '').toLowerCase();
  const status = document.getElementById('status-filter')?.value || '';
  let list = await getAllProjects();

  if (search) list = list.filter(p =>
    p.title.toLowerCase().includes(search) ||
    p.supervisor.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search));
  if (status) list = list.filter(p => p.status === status);

  list.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const tbody = document.getElementById('all-tbody');
  const count = document.getElementById('all-count');
  if (count) count.textContent = list.length;
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:2rem">No projects match your filters</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => `
    <tr>
      <td style="max-width:260px">
        <a href="${p.status === 'approved' ? '../project-detail.html?id=' + p.id : 'review.html?id=' + p.id}" style="font-weight:600">${p.title}</a>
      </td>
      <td>${p.category}</td>
      <td>${p.supervisor}</td>
      <td><span class="badge ${p.status === 'approved' ? 'badge-success' : p.status === 'rejected' ? 'badge-danger' : 'badge-warning'}">${p.status}</span></td>
      <td>${formatDate(p.submittedAt)}</td>
      <td class="actions">
        <a href="review.html?id=${p.id}" class="btn btn-outline btn-sm"> Detail</a>
        ${p.status === 'pending'  ? `<button class="btn btn-success btn-sm" onclick="adminApprove('${p.id}')">✔ Approve</button>` : ''}
        ${p.status === 'approved' ? `<button class="btn btn-danger btn-sm"  onclick="adminRejectFrom('${p.id}')">Revoke</button>` : ''}
        <button class="btn btn-danger btn-sm" onclick="adminDelete('${p.id}')">🗑 Delete</button>
      </td>
    </tr>`).join('');
}

async function adminApprove(id) {
  const p = await getProjectById(id);
  if (!p) return;
  p.status = 'approved'; p.reviewedAt = new Date().toISOString();
  await saveProject(p); showToast('Approved!', 'success'); await renderAllTable();
}

async function adminRejectFrom(id) {
  const note = prompt('Reason (optional):') || '';
  const p = await getProjectById(id);
  if (!p) return;
  p.status = 'rejected'; p.reviewedAt = new Date().toISOString(); p.reviewNote = note;
  await saveProject(p); showToast('Revoked.', 'warning'); await renderAllTable();
}

async function adminDelete(id) {
  if (!confirm('Delete this project permanently?')) return;
  await deleteProject(id); showToast('Deleted.', 'success'); await renderAllTable();
}

/* ===================================================
   REVIEW PAGE
   =================================================== */
async function initReviewPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = 'pending.html'; return; }

  const p = await getProjectById(id);
  if (!p) { window.location.href = 'pending.html'; return; }

  renderReviewDetail(p);
  setupReviewActions(p);
}

function renderReviewDetail(p) {
  const statusBadge = `<span class="badge ${p.status === 'approved' ? 'badge-success' : p.status === 'rejected' ? 'badge-danger' : 'badge-warning'}">${p.status.toUpperCase()}</span>`;

  const el = document.getElementById('review-content');
  if (!el) return;
  el.innerHTML = `
    <div class="project-detail-header">
      <div class="flex gap-1 mb-1 flex-wrap align-center">
        <span class="card-category">${p.category}</span>
        ${statusBadge}
      </div>
      <h1>${p.title}</h1>
      <div class="meta-row">
        <span> ${p.department}</span>
        <span> ${p.supervisor}</span>
        <span> <a href="mailto:${p.email}">${p.email}</a></span>
        <span> ${p.duration}</span>
        <span> ${p.slots} slot${p.slots !== 1 ? 's' : ''}</span>
        <span> Submitted ${formatDateTime(p.submittedAt)}</span>
        ${p.reviewedAt ? `<span>🔍 Reviewed ${formatDateTime(p.reviewedAt)}</span>` : ''}
      </div>
      <div class="card-tags">${(Array.isArray(p.tags) ? p.tags : []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>

    <div class="section-block">
      <h2>Description</h2>
      <p>${p.description}</p>
    </div>
    <div class="section-block">
      <h2>Requirements</h2>
      <p>${p.requirements || '—'}</p>
    </div>
    <div class="section-block">
      <h2>Expected Outcomes</h2>
      <p>${p.outcomes || '—'}</p>
    </div>
    ${p.fileName ? `
    <div class="section-block">
      <h2>Attached File</h2>
      <p>📎 <a href="${p.fileUrl}" download="${p.fileName}">${p.fileName}</a></p>
    </div>` : ''}
    ${p.reviewNote ? `
    <div class="alert alert-warning mt-2">
      <strong>Review Note:</strong> ${p.reviewNote}
    </div>` : ''}`;
}

function setupReviewActions(p) {
  const approveBtn = document.getElementById('btn-approve');
  const rejectBtn  = document.getElementById('btn-reject');
  const deleteBtn  = document.getElementById('btn-delete');
  const noteEl     = document.getElementById('review-note');

  if (approveBtn) {
    if (p.status === 'approved') { approveBtn.disabled = true; approveBtn.textContent = '✔ Already Approved'; }
    approveBtn.addEventListener('click', async () => {
      p.status = 'approved';
      p.reviewedAt = new Date().toISOString();
      p.reviewNote = noteEl?.value?.trim() || '';
      await saveProject(p);
      showToast('Project approved and published!', 'success');
      setTimeout(() => window.location.href = 'pending.html', 1200);
    });
  }

  if (rejectBtn) {
    if (p.status === 'rejected') { rejectBtn.disabled = true; rejectBtn.textContent = '✖ Already Rejected'; }
    rejectBtn.addEventListener('click', async () => {
      const note = noteEl?.value?.trim() || '';
      if (!note && !confirm('Reject without a note?')) return;
      p.status = 'rejected';
      p.reviewedAt = new Date().toISOString();
      p.reviewNote = note;
      await saveProject(p);
      showToast('Project rejected.', 'warning');
      setTimeout(() => window.location.href = 'pending.html', 1200);
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Permanently delete this project?')) return;
      await deleteProject(p.id);
      showToast('Deleted.', 'success');
      setTimeout(() => window.location.href = 'all-projects.html', 1000);
    });
  }
}

/* ---- Logout ---- */
function handleLogout() {
  authSignOut().then(() => {
    window.location.href = 'login.html';
  });
}

/* ===================================================
   USERS PAGE
   =================================================== */
let allUsers = [];
let currentFilter = 'all';

async function initUsersPage() {
  allUsers = await getAllUsers();
  renderUsersTable();
}

function filterUsers(filter) {
  currentFilter = filter;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-tab'));
  const btn = document.getElementById('tab-' + filter);
  if (btn) btn.classList.add('active-tab');
  renderUsersTable();
}

function renderUsersTable() {
  let list = allUsers;
  if (currentFilter === 'pending')  list = list.filter(u => u.status === 'pending');
  if (currentFilter === 'approved') list = list.filter(u => u.status === 'approved');
  if (currentFilter === 'admin')    list = list.filter(u => u.role === 'admin');

  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:2rem">No users found</td></tr>`;
    return;
  }

  const session = getAdminSession();
  tbody.innerHTML = list.map(u => {
    const isSelf = session && session.uid === u.uid;
    const roleBadge = u.role === 'admin'
      ? `<span class="badge badge-primary">Admin</span>`
      : `<span class="badge badge-secondary">User</span>`;
    const statusBadge = u.status === 'approved'
      ? `<span class="badge badge-success">Approved</span>`
      : `<span class="badge badge-warning">Pending</span>`;
    const actions = isSelf ? `<span style="color:var(--muted);font-size:.82rem;">(current admin)</span>` : `
      ${u.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="approveUser('${u.uid}')">Approve</button>` : ''}
      ${u.status === 'approved' && u.role === 'user'  ? `<button class="btn btn-primary btn-sm" onclick="setRole('${u.uid}','admin')">Make Admin</button>` : ''}
      ${u.status === 'approved' && u.role === 'admin' ? `<button class="btn btn-outline btn-sm"  onclick="setRole('${u.uid}','user')">Revoke Admin</button>` : ''}
      <button class="btn btn-danger btn-sm" onclick="removeUser('${u.uid}')">Remove</button>`;
    return `<tr>
      <td>
        <div style="font-weight:600">${u.displayName || '—'}</div>
        <div style="font-size:.82rem;color:var(--muted)">${u.email}</div>
      </td>
      <td>${roleBadge}</td>
      <td>${statusBadge}</td>
      <td>${formatDate(u.createdAt)}</td>
      <td class="actions">${actions}</td>
    </tr>`;
  }).join('');
}

async function approveUser(uid) {
  await updateUserProfile(uid, { status: 'approved' });
  allUsers = await getAllUsers();
  renderUsersTable();
  showToast('User approved.', 'success');
}

async function setRole(uid, role) {
  await updateUserProfile(uid, { role, status: 'approved' });
  allUsers = await getAllUsers();
  renderUsersTable();
  showToast(`Role updated to ${role}.`, 'success');
}

async function removeUser(uid) {
  if (!confirm('Remove this user from the system? They will lose access.')) return;
  await db.ref('users/' + uid).remove();
  allUsers = await getAllUsers();
  renderUsersTable();
  showToast('User removed.', 'success');
}

/* ---- Invite Admin Modal ---- */
function showInviteModal() {
  const m = document.getElementById('invite-modal');
  if (m) { m.classList.remove('hidden'); m.classList.add('open'); }
}
function hideInviteModal() {
  const m = document.getElementById('invite-modal');
  if (m) { m.classList.remove('open'); m.classList.add('hidden'); }
  ['invite-name','invite-email','invite-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const errEl = document.getElementById('invite-error');
  if (errEl) errEl.classList.add('hidden');
}

async function inviteAdmin() {
  const name  = document.getElementById('invite-name').value.trim();
  const email = document.getElementById('invite-email').value.trim();
  const pass  = document.getElementById('invite-pass').value;
  const errEl = document.getElementById('invite-error');

  errEl.classList.add('hidden');

  if (!name || !email || !pass) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.classList.remove('hidden');
    return;
  }
  if (pass.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.querySelector('#invite-modal .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating…'; }

  try {
    // Use a secondary Firebase app instance so the current admin stays signed in
    const secondaryApp = firebase.initializeApp(firebaseConfig, 'InviteApp_' + Date.now() + '_' + Math.random().toString(36).slice(2));
    const secondaryAuth = secondaryApp.auth();
    const result = await secondaryAuth.createUserWithEmailAndPassword(email, pass);
    await result.user.updateProfile({ displayName: name });
    // Create DB profile as approved admin
    await createUserProfile(result.user.uid, email, name, null, 'admin', 'approved');
    await secondaryAuth.signOut();
    await secondaryApp.delete();

    showToast(`Admin account created for ${name}.`, 'success');
    hideInviteModal();
    allUsers = await getAllUsers();
    renderUsersTable();
  } catch (err) {
    errEl.textContent = err.message || 'Failed to create account.';
    errEl.classList.remove('hidden');
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Create Admin Account'; }
}

/* ---- Change Password Modal ---- */
function showChangePassModal() {
  const m = document.getElementById('change-pass-modal');
  if (m) { m.classList.remove('hidden'); m.classList.add('open'); }
}
function hideChangePassModal() {
  const m = document.getElementById('change-pass-modal');
  if (m) { m.classList.remove('open'); m.classList.add('hidden'); }
  ['cp-current','cp-new','cp-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['cp-error','cp-success'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}

async function submitChangePassword() {
  const current  = document.getElementById('cp-current')?.value || '';
  const newPass  = document.getElementById('cp-new')?.value || '';
  const confirm  = document.getElementById('cp-confirm')?.value || '';
  const errEl    = document.getElementById('cp-error');
  const succEl   = document.getElementById('cp-success');

  errEl.classList.add('hidden');
  succEl.classList.add('hidden');

  if (!current || !newPass || !confirm) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.classList.remove('hidden');
    return;
  }
  if (newPass.length < 6) {
    errEl.textContent = 'New password must be at least 6 characters.';
    errEl.classList.remove('hidden');
    return;
  }
  if (newPass !== confirm) {
    errEl.textContent = 'New passwords do not match.';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.querySelector('#change-pass-modal .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Updating…'; }

  try {
    await changePassword(current, newPass);
    succEl.textContent = 'Password updated successfully!';
    succEl.classList.remove('hidden');
    setTimeout(hideChangePassModal, 2000);
  } catch (err) {
    errEl.textContent = err.message || 'Failed to update password.';
    errEl.classList.remove('hidden');
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
}
