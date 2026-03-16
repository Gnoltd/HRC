/* =====================================================
   main.js — Guest-side logic (index + detail + submit)
   ===================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  if (page === 'index')   await initIndexPage();
  if (page === 'detail')  await initDetailPage();
  if (page === 'submit')  initSubmitPage();
  updateNavAuthLink();
});

/* Re-render dynamic content when language is toggled */
document.addEventListener('langchange', async () => {
  const page = document.body.dataset.page;
  if (page === 'index') {
    rerenderStatsBanner();
    await loadProjects();
  }
  if (page === 'detail') {
    await initDetailPage();
  }
});

/* ---- Shared: nav auth link ---- */
function updateNavAuthLink() {
  const userEl  = document.getElementById('nav-user-link');
  const adminEl = document.getElementById('nav-admin-link');

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      if (userEl)  { userEl.textContent  = t('nav.login'); userEl.href  = 'login.html'; }
      if (adminEl) { adminEl.textContent = t('nav.guest'); adminEl.href = 'login.html'; }
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        const isAdmin = profile.role === 'admin';
        if (userEl) {
          userEl.textContent = profile.displayName || profile.email;
          userEl.href = 'login.html';
        }
        if (adminEl) {
          adminEl.textContent = isAdmin ? 'Admin' : 'User';
          adminEl.href = isAdmin ? 'admin/dashboard.html' : 'login.html';
        }
      }
    } catch (_) {}
  });
}

/* ===================================================
   INDEX PAGE
   =================================================== */
const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let filteredProjects = [];

async function initIndexPage() {
  renderFilters();
  await loadProjects();

  const searchEl  = document.getElementById('search');
  const catEl     = document.getElementById('cat-filter');
  const deptEl    = document.getElementById('dept-filter');
  const sortEl    = document.getElementById('sort-filter');
  const resetBtn  = document.getElementById('reset-filters');

  [searchEl, catEl, deptEl, sortEl].forEach(el => {
    if (el) el.addEventListener('input', () => { currentPage = 1; loadProjects(); });
  });
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);

  // Stats live counts
  renderStatsBanner();
}

function renderFilters() {
  const catEl  = document.getElementById('cat-filter');
  const deptEl = document.getElementById('dept-filter');
  if (catEl) {
    CATEGORIES.forEach(c => catEl.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
  }
  if (deptEl) {
    DEPARTMENTS.forEach(d => deptEl.insertAdjacentHTML('beforeend', `<option value="${d}">${d}</option>`));
  }
}

async function loadProjects() {
  const grid = document.getElementById('project-grid');
  let projects = [];
  try {
    projects = await getApprovedProjects();
  } catch (err) {
    console.error('loadProjects: failed to fetch projects —', err);
    if (grid) grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon"></div>
        <h3>${t('projects.error.title')}</h3>
        <p>${t('projects.error.sub')}</p>
      </div>`;
    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = t('results.found.zero');
    return;
  }

  const search   = (document.getElementById('search')?.value || '').toLowerCase().trim();
  const cat      = document.getElementById('cat-filter')?.value  || '';
  const dept     = document.getElementById('dept-filter')?.value || '';
  const sort     = document.getElementById('sort-filter')?.value || 'newest';

  filteredProjects = projects.filter(p => {
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const matchSearch = !search ||
      (p.title || '').toLowerCase().includes(search) ||
      (p.description || '').toLowerCase().includes(search) ||
      (p.supervisor || '').toLowerCase().includes(search) ||
      tags.some(tagItem => tagItem.toLowerCase().includes(search));
    const matchCat  = !cat  || p.category   === cat;
    const matchDept = !dept || p.department  === dept;
    return matchSearch && matchCat && matchDept;
  });

  // Sort
  filteredProjects.sort((a, b) => {
    if (sort === 'newest')    return new Date(b.submittedAt) - new Date(a.submittedAt);
    if (sort === 'oldest')    return new Date(a.submittedAt) - new Date(b.submittedAt);
    if (sort === 'downloads') return b.downloads - a.downloads;
    if (sort === 'title')     return a.title.localeCompare(b.title);
    return 0;
  });

  const total = filteredProjects.length;
  const countEl = document.getElementById('result-count');
  if (countEl) {
    countEl.textContent = total > 0
      ? `${total} ${t('results.found')}`
      : t('results.found.zero');
  }

  renderProjectCards();
  renderPagination();
}

function renderProjectCards() {
  const grid = document.getElementById('project-grid');
  if (!grid) return;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const page  = filteredProjects.slice(start, start + ITEMS_PER_PAGE);

  if (!page.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon"></div>
        <h3>${t('projects.none.title')}</h3>
        <p>${t('projects.none.sub')}</p>
      </div>`;
    return;
  }

  grid.innerHTML = page.map(p => {
    const tags = Array.isArray(p.tags) ? p.tags : [];
    const slotsLabel = p.slots !== 1 ? t('card.slots') : t('card.slot');
    const avail = p.availabilityStatus || 'available';
    const availBadge = `<span class="avail-badge ${getAvailabilityClass(avail)}">${t('avail.' + avail)}</span>`;
    return `
    <div class="project-card">
      <div class="card-header">
        <span class="card-category">${p.category}</span>
        ${availBadge}
      </div>
      <div class="card-title"><a href="project-detail.html?id=${p.id}">${p.title}</a></div>
      <div class="card-meta">
        <span> ${p.department}</span>
        <span> ${p.supervisor}</span>
        <span> ${p.duration}</span>
        <span> ${p.slots} ${slotsLabel}</span>
      </div>
      <div class="card-desc">${p.description}</div>
      <div class="card-tags">${tags.map(tagItem => `<span class="tag">${tagItem}</span>`).join('')}</div>
      <div class="card-footer">
        <a href="project-detail.html?id=${p.id}" class="btn btn-outline btn-sm">${t('card.view-details')}</a>
        <button class="btn btn-primary btn-sm" onclick="handleDownload('${p.id}')"> ${t('card.download')}</button>
      </div>
    </div>`;
  }).join('');
}

function renderPagination() {
  const pag = document.getElementById('pagination');
  if (!pag) return;
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  if (totalPages <= 1) { pag.innerHTML = ''; return; }

  let html = '';
  if (currentPage > 1) html += `<button onclick="gotoPage(${currentPage - 1})">${t('pagination.prev')}</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="gotoPage(${i})">${i}</button>`;
  }
  if (currentPage < totalPages) html += `<button onclick="gotoPage(${currentPage + 1})">${t('pagination.next')}</button>`;
  pag.innerHTML = html;
}

function gotoPage(n) {
  currentPage = n;
  renderProjectCards();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFilters() {
  document.getElementById('search').value      = '';
  document.getElementById('cat-filter').value  = '';
  document.getElementById('dept-filter').value = '';
  document.getElementById('sort-filter').value = 'newest';
  currentPage = 1;
  loadProjects();
}

/* Cached stats for re-render on language toggle */
let cachedStats = null;

async function renderStatsBanner() {
  try {
    const all  = await getApprovedProjects();
    const cats = [...new Set(all.map(p => p.category))].length;
    cachedStats = {
      count: all.length,
      cats,
      downloads: all.reduce((a, p) => a + (p.downloads || 0), 0),
    };
    rerenderStatsBanner();
  } catch (err) {
    console.error('renderStatsBanner: failed —', err);
  }
}

function rerenderStatsBanner() {
  const el = document.getElementById('stats-banner');
  if (!el || !cachedStats) return;
  el.innerHTML = `
    <span> <strong>${cachedStats.count}</strong> ${t('stats.active-projects')}</span>
    <span> <strong>${cachedStats.cats}</strong> ${t('stats.categories')}</span>
    <span> <strong>${cachedStats.downloads}</strong> ${t('stats.total-downloads')}</span>`;
}

/* ---- Download handler ---- */
async function handleDownload(id) {
  const p = await getProjectById(id);
  if (!p) return;

  if (p.fileUrl) {
    // Real file download
    const a = document.createElement('a');
    a.href = p.fileUrl; a.download = p.fileName || 'project.pdf';
    a.click();
  } else {
    // Generate a text summary as a downloadable file
    const content = generateProjectSummary(p);
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${p.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  p.downloads++;
  await incrementDownload(p.id);
  showToast('Project downloaded successfully!', 'success');
}

function generateProjectSummary(p) {
  return `RESEARCH PROJECT SUMMARY
=========================

Title:       ${p.title}
Category:    ${p.category}
Department:  ${p.department}
Supervisor:  ${p.supervisor}
Contact:     ${p.email}
Duration:    ${p.duration}
Slots:       ${p.slots}
Tags:        ${(Array.isArray(p.tags) ? p.tags : []).join(', ')}
Date:        ${formatDate(p.submittedAt)}

DESCRIPTION
-----------
${p.description}

REQUIREMENTS
------------
${p.requirements}

EXPECTED OUTCOMES
-----------------
${p.outcomes}
`;
}

/* ===================================================
   DETAIL PAGE
   =================================================== */
async function initDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { window.location.href = 'index.html'; return; }

  const p = await getProjectById(id);
  if (!p || p.status !== 'approved') {
    document.getElementById('project-content').innerHTML = `
      <div class="empty-state">
        <div class="icon"></div>
        <h3>${t('detail.not-found.title')}</h3>
        <p><a href="index.html">${t('detail.not-found.back')}</a></p>
      </div>`;
    return;
  }

  document.title = `${p.title} — Research Projects`;

  document.getElementById('breadcrumb-title').textContent = p.title;
  const slotsLabel = p.slots !== 1 ? t('detail.slots') : t('detail.slot');
  const avail = p.availabilityStatus || 'available';
  const availBadge = `<span class="avail-badge ${getAvailabilityClass(avail)}">${t('avail.' + avail)}${p.finishRequested ? ' (' + t('avail.requested') + ')' : ''}</span>`;

  document.getElementById('project-content').innerHTML = `
    <div class="project-detail-header">
      <div class="flex gap-1 mb-1 flex-wrap">
        <span class="card-category">${p.category}</span>
        <span class="badge badge-secondary">${p.department}</span>
        ${availBadge}
      </div>
      <h1>${p.title}</h1>
      <div class="meta-row">
        <span> <strong>${p.supervisor}</strong></span>
        <span> <a href="mailto:${p.email}">${p.email}</a></span>
        <span> ${p.duration}</span>
        <span> ${p.slots} ${slotsLabel}</span>
        <span> ${t('detail.posted')} ${formatDate(p.submittedAt)}</span>
      </div>
      <div class="card-tags">${(Array.isArray(p.tags) ? p.tags : []).map(tagItem => `<span class="tag">${tagItem}</span>`).join('')}</div>
    </div>

    <div class="section-block">
      <h2>${t('detail.description')}</h2>
      <p>${p.description}</p>
    </div>

    <div class="section-block">
      <h2>${t('detail.requirements')}</h2>
      <p>${p.requirements || t('detail.not-specified')}</p>
    </div>

    <div class="section-block">
      <h2>${t('detail.outcomes')}</h2>
      <p>${p.outcomes || t('detail.not-specified')}</p>
    </div>

    <div id="availability-panel-wrap"></div>

    <div class="flex gap-1 flex-wrap mt-3">
      <button class="btn btn-primary" onclick="handleDownload('${p.id}')">${t('detail.download-btn')}</button>
      <a href="index.html" class="btn btn-outline">${t('detail.back-btn')}</a>
    </div>`;

  // Render availability control panel if the user is the owner or admin
  await renderAvailabilityPanel(p);

  // Related projects sidebar
  const related = (await getApprovedProjects()).filter(r => r.id !== p.id && r.category === p.category).slice(0, 3);
  const relEl = document.getElementById('related-projects');
  if (relEl) {
    if (related.length) {
      relEl.innerHTML = related.map(r => `
        <div style="margin-bottom:.8rem; padding-bottom:.8rem; border-bottom:1px solid var(--border);">
          <a href="project-detail.html?id=${r.id}" style="font-size:.9rem; font-weight:600; display:block; margin-bottom:.2rem;">${r.title}</a>
          <span style="font-size:.8rem; color:var(--muted);">${r.supervisor}</span>
        </div>`).join('');
    } else {
      relEl.innerHTML = `<p style="font-size:.85rem; color:var(--muted);">${t('detail.related.none')}</p>`;
    }
  }
}

async function renderAvailabilityPanel(p) {
  const wrap = document.getElementById('availability-panel-wrap');
  if (!wrap) return;

  const user = auth.currentUser;
  if (!user) return; // Not logged in; no controls shown

  let userProfile = null;
  try { userProfile = await getUserProfile(user.uid); } catch (_) {}

  const isAdmin  = userProfile && userProfile.role === 'admin' && userProfile.status === 'approved';
  const isOwner  = p.submittedBy && p.submittedBy === user.uid;

  if (!isAdmin && !isOwner) return; // Not authorised to change status

  const avail = p.availabilityStatus || 'available';

  let buttonsHtml = '';
  if (isAdmin) {
    // Admin can set any status directly
    buttonsHtml = `
      <button class="btn btn-sm btn-avail-available${avail === 'available' ? ' btn-active' : ''}" onclick="ownerSetAvailability('${p.id}','available')" ${avail === 'available' ? 'disabled' : ''}>${t('avail.set-available')}</button>
      <button class="btn btn-sm btn-avail-full${avail === 'full' ? ' btn-active' : ''}" onclick="ownerSetAvailability('${p.id}','full')" ${avail === 'full' ? 'disabled' : ''}>${t('avail.set-full')}</button>
      <button class="btn btn-sm btn-avail-finished${avail === 'finished' ? ' btn-active' : ''}" onclick="ownerSetAvailability('${p.id}','finished')" ${avail === 'finished' ? 'disabled' : ''}>${t('avail.set-finished')}</button>`;
  } else {
    // Owner can toggle Available/Full and request Finish
    if (avail === 'finished') {
      buttonsHtml = `<span class="avail-finished-msg">${t('avail.finished')} — This project has been marked as finished and cannot be changed.</span>`;
    } else if (p.finishRequested) {
      buttonsHtml = `
        <button class="btn btn-sm btn-avail-available" onclick="ownerSetAvailability('${p.id}','available')">${t('avail.set-available')}</button>
        <button class="btn btn-sm btn-avail-full" onclick="ownerSetAvailability('${p.id}','full')">${t('avail.set-full')}</button>
        <span class="avail-badge avail-requested" style="margin-left:.4rem">${t('avail.requested')}</span>`;
    } else {
      buttonsHtml = `
        <button class="btn btn-sm btn-avail-available" onclick="ownerSetAvailability('${p.id}','available')" ${avail === 'available' ? 'disabled' : ''}>${t('avail.set-available')}</button>
        <button class="btn btn-sm btn-avail-full" onclick="ownerSetAvailability('${p.id}','full')" ${avail === 'full' ? 'disabled' : ''}>${t('avail.set-full')}</button>
        <button class="btn btn-sm btn-avail-request" onclick="ownerRequestFinish('${p.id}')">${t('avail.request-finish')}</button>`;
    }
  }

  wrap.innerHTML = `
    <div class="availability-panel">
      <h4>${t('avail.panel-title')}</h4>
      <p style="font-size:.82rem;color:var(--muted);margin-bottom:.7rem">${isAdmin ? t('avail.panel-hint-admin') : t('avail.panel-hint-owner')}</p>
      <div class="availability-btn-row">${buttonsHtml}</div>
    </div>`;
}

async function ownerSetAvailability(id, newStatus) {
  try {
    await updateProjectAvailability(id, newStatus);
    // Always clear any pending finish request when status is changed directly
    await rejectFinishRequest(id);
    showToast(t('avail.toast-updated'), 'success');
    await initDetailPage();
  } catch (err) {
    showToast(err.message || 'Failed to update status.', 'error');
  }
}

async function ownerRequestFinish(id) {
  if (!confirm(t('avail.confirm-finish'))) return;
  try {
    await requestProjectFinish(id);
    showToast(t('avail.toast-requested'), 'success');
    await initDetailPage();
  } catch (err) {
    showToast(err.message || 'Failed to submit request.', 'error');
  }
}

/* ===================================================
   SUBMIT PAGE
   =================================================== */
function initSubmitPage() {
  const catEl = document.getElementById('proj-category');
  const deptEl = document.getElementById('proj-dept');
  if (catEl) CATEGORIES.forEach(c => catEl.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`));
  if (deptEl) DEPARTMENTS.forEach(d => deptEl.insertAdjacentHTML('beforeend', `<option value="${d}">${d}</option>`));

  setupFileDrop();

  const form = document.getElementById('submit-form');
  if (form) form.addEventListener('submit', handleSubmitProject);
}

let selectedFiles = [];

function setupFileDrop() {
  const dropEl = document.getElementById('file-drop');
  const input  = document.getElementById('file-input');
  const listEl = document.getElementById('file-list');

  if (!dropEl || !input) return;

  dropEl.addEventListener('click', () => input.click());
  dropEl.addEventListener('dragover', e => { e.preventDefault(); dropEl.classList.add('dragover'); });
  dropEl.addEventListener('dragleave', () => dropEl.classList.remove('dragover'));
  dropEl.addEventListener('drop', e => {
    e.preventDefault(); dropEl.classList.remove('dragover');
    addFiles(Array.from(e.dataTransfer.files));
  });
  input.addEventListener('change', () => { addFiles(Array.from(input.files)); input.value = ''; });

  function addFiles(files) {
    files.forEach(f => {
      if (selectedFiles.length >= 3) { showToast('Max 3 files allowed', 'warning'); return; }
      if (f.size > 10 * 1024 * 1024) { showToast(`"${f.name}" exceeds 10 MB limit`, 'warning'); return; }
      selectedFiles.push(f);
    });
    renderFileList();
  }

  function renderFileList() {
    if (!listEl) return;
    listEl.innerHTML = selectedFiles.map((f, i) => `
      <li>
        <span> ${f.name} <span style="color:var(--muted)">(${(f.size/1024).toFixed(1)} KB)</span></span>
        <button onclick="removeFile(${i})" title="Remove">✕</button>
      </li>`).join('');
  }
  window.removeFile = (i) => { selectedFiles.splice(i, 1); renderFileList(); };
}

async function handleSubmitProject(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('[type="submit"]');

  // Validate
  const title   = form.querySelector('#proj-title').value.trim();
  const cat     = form.querySelector('#proj-category').value;
  const dept    = form.querySelector('#proj-dept').value;
  const sup     = form.querySelector('#proj-supervisor').value.trim();
  const email   = form.querySelector('#proj-email').value.trim();
  const dur     = form.querySelector('#proj-duration').value.trim();
  const slots   = parseInt(form.querySelector('#proj-slots').value) || 1;
  const desc    = form.querySelector('#proj-desc').value.trim();
  const req     = form.querySelector('#proj-requirements').value.trim();
  const outcomes= form.querySelector('#proj-outcomes').value.trim();
  const tagsRaw = form.querySelector('#proj-tags').value.trim();
  const agree   = form.querySelector('#agree').checked;

  if (!title || !cat || !dept || !sup || !email || !desc) {
    showToast('Please fill in all required fields.', 'error'); return;
  }
  if (!agree) { showToast('You must agree to the terms.', 'error'); return; }

  // Build file reference (store file name; actual content stored as dataURL for demo)
  let fileUrl  = null;
  let fileName = null;
  if (selectedFiles.length > 0) {
    fileName = selectedFiles[0].name;
    // Read as dataURL for demo download
    const reader = new FileReader();
    reader.onload = async (ev) => {
      fileUrl = ev.target.result;
      await persistProject({ title, cat, dept, sup, email, dur, slots, desc, req, outcomes, tagsRaw, fileUrl, fileName });
      showSuccessScreen();
    };
    reader.readAsDataURL(selectedFiles[0]);
    submitBtn.disabled = true;
  } else {
    await persistProject({ title, cat, dept, sup, email, dur, slots, desc, req, outcomes, tagsRaw, fileUrl, fileName });
    showSuccessScreen();
    submitBtn.disabled = true;
  }
}

async function persistProject({ title, cat, dept, sup, email, dur, slots, desc, req, outcomes, tagsRaw, fileUrl, fileName }) {
  const tags = tagsRaw ? tagsRaw.split(',').map(tagItem => tagItem.trim()).filter(Boolean) : [];
  const currentUser = auth.currentUser;
  const project = {
    id: generateId(),
    title, category: cat, department: dept,
    supervisor: sup, email, duration: dur, slots,
    description: desc, requirements: req, outcomes,
    tags, status: 'pending',
    submittedBy: currentUser ? currentUser.uid : 'guest',
    submittedAt: new Date().toISOString(),
    reviewedAt: null, reviewNote: '',
    downloads: 0, fileUrl, fileName,
    availabilityStatus: 'available',
    finishRequested: false,
    finishRequestedAt: null,
  };
  await saveProject(project);
}

function showSuccessScreen() {
  const wrap = document.getElementById('form-wrap');
  const success = document.getElementById('success-screen');
  if (wrap) wrap.classList.add('hidden');
  if (success) success.classList.remove('hidden');
}

