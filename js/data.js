/* =====================================================
   data.js — localStorage-based data layer
   ===================================================== */

const DB_KEY   = 'rp_projects';
const AUTH_KEY = 'rp_admin_auth';

/* ---- Sample seed data ---- */
const SEED_PROJECTS = [
  {
    id: 'p001',
    title: 'AI-Driven Climate Change Prediction Using Satellite Imagery',
    category: 'Computer Science',
    department: 'School of Engineering',
    supervisor: 'Prof. Emily Chen',
    email: 'emily.chen@university.edu',
    duration: '6 months',
    slots: 3,
    description: 'This project aims to develop a machine learning model to predict regional climate change patterns by analyzing multi-spectral satellite imagery over the past 30 years. Students will gain hands-on experience with deep learning frameworks, geospatial data processing, and climate science fundamentals.',
    requirements: 'Basic programming in Python, introductory machine learning concepts, enthusiasm for environmental issues.',
    outcomes: 'Students will produce a working prediction model, a technical report, and present findings at the department seminar.',
    tags: ['Machine Learning', 'Climate', 'Python', 'Remote Sensing'],
    status: 'approved',
    submittedBy: 'admin',
    submittedAt: '2026-01-10T09:00:00Z',
    reviewedAt: '2026-01-12T11:00:00Z',
    reviewNote: '',
    downloads: 47,
    fileUrl: null,
    fileName: null,
  },
  {
    id: 'p002',
    title: 'Biodegradable Plastics from Algae: Synthesis and Characterization',
    category: 'Chemistry',
    department: 'School of Science',
    supervisor: 'Dr. Marcus Webb',
    email: 'marcus.webb@university.edu',
    duration: '12 months',
    slots: 2,
    description: 'Explores the synthesis of bioplastics derived from microalgae biomass. The student will conduct extraction experiments, characterize polymer properties (tensile strength, degradation rate), and compare results to commercial alternatives.',
    requirements: 'Organic chemistry, lab safety training, willingness to work with biological samples.',
    outcomes: 'A characterized sample of algae-derived bioplastic, comparative analysis report, conference poster.',
    tags: ['Chemistry', 'Sustainability', 'Bioplastics', 'Lab Research'],
    status: 'approved',
    submittedBy: 'admin',
    submittedAt: '2026-01-15T08:30:00Z',
    reviewedAt: '2026-01-16T10:00:00Z',
    reviewNote: '',
    downloads: 31,
    fileUrl: null,
    fileName: null,
  },
  {
    id: 'p003',
    title: 'Social Media Sentiment Analysis for Mental Health Awareness',
    category: 'Data Science',
    department: 'School of Social Sciences',
    supervisor: 'Assoc. Prof. Olivia Park',
    email: 'olivia.park@university.edu',
    duration: '4 months',
    slots: 4,
    description: 'Leverages NLP techniques to analyze public Twitter and Reddit posts to identify early indicators of mental health distress. The project will build an anonymized dataset, train sentiment classifiers, and propose intervention strategies.',
    requirements: 'NLP basics, Python, statistics, interest in social issues.',
    outcomes: 'Trained classifier, anonymized dataset, policy recommendation brief.',
    tags: ['NLP', 'Mental Health', 'Social Media', 'Data Science'],
    status: 'approved',
    submittedBy: 'admin',
    submittedAt: '2026-01-20T10:00:00Z',
    reviewedAt: '2026-01-21T09:00:00Z',
    reviewNote: '',
    downloads: 22,
    fileUrl: null,
    fileName: null,
  },
  {
    id: 'p004',
    title: 'Quantum Computing Simulation of Molecular Interactions',
    category: 'Physics',
    department: 'School of Science',
    supervisor: 'Prof. James Liu',
    email: 'james.liu@university.edu',
    duration: '8 months',
    slots: 2,
    description: 'Investigates whether near-term quantum computers (NISQ devices) can simulate small molecular systems more accurately than classical DFT methods. Students will use Qiskit and IBM Quantum to run variational algorithms.',
    requirements: 'Linear algebra, quantum mechanics basics, some programming experience.',
    outcomes: 'Simulation benchmarks, comparison report, open-source code repository.',
    tags: ['Quantum', 'Physics', 'Simulation', 'Qiskit'],
    status: 'approved',
    submittedBy: 'admin',
    submittedAt: '2026-01-22T12:00:00Z',
    reviewedAt: '2026-01-23T08:00:00Z',
    reviewNote: '',
    downloads: 18,
    fileUrl: null,
    fileName: null,
  },
  {
    id: 'p005',
    title: 'Urban Heat Island Mitigation through Green Roof Design',
    category: 'Environmental Engineering',
    department: 'School of Engineering',
    supervisor: 'Dr. Sara Nguyen',
    email: 'sara.nguyen@university.edu',
    duration: '6 months',
    slots: 3,
    description: 'Studies the thermal performance of different green roof configurations (extensive, intensive, and semi-intensive) in a tropical urban context. Involves IoT sensor deployment, data collection, and CFD modeling.',
    requirements: 'Interest in environmental engineering, basic data analysis skills.',
    outcomes: 'Field measurement dataset, CFD model, design recommendation report.',
    tags: ['Green Infrastructure', 'Urban', 'IoT', 'CFD'],
    status: 'pending',
    submittedBy: 'guest',
    submittedAt: '2026-02-10T14:00:00Z',
    reviewedAt: null,
    reviewNote: '',
    downloads: 5,
    fileUrl: null,
    fileName: null,
  },
  {
    id: 'p006',
    title: 'Blockchain-Based Academic Credential Verification System',
    category: 'Computer Science',
    department: 'School of Engineering',
    supervisor: 'Dr. Anthony Reyes',
    email: 'anthony.reyes@university.edu',
    duration: '5 months',
    slots: 2,
    description: 'Designs and prototypes a decentralized system for verifying academic credentials using Ethereum smart contracts, eliminating certificate fraud. Students will learn Solidity, Web3.js, and decentralized application architecture.',
    requirements: 'Web development basics, interest in blockchain, JavaScript.',
    outcomes: 'Deployed smart contract on test network, dApp prototype, security audit report.',
    tags: ['Blockchain', 'Security', 'Web3', 'Smart Contracts'],
    status: 'pending',
    submittedBy: 'guest',
    submittedAt: '2026-02-18T09:30:00Z',
    reviewedAt: null,
    reviewNote: '',
    downloads: 3,
    fileUrl: null,
    fileName: null,
  },
];

/* ---- Initialize DB ---- */
function initDB() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_PROJECTS));
  }
}

/* ---- CRUD ---- */
function getAllProjects() {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function getApprovedProjects() {
  return getAllProjects().filter(p => p.status === 'approved');
}

function getPendingProjects() {
  return getAllProjects().filter(p => p.status === 'pending');
}

function getProjectById(id) {
  return getAllProjects().find(p => p.id === id) || null;
}

function saveProject(project) {
  const all = getAllProjects();
  const idx = all.findIndex(p => p.id === project.id);
  if (idx >= 0) all[idx] = project;
  else all.push(project);
  localStorage.setItem(DB_KEY, JSON.stringify(all));
}

function deleteProject(id) {
  const all = getAllProjects().filter(p => p.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(all));
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
