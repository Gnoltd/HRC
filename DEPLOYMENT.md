# Deployment Guide - Education Projects Platform

This guide covers multiple options for deploying the Education Projects Platform as a public host.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Option 1: Google Cloud Platform (Recommended)](#option-1-google-cloud-platform-recommended)
- [Option 2: Heroku](#option-2-heroku)
- [Option 3: Railway](#option-3-railway)
- [Option 4: Render](#option-4-render)
- [Option 5: Docker Deployment](#option-5-docker-deployment)
- [Option 6: Traditional VPS](#option-6-traditional-vps)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Domain Setup](#domain-setup)
- [SSL/HTTPS](#sslhttps)

## Prerequisites

Before deploying, ensure you have:

1. **Firebase Project Setup**
   - Firestore database created
   - Firebase Storage enabled
   - Service account credentials downloaded
   - Security rules configured

2. **Application Ready**
   - All code tested locally
   - Firebase credentials configured
   - Requirements.txt up to date

3. **Domain (Optional)**
   - Custom domain purchased (optional but recommended)

## Option 1: Google Cloud Platform (Recommended)

**Why GCP?** Native integration with Firebase, scalable, professional-grade hosting.

### Using Google App Engine

1. **Install Google Cloud SDK**
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

2. **Create app.yaml** (already included in this repo)

3. **Deploy**
```bash
# Set your project
gcloud config set project hsbresearchprj

# Deploy the application
gcloud app deploy

# View your application
gcloud app browse
```

4. **Set Environment Variables**
```bash
# In app.yaml or using gcloud
gcloud app deploy --set-env-vars FLASK_DEBUG=False
```

**Cost:** Free tier available, then pay-as-you-go

### Using Google Cloud Run (Alternative)

1. **Build Container**
```bash
gcloud builds submit --tag gcr.io/hsbresearchprj/education-platform
```

2. **Deploy to Cloud Run**
```bash
gcloud run deploy education-platform \
  --image gcr.io/hsbresearchprj/education-platform \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Cost:** Very cheap, pay only for what you use

---

## Option 2: Heroku

**Why Heroku?** Easy deployment, free tier available, beginner-friendly.

### Steps:

1. **Install Heroku CLI**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login and Create App**
```bash
heroku login
heroku create your-education-platform
```

3. **Set Environment Variables**
```bash
heroku config:set FLASK_DEBUG=False
heroku config:set FLASK_ENV=production
```

4. **Upload Firebase Credentials**
```bash
# Base64 encode your credentials
cat firebase_credentials.json | base64 > firebase_credentials_base64.txt

# Set as environment variable
heroku config:set FIREBASE_CREDENTIALS_BASE64="$(cat firebase_credentials_base64.txt)"
```

5. **Deploy**
```bash
git push heroku main
```

6. **Open Your App**
```bash
heroku open
```

**Files needed:** `Procfile` (included), `runtime.txt` (included)

**Cost:** Free tier available (with limitations), then $7/month

---

## Option 3: Railway

**Why Railway?** Modern, simple, generous free tier, GitHub integration.

### Steps:

1. **Go to [Railway.app](https://railway.app)**

2. **Connect GitHub Repository**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   - In Railway dashboard, go to Variables
   - Add:
     - `PORT` = 5000
     - `FLASK_DEBUG` = False
     - Upload `firebase_credentials.json` as a file or base64 string

4. **Deploy**
   - Railway auto-detects Python and deploys
   - Click on the generated URL

**Cost:** $5/month free credit, then pay-as-you-go

---

## Option 4: Render

**Why Render?** Free tier, automatic SSL, easy setup.

### Steps:

1. **Go to [Render.com](https://render.com)**

2. **Create New Web Service**
   - Connect your GitHub repository
   - Name: `education-platform`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

3. **Environment Variables**
   - Add in Render dashboard:
     - `PYTHON_VERSION` = 3.11
     - `FLASK_DEBUG` = False
   - Upload firebase_credentials.json via dashboard

4. **Deploy**
   - Click "Create Web Service"
   - Render builds and deploys automatically

**Cost:** Free tier available, then $7/month

---

## Option 5: Docker Deployment

**Why Docker?** Platform-independent, easy to move between hosts.

### Steps:

1. **Build Docker Image** (Dockerfile included)
```bash
docker build -t education-platform .
```

2. **Run Locally (Test)**
```bash
docker run -p 5000:5000 \
  -v $(pwd)/firebase_credentials.json:/app/firebase_credentials.json \
  education-platform
```

3. **Deploy to Any Platform**

**Deploy to DigitalOcean:**
```bash
# Install doctl
doctl apps create --spec .do/app.yaml
```

**Deploy to AWS ECS:**
```bash
# Push to ECR
aws ecr create-repository --repository-name education-platform
docker tag education-platform:latest <ECR-URL>:latest
docker push <ECR-URL>:latest
```

**Deploy to Docker Hub + Any VPS:**
```bash
# Push to Docker Hub
docker tag education-platform yourusername/education-platform
docker push yourusername/education-platform

# On your VPS
docker pull yourusername/education-platform
docker run -d -p 80:5000 yourusername/education-platform
```

---

## Option 6: Traditional VPS

**Why VPS?** Full control, cost-effective for large scale.

### DigitalOcean/Linode/AWS EC2:

1. **Create Ubuntu Server** (20.04 LTS or newer)

2. **SSH into Server**
```bash
ssh root@your-server-ip
```

3. **Install Dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Python and dependencies
apt install python3-pip python3-venv nginx -y

# Install certbot for SSL
apt install certbot python3-certbot-nginx -y
```

4. **Clone Repository**
```bash
cd /var/www
git clone https://github.com/Gnoltd/Website_Prj.git education-platform
cd education-platform
```

5. **Setup Python Environment**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

6. **Upload Firebase Credentials**
```bash
# Upload via SCP from your local machine
scp firebase_credentials.json root@your-server-ip:/var/www/education-platform/
```

7. **Create Systemd Service**
```bash
nano /etc/systemd/system/education-platform.service
```

Add:
```ini
[Unit]
Description=Education Projects Platform
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/education-platform
Environment="PATH=/var/www/education-platform/venv/bin"
Environment="FLASK_DEBUG=False"
ExecStart=/var/www/education-platform/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:5000 app:app

[Install]
WantedBy=multi-user.target
```

8. **Setup Nginx Reverse Proxy**
```bash
nano /etc/nginx/sites-available/education-platform
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /var/www/education-platform/static;
    }
}
```

9. **Enable and Start**
```bash
# Enable nginx configuration
ln -s /etc/nginx/sites-available/education-platform /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Start application
systemctl enable education-platform
systemctl start education-platform
```

10. **Setup SSL with Let's Encrypt**
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Cost:** $5-10/month for basic VPS

---

## Post-Deployment Configuration

### 1. Firebase Security Rules

Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      // Allow public read of approved projects
      allow read: if resource.data.approved == true;
      
      // Allow admins to read/write all
      allow read, write: if request.auth != null && 
                            request.auth.token.admin == true;
      
      // Allow users to create projects (pending approval)
      allow create: if request.resource.data.approved == false;
    }
  }
}
```

### 2. Environment Variables

Set these on your hosting platform:

```bash
FLASK_DEBUG=False
FLASK_ENV=production
SECRET_KEY=your-secret-key-here  # Generate with: python -c 'import secrets; print(secrets.token_hex(32))'
```

### 3. Update app.py for Production

The app already has production-ready code:
- Debug mode controlled by environment variable
- Proper error handling
- Gunicorn support

---

## Domain Setup

### 1. Purchase Domain
- Namecheap, Google Domains, GoDaddy, etc.

### 2. Configure DNS

**For Heroku:**
```bash
heroku domains:add yourdomain.com
# Add DNS records provided by Heroku
```

**For Other Platforms:**
- Point A record to server IP
- Point CNAME for www to main domain

Example DNS Records:
```
A    @      YOUR_SERVER_IP
CNAME www    @
```

---

## SSL/HTTPS

### Automatic SSL

Most platforms provide automatic SSL:
- **Heroku**: Automatic with paid dynos
- **Railway**: Automatic
- **Render**: Automatic (free)
- **Google Cloud**: Add via Load Balancer or managed certificates

### Manual SSL (VPS)

Use Let's Encrypt (free):
```bash
certbot --nginx -d yourdomain.com
```

---

## Monitoring & Maintenance

### 1. Application Monitoring

**Use these services:**
- Google Cloud Monitoring (if on GCP)
- Heroku Metrics
- UptimeRobot (free uptime monitoring)
- Sentry (error tracking)

### 2. Logs

**View logs:**
```bash
# Heroku
heroku logs --tail

# GCP App Engine
gcloud app logs tail

# VPS
journalctl -u education-platform -f
```

### 3. Backups

**Firestore Backups:**
```bash
# Automatic backups via Firebase Console
# Or use gcloud
gcloud firestore export gs://your-bucket-name
```

---

## Quick Start Recommendations

### For Beginners:
✅ **Railway** or **Render** - Easiest setup, generous free tier

### For Production:
✅ **Google Cloud Platform** - Best integration with Firebase

### For Budget:
✅ **VPS (DigitalOcean)** - Most cost-effective at scale

### For Flexibility:
✅ **Docker on any platform** - Portable and consistent

---

## Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Railway | $5/month credit | ~$5-20/month | Quick deployment |
| Render | Yes (limited) | $7/month | Easy SSL |
| Heroku | Yes (limited) | $7/month | Beginners |
| GCP App Engine | Yes | Pay-as-you-go | Firebase integration |
| GCP Cloud Run | Yes | Pay-per-use | Cost optimization |
| DigitalOcean VPS | No | $5/month | Full control |

---

## Troubleshooting

### App won't start
- Check logs for errors
- Verify environment variables are set
- Ensure firebase_credentials.json is uploaded

### Database connection fails
- Verify Firestore is enabled
- Check security rules
- Confirm credentials are correct

### Static files not loading
- Check nginx configuration (VPS)
- Verify static file serving is enabled

### SSL issues
- Verify DNS is pointing correctly
- Wait for DNS propagation (up to 48 hours)
- Check certificate renewal

---

## Security Checklist

Before going live:

- [ ] Set `FLASK_DEBUG=False`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure Firestore security rules
- [ ] Enable HTTPS/SSL
- [ ] Restrict admin panel access
- [ ] Set up CORS if needed
- [ ] Regular backups configured
- [ ] Monitoring/alerts set up

---

## Need Help?

1. Check application logs
2. Review Firebase Console for database issues
3. Consult platform-specific documentation
4. Create an issue on GitHub

---

**Recommended Path:** Start with Railway or Render for quick deployment, then migrate to GCP for production scale.
