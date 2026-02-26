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

/* ---- Shared: nav auth link ---- */
function updateNavAuthLink() {
  const el = document.getElementById('nav-admin-link');
  if (!el) return;
  if (isAdminLoggedIn()) {
    el.textContent = '⚙️ Admin Panel';
    el.href = 'admin/dashboard.html';
  }
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
        <div class="icon">⚠️</div>
        <h3>Unable to load projects</h3>
        <p>Could not connect to the database. Please check your Firebase configuration or try again later.</p>
      </div>`;
    const countEl = document.getElementById('result-count');
    if (countEl) countEl.textContent = '0 projects found';
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
      tags.some(t => t.toLowerCase().includes(search));
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
  if (countEl) countEl.textContent = `${total} project${total !== 1 ? 's' : ''} found`;

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
        <div class="icon">🔍</div>
        <h3>No projects found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = page.map(p => {
    const tags = Array.isArray(p.tags) ? p.tags : [];
    return `
    <div class="project-card">
      <div class="card-header">
        <span class="card-category">${p.category}</span>
      </div>
      <div class="card-title"><a href="project-detail.html?id=${p.id}">${p.title}</a></div>
      <div class="card-meta">
        <span>🏫 ${p.department}</span>
        <span>👤 ${p.supervisor}</span>
        <span>⏱ ${p.duration}</span>
        <span>👥 ${p.slots} slot${p.slots !== 1 ? 's' : ''}</span>
      </div>
      <div class="card-desc">${p.description}</div>
      <div class="card-tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="card-footer">
        <a href="project-detail.html?id=${p.id}" class="btn btn-outline btn-sm">View Details</a>
        <button class="btn btn-primary btn-sm" onclick="handleDownload('${p.id}')">⬇ Download</button>
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
  if (currentPage > 1) html += `<button onclick="gotoPage(${currentPage - 1})">← Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="gotoPage(${i})">${i}</button>`;
  }
  if (currentPage < totalPages) html += `<button onclick="gotoPage(${currentPage + 1})">Next →</button>`;
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

async function renderStatsBanner() {
  try {
    const all  = await getApprovedProjects();
    const cats = [...new Set(all.map(p => p.category))].length;
    const el = document.getElementById('stats-banner');
    if (!el) return;
    el.innerHTML = `
      <span>📋 <strong>${all.length}</strong> Active Projects</span>
      <span>🏷 <strong>${cats}</strong> Categories</span>
      <span>📥 <strong>${all.reduce((a, p) => a + (p.downloads || 0), 0)}</strong> Total Downloads</span>`;
  } catch (err) {
    console.error('renderStatsBanner: failed —', err);
  }
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
  await saveProject(p);
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
        <div class="icon">❌</div>
        <h3>Project not found</h3>
        <p><a href="index.html">← Back to projects</a></p>
      </div>`;
    return;
  }

  document.title = `${p.title} — Research Projects`;

  document.getElementById('breadcrumb-title').textContent = p.title;
  document.getElementById('project-content').innerHTML = `
    <div class="project-detail-header">
      <div class="flex gap-1 mb-1 flex-wrap">
        <span class="card-category">${p.category}</span>
        <span class="badge badge-secondary">${p.department}</span>
      </div>
      <h1>${p.title}</h1>
      <div class="meta-row">
        <span>👤 <strong>${p.supervisor}</strong></span>
        <span>✉️ <a href="mailto:${p.email}">${p.email}</a></span>
        <span>⏱ ${p.duration}</span>
        <span>👥 ${p.slots} slot${p.slots !== 1 ? 's' : ''}</span>
        <span>📅 Posted ${formatDate(p.submittedAt)}</span>
      </div>
      <div class="card-tags">${(Array.isArray(p.tags) ? p.tags : []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>

    <div class="section-block">
      <h2>Project Description</h2>
      <p>${p.description}</p>
    </div>

    <div class="section-block">
      <h2>Requirements</h2>
      <p>${p.requirements || 'Not specified.'}</p>
    </div>

    <div class="section-block">
      <h2>Expected Outcomes</h2>
      <p>${p.outcomes || 'Not specified.'}</p>
    </div>

    <div class="flex gap-1 flex-wrap mt-3">
      <button class="btn btn-primary" onclick="handleDownload('${p.id}')">⬇ Download Project Info</button>
      <a href="index.html" class="btn btn-outline">← Back to Projects</a>
    </div>`;

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
      relEl.innerHTML = '<p style="font-size:.85rem; color:var(--muted);">No related projects.</p>';
    }
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
        <span>📄 ${f.name} <span style="color:var(--muted)">(${(f.size/1024).toFixed(1)} KB)</span></span>
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
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  const project = {
    id: generateId(),
    title, category: cat, department: dept,
    supervisor: sup, email, duration: dur, slots,
    description: desc, requirements: req, outcomes,
    tags, status: 'pending',
    submittedBy: 'guest',
    submittedAt: new Date().toISOString(),
    reviewedAt: null, reviewNote: '',
    downloads: 0, fileUrl, fileName,
  };
  await saveProject(project);
}

function showSuccessScreen() {
  const wrap = document.getElementById('form-wrap');
  const success = document.getElementById('success-screen');
  if (wrap) wrap.classList.add('hidden');
  if (success) success.classList.remove('hidden');
}
