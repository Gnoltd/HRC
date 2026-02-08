# Quick Start Guide

## Getting Started in 5 Minutes

This guide will help you get the Education Projects Platform up and running quickly.

### Prerequisites
- Python 3.8+
- pip
- A Firebase account (for database)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Configure Firebase (Choose One Option)

#### Option A: Use Firebase (Recommended for Production)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Download service account credentials
5. Save as `firebase_credentials.json` in the project root

#### Option B: Run in Demo Mode (For Testing)
The application will run without Firebase credentials, but project data won't persist between restarts.

### Step 3: Run the Application
```bash
# For development (with debug mode)
FLASK_DEBUG=true python app.py

# For production (without debug mode - recommended)
python app.py
```

### Step 4: Access the Website
Open your browser and go to: **http://localhost:5000**

## Using the Platform

### Browse Projects
1. Click "Projects" in the navigation menu
2. Use the search bar to find specific projects
3. Filter by category using the dropdown
4. Click "View Details" to see full project information

### Submit a Project
1. Click "Submit Project"
2. Fill in the required fields:
   - Project Title
   - Category
   - Description
   - Supervisor Name
   - Application Deadline
   - Contact Information
3. Click "Submit Project"

### Admin Panel
1. Click "Admin" in the navigation menu
2. View platform statistics
3. Manage and delete projects

## Deployment to Production

### Using Gunicorn (Recommended)
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Environment Variables
```bash
export FLASK_DEBUG=false  # Disable debug mode for production
```

## Troubleshooting

### Firebase Connection Issues
- Verify `firebase_credentials.json` is in the correct location
- Check that Firestore is enabled in Firebase Console
- Ensure service account has proper permissions

### Port Already in Use
```bash
# Change the port in app.py or use:
python app.py  # then manually change port in code
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## Next Steps

1. **Customize the Design**: Edit `static/css/style.css`
2. **Add Features**: Modify `app.py` and templates
3. **Set Up Authentication**: Add user login for admin panel
4. **Configure Firestore Rules**: Set up security rules in Firebase Console
5. **Deploy to Cloud**: Use platforms like Heroku, Google Cloud, or AWS

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review [Firebase Documentation](https://firebase.google.com/docs)
- Open an issue on GitHub

## Quick Reference

### File Structure
```
Website_Prj/
├── app.py                    # Main application
├── requirements.txt          # Dependencies
├── static/                   # CSS, JS, images
├── templates/                # HTML pages
└── firebase_credentials.json # Your Firebase key
```

### Important URLs
- Home: http://localhost:5000/
- Projects: http://localhost:5000/projects
- Submit: http://localhost:5000/submit
- Admin: http://localhost:5000/admin
- API: http://localhost:5000/api/projects

Happy coding! 🚀
