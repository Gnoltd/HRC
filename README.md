# Education Projects Platform

A web platform for posting and discovering educational research opportunities and projects.

## 🚀 Quick Start

**Encountering setup issues?** Visit the built-in setup guide at `/setup` for step-by-step instructions!

For the "database does not exist" error:
1. Start the app: `python app.py`
2. Open: `http://localhost:5000/setup`
3. Follow the visual setup checklist
4. Create your Firestore database in minutes

## Features

- **Browse Projects**: View all available education projects with filtering and search capabilities
- **Submit Projects**: Easy-to-use form for submitting new projects
- **Project Details**: Detailed view of each project with all relevant information
- **Admin Panel**: Manage projects with statistics and delete functionality
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Firebase Integration**: Real-time database for secure data storage
- **Analytics**: Google Analytics integration for usage tracking and insights

## Technology Stack

### Frontend
- HTML5
- CSS3 (Responsive Design)
- JavaScript (Vanilla)
- Firebase Web SDK (Analytics)

### Backend
- Python 3.x
- Flask (Web Framework)
- Firebase Admin SDK

### Database
- Firebase Firestore (NoSQL Database)

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gnoltd/Website_Prj.git
   cd Website_Prj
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Firebase**
   
   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project or use an existing one
   
   c. **For Backend (Admin SDK)**:
      - Go to Project Settings > Service Accounts
      - Click "Generate New Private Key"
      - Save the downloaded JSON file as `firebase_credentials.json` in the project root
   
   d. **For Frontend (Web SDK)**:
      - The Firebase Web SDK configuration is already included in `static/js/firebase-config.js`
      - This enables Google Analytics for usage tracking
      - No additional setup needed for basic analytics
   
   e. In Firebase Console, create a Firestore database:
      - Click "Firestore Database" in the left menu
      - Click "Create database"
      - Choose "Start in test mode" (for development)
      - Select your preferred location
   
   f. (Optional) Enable Google Analytics:
      - Go to Project Settings > Integrations
      - Enable Google Analytics
      - Configure analytics settings

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the website**
   
   Open your browser and navigate to: `http://localhost:5000`

## 🌐 Deployment

Ready to make your platform publicly accessible? See the comprehensive **[DEPLOYMENT.md](DEPLOYMENT.md)** guide for detailed instructions on deploying to:

- **Google Cloud Platform** (recommended for Firebase integration)
- **Heroku** (easy deployment with free tier)
- **Railway** (modern, simple deployment)
- **Render** (automatic SSL, free tier)
- **Docker** (containerized deployment)
- **Traditional VPS** (DigitalOcean, AWS, etc.)

Quick deployment options:
```bash
# Heroku
heroku create your-app-name
git push heroku main

# Railway - just connect your GitHub repo at railway.app

# Google Cloud
gcloud app deploy
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step guides!

## Project Structure

```
Website_Prj/
├── app.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── firebase_credentials.json       # Firebase credentials (not in git)
├── firebase_credentials.json.example  # Example credentials file
├── static/
│   ├── css/
│   │   └── style.css              # Main stylesheet
│   ├── js/
│   │   └── main.js                # JavaScript functionality
│   └── images/                     # Image assets
├── templates/
│   ├── index.html                  # Home page
│   ├── projects.html               # Projects listing page
│   ├── project_detail.html         # Single project view
│   ├── submit.html                 # Project submission form
│   └── admin.html                  # Admin panel
└── README.md                       # This file
```

## Usage

### Browsing Projects

1. Navigate to the "Projects" page from the navigation menu
2. Use the search bar to find specific projects
3. Filter by category using the dropdown menu
4. Click "View Details" on any project card to see full information

### Submitting a Project

1. Click "Submit Project" in the navigation menu
2. Fill in all required fields:
   - Project Title
   - Category
   - Description
   - Supervisor Name
   - Application Deadline
   - Contact Information
3. Optional fields: Department, Duration, Requirements
4. Click "Submit Project" button

### Admin Panel

1. Navigate to the "Admin" page
2. View statistics: Total Projects, Active Projects
3. Manage projects: Delete projects as needed

## Firebase Database Structure

The application uses Firestore with the following collection structure:

```
projects/
  └── {project_id}
      ├── title: string
      ├── category: string
      ├── description: string
      ├── supervisor: string
      ├── department: string (optional)
      ├── duration: string (optional)
      ├── deadline: string (date)
      ├── requirements: string (optional)
      ├── contact: string
      └── created_at: timestamp
```

## Deployment

### Deploy to Production

For production deployment, consider:

1. **Environment Variables**: Store sensitive credentials in environment variables
2. **HTTPS**: Use SSL/TLS certificates for secure connections
3. **Firestore Rules**: Update security rules in Firebase Console
4. **Gunicorn**: Use Gunicorn as WSGI server (already in requirements.txt)

Example Gunicorn command:
```bash
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Security Considerations

- Keep `firebase_credentials.json` secure and never commit to Git
- Update Firestore security rules for production (see `FIREBASE_INTEGRATION.md`)
- Implement user authentication for admin panel
- Add CSRF protection for forms
- Enable CORS policies as needed
- Configure authorized domains in Firebase Console
- The Firebase Web SDK API key in client code is public (this is normal and secure)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Additional Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete guide for deploying as a public host
- **[FIREBASE_INTEGRATION.md](FIREBASE_INTEGRATION.md)** - Detailed Firebase setup and integration guide
- **[FIREBASE_TROUBLESHOOTING.md](FIREBASE_TROUBLESHOOTING.md)** - Common Firebase issues and solutions
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide for getting up and running
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture overview

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue in the GitHub repository.

## Acknowledgments

- Inspired by HKUST UROP Projects Platform
- Built with Flask and Firebase
- Designed for educational purposes