# Firebase Setup Troubleshooting Guide

This guide helps you resolve common Firebase setup issues when submitting projects.

## Common Error Messages and Solutions

### "Database not configured"

**Cause**: Firebase credentials file is missing.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hsbresearchprj`
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the file as `firebase_credentials.json` in the project root directory
6. Restart the Flask application

### "Permission denied. Please check Firestore security rules."

**Cause**: Firestore security rules are blocking write operations.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hsbresearchprj`
3. Go to Firestore Database → Rules
4. Update the rules to allow writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{project} {
      // Allow anyone to read projects
      allow read: if true;
      
      // Allow authenticated writes or all writes for testing
      // For testing (NOT for production):
      allow write: if true;
      
      // For production with authentication:
      // allow write: if request.auth != null;
    }
  }
}
```

5. Click "Publish"

### "Database not found. Please ensure Firestore is enabled."

**Cause**: Firestore database hasn't been created in Firebase Console.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `hsbresearchprj`
3. Click "Firestore Database" in the left menu
4. Click "Create database"
5. Choose "Start in test mode" (for development)
6. Select your preferred location (e.g., us-central1)
7. Click "Enable"

### "Error submitting project: [other error]"

**Cause**: Various other issues with Firebase configuration.

**Common Solutions**:

1. **Check Internet Connection**: Ensure the server has internet access to reach Firebase servers.

2. **Verify Service Account Permissions**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Ensure the service account has "Firebase Admin SDK Administrator Service Agent" role

3. **Check Firestore Database Location**:
   - Ensure the database location matches what's expected
   - Go to Firestore Database → Data to verify it exists

4. **Verify JSON Credentials File**:
   - Ensure `firebase_credentials.json` is valid JSON
   - Check that all fields are present (project_id, private_key, client_email, etc.)

5. **Check Application Logs**:
   ```bash
   # View Flask application logs
   python app.py
   ```
   Look for specific error messages that provide more details

## Quick Test

To verify Firebase is working, you can run this test script:

```python
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('firebase_credentials.json')
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

# Try to read from Firestore
try:
    projects = db.collection('projects').limit(1).stream()
    print("✓ Firebase connection successful!")
    for project in projects:
        print(f"  Sample project: {project.id}")
except Exception as e:
    print(f"✗ Firebase connection failed: {e}")
```

Save as `test_firebase.py` and run:
```bash
python test_firebase.py
```

## Step-by-Step Complete Setup

### 1. Firebase Project Setup

1. Create/Access Firebase Project:
   - Go to https://console.firebase.google.com/
   - Your project: `hsbresearchprj`

### 2. Enable Firestore

1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode"
4. Choose location: `us-central` (or nearest to you)
5. Click "Enable"

### 3. Get Service Account Credentials

1. Go to Project Settings (gear icon) → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Rename to `firebase_credentials.json`
5. Place in project root directory (same folder as `app.py`)

### 4. Configure Security Rules

1. Go to Firestore Database → Rules
2. Use the following rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{project} {
      allow read: if true;
      allow write: if true; // Change for production!
    }
  }
}
```

3. Click "Publish"

### 5. Test the Setup

1. Start the Flask application:
   ```bash
   python app.py
   ```

2. Open browser: http://localhost:5000

3. Navigate to "Submit Project"

4. Fill in the form and submit

5. Check Firestore Console → Data to see if project was added

## Production Considerations

For production deployment:

1. **Secure Security Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /projects/{project} {
         allow read: if true;
         allow write: if request.auth != null; // Require authentication
       }
     }
   }
   ```

2. **Implement Authentication**:
   - Add Firebase Authentication
   - Require login for project submission
   - Verify user tokens in Flask backend

3. **Environment Variables**:
   - Don't commit `firebase_credentials.json` to Git
   - Use environment variables or secret management
   - Example:
     ```python
     import os
     import json
     
     # Load from environment variable
     cred_json = os.environ.get('FIREBASE_CREDENTIALS')
     if cred_json:
         cred = credentials.Certificate(json.loads(cred_json))
     ```

4. **Rate Limiting**:
   - Add rate limiting to prevent abuse
   - Use Flask-Limiter or similar

5. **Data Validation**:
   - Validate all input server-side
   - Sanitize data before storing
   - Use schema validation

## Still Having Issues?

If you continue to experience problems:

1. **Check Browser Console**: 
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check Server Logs**:
   - Look at Flask console output
   - Check for Python exceptions

3. **Verify File Paths**:
   - Ensure `firebase_credentials.json` is in the correct location
   - Use absolute paths if relative paths don't work

4. **Test with Example Data**:
   - Try the test script above
   - Use Firestore Console to manually add a document

5. **Review Documentation**:
   - See `README.md` for setup instructions
   - See `FIREBASE_INTEGRATION.md` for integration details
   - Check Firebase documentation: https://firebase.google.com/docs

## Contact

If none of these solutions work, please:
1. Note the exact error message
2. Check application logs
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Python version, etc.)
