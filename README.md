# HRC Research Projects Portal

A web-based portal for **HSB Research Club (HRC)** at HRC.HSB.EDU.VN that helps students discover research opportunities, connect with supervisors, and submit their own research projects for review.

## Features

### Public Portal
- **Browse & Search** – Keyword search across project titles, supervisor names, and tags
- **Filter & Sort** – Filter by category and department; sort by newest, oldest, most downloaded, or title A–Z
- **Project Details** – Full project page with description, requirements, expected outcomes, and file attachments
- **Submit a Project** – Structured submission form with file upload (PDF, DOC, DOCX, PPT, PPTX, TXT; max 10 MB each, up to 3 files)
- **Bilingual (EN / VI)** – Toggle between English and Vietnamese with a single click
- **Download Tracking** – Attachment download counts are tracked in real time
- **Responsive Design** – Mobile-friendly layout with safe-area inset support

### Admin Panel (`/admin`)
- **Dashboard** – Summary statistics (total projects, pending, approved, users)
- **Pending Review** – Approve or reject submitted projects
- **All Projects** – View, edit, and manage every project in the database
- **User Management** – Promote/demote users and manage account statuses
- **Role-Based Access** – Admin-only routes guarded by Firebase Auth + Realtime Database rules

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no build step) |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting (configured via `firebase.json`) |

## Project Structure

```
HRC/
├── index.html            # Projects listing / home page
├── submit.html           # Project submission form
├── project-detail.html   # Single project view
├── about.html            # About HRC & research roadmap
├── login.html            # User login / registration
├── setup.html            # First-run admin setup
├── admin/
│   ├── login.html        # Admin login
│   ├── dashboard.html    # Admin dashboard
│   ├── pending.html      # Pending review queue
│   ├── all-projects.html # Full project list (admin)
│   ├── review.html       # Project review detail
│   └── users.html        # User management
├── js/
│   ├── firebase-config.js # Firebase project credentials & init
│   ├── data.js            # Data access helpers (CRUD)
│   ├── auth.js            # Auth state & role helpers
│   ├── i18n.js            # Bilingual translation engine
│   ├── main.js            # Home page logic (filtering, pagination)
│   └── admin.js           # Admin panel logic
├── css/
│   └── style.css          # Global stylesheet
├── database.rules.json    # Firebase Realtime Database security rules
└── firebase.json          # Firebase project configuration
```

## Getting Started

### Prerequisites
- A [Firebase](https://firebase.google.com/) project with **Realtime Database** and **Authentication** (Email/Password) enabled

### Local Development

No build step is required. Simply open `index.html` in a browser, or use a local static server:

```bash
# Using Node.js http-server
npx http-server .

# Using Python
python -m http.server 8080
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Realtime Database** and **Email/Password Authentication**.
3. Replace the config values in `js/firebase-config.js` with your own project credentials.
4. Deploy the database security rules:
   ```bash
   firebase deploy --only database
   ```
5. *(First run)* Open `setup.html` to create the initial admin account.

### Deployment

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login and deploy
firebase login
firebase deploy
```

## Database Security Rules

Security rules are defined in `database.rules.json`:

- **`/projects`** – Public read access; unauthenticated users can only create `pending` entries; admins have full write access.
- **`/users`** – Admins can read all user records; each user can read/write their own record only.

## License

This project is maintained by the HSB Research Club (HRC). All rights reserved.
