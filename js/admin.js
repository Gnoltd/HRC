/* =====================================================
   admin.js — Admin-side logic
   ===================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  if (page === 'admin-login')     initLoginPage();
  if (page === 'admin-dashboard') await initDashboardPage();
  if (page === 'admin-pending')   await initPendingPage();
  if (page === 'admin-all')       await initAllProjectsPage();
  if (page === 'admin-review')    await initReviewPage();
});

/* ===================================================
   LOGIN PAGE
   =================================================== */
function initLoginPage() {
  const form    = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');

  if (isAdminLoggedIn()) { window.location.href = 'dashboard.html'; return; }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    if (adminLogin(user, pass)) {
      window.location.href = 'dashboard.html';
    } else {
      errorEl.classList.remove('hidden');
    }
  });
}

/* ===================================================
   DASHBOARD PAGE
   =================================================== */
async function initDashboardPage() {
  if (!requireAdmin()) return;
  renderAdminMeta();
  await renderDashboardStats();
  await renderRecentPending();
  await renderRecentApproved();
}

function renderAdminMeta() {
  const info = JSON.parse(sessionStorage.getItem('rp_admin_auth') || '{}');
  const el = document.getElementById('admin-user');
  if (el) el.textContent = info.user || 'Admin';
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
  if (!requireAdmin()) return;
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
  if (!requireAdmin()) return;

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
  if (!requireAdmin()) return;
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
  adminLogout();
  window.location.href = 'login.html';
}
