# HRC — Research Projects Portal

## Firebase Setup

This app uses Firebase Realtime Database for data storage.

### Deploying database rules (required for public access)

The project ships with `database.rules.json` and `firebase.json`. To allow the
public site to read project data and guests to submit projects, you must deploy
these rules to your Firebase project:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only database
```

> **Note:** The bundled rules (`".read": true, ".write": true`) are intentionally
> open so that unauthenticated users can browse and submit projects.  
> This is safe for a demo but **for production** you should implement
> [Firebase Authentication](https://firebase.google.com/docs/auth) and restrict
> writes to authenticated admins.

### Admin credentials (demo)

- **Username:** `admin`  
- **Password:** `admin123`

Navigate to `admin/login.html` to log in, then approve pending submissions so
they appear on the public site.