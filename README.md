# HRC.HSB.EDU.VN — Research Projects Portal

A web platform for the **HSB Research Club (HRC)** that lets students discover research opportunities, supervisors post projects, and administrators manage submissions and users.

---

## Table of Contents

1. [Overview](#overview)
2. [Pages & Features](#pages--features)
3. [For Students / Visitors](#for-students--visitors)
4. [For Supervisors / Researchers](#for-supervisors--researchers)
5. [For Registered Users](#for-registered-users)
6. [For Administrators](#for-administrators)
7. [Language Support](#language-support)
8. [Tech Stack](#tech-stack)

---

## Overview

The portal connects students with research opportunities at HSB. Anyone can browse published projects as a guest. To interact further (save, comment, etc.) or to submit a project, users must register and be approved by an administrator.

---

## Pages & Features

| Page | URL | Description |
|---|---|---|
| Home / Projects | `index.html` | Browse, search, and filter all published research projects |
| Project Detail | `project-detail.html?id=…` | Full details of a single project |
| Submit a Project | `submit.html` | Form for supervisors to submit new projects for review |
| About Us | `about.html` | Mission, stats, and student research roadmap |
| Sign In / Register | `login.html` | User authentication (email or Google) |
| Admin Panel | `admin/dashboard.html` | Dashboard for administrators only |

---

## For Students / Visitors

### Browsing Projects (no account required)

1. Open the site — you land on **index.html** (Projects).
2. All published projects appear as cards in the grid.
3. Use the **filter bar** to narrow results:
   - **Search** — type keywords, a supervisor name, or tags.
   - **Category** — filter by research category.
   - **Department** — filter by academic department.
   - **Sort By** — choose Newest First, Oldest First, Most Downloaded, or Title A–Z.
4. Click **Reset** to clear all filters.
5. Click any project card to open the **Project Detail** page with full description, requirements, expected outcomes, supervisor contact, and attached files.

---

## For Supervisors / Researchers

### Submitting a Project

1. Go to **Submit Project** (`submit.html`) from the navigation bar.
2. Fill in the required fields (marked with `*`):
   - **Project Title**
   - **Category** and **Department**
   - **Supervisor Name** and **Contact Email**
   - **Project Description**
3. Optionally add:
   - Duration, Available Slots
   - Student Requirements
   - Expected Outcomes
   - Tags (comma-separated, up to 8)
   - Attachments (PDF, DOC, DOCX, PPT, PPTX, TXT — max 10 MB each, up to 3 files)
4. Check the agreement checkbox and click **Submit for Review**.
5. An administrator will review your submission. You will be notified at the contact email once it is published or rejected.

---

## For Registered Users

### Creating an Account

1. Go to **Sign In** (`login.html`) from the navigation bar.
2. Click the **Register** tab.
3. Choose one of two methods:
   - **Google** — click *Continue with Google* and authorise.
   - **Email** — enter your display name, email address, and a password (min 6 characters), then click *Create Account*.
4. After registration your account will be in a **Pending** state. An administrator must approve it before you can access member features.

### Signing In

1. Go to **Sign In** (`login.html`).
2. Use *Continue with Google* or enter your email and password, then click *Sign In*.
3. Once approved, you will see your profile with quick links to Browse Projects or the Admin Panel (if you have the admin role).

### Forgot Password

1. On the Sign In page, click **Forgot password?**.
2. Enter your email and click **Send Reset Email**.
3. Check your inbox for the reset link.

### Changing Your Password

1. Sign in, then go to **Sign In / Profile** (`login.html`).
2. Scroll to the **Change Password** section (visible for email/password accounts only).
3. Enter your current password, new password, and confirm it, then click **Update Password**.

---

## For Administrators

Access the admin panel at `admin/dashboard.html` (requires an account with the `admin` role).

### Admin Panel Pages

| Section | What you can do |
|---|---|
| **Dashboard** | View live stats: total projects, pending reviews, total users |
| **Pending Review** (`pending.html`) | Approve or reject newly submitted projects |
| **All Projects** (`all-projects.html`) | View, edit, or delete any published project |
| **Users** (`users.html`) | Approve pending user accounts, change roles, or remove users |
| **Review** (`review.html`) | Detailed review screen for a single pending project |

### Approving a Project Submission

1. Go to **Pending Review** in the sidebar.
2. Click a project to open the review screen.
3. Click **Approve** to publish it or **Reject** to decline it.

### Managing Users

1. Go to **Users** in the sidebar.
2. Find a pending account and click **Approve**.
3. To change a user's role (e.g. promote to admin), use the role selector next to their name.

---

## Language Support

The site supports **English** and **Vietnamese**. Click the **Tiếng Việt / English** toggle button in the navigation bar to switch languages instantly.

---

## Tech Stack

- **Frontend** — plain HTML, CSS, and vanilla JavaScript (no framework required)
- **Backend / Database** — [Firebase Realtime Database](https://firebase.google.com/docs/database) + [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Hosting** — configured via `firebase.json` (Firebase Hosting)
