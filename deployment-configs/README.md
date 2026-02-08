# Deployment Configuration Files

This directory contains configuration files for various deployment scenarios.

## Files

### `nginx.conf`
Nginx reverse proxy configuration for VPS deployment.

**Usage:**
```bash
# Copy to sites-available
sudo cp nginx.conf /etc/nginx/sites-available/education-platform

# Create symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/education-platform /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

**Important:** Replace `yourdomain.com` with your actual domain.

### `education-platform.service`
Systemd service file for running the application as a service on Linux.

**Usage:**
```bash
# Copy to systemd directory
sudo cp education-platform.service /etc/systemd/system/

# Create log directory
sudo mkdir -p /var/log/education-platform
sudo chown www-data:www-data /var/log/education-platform

# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable education-platform

# Start service
sudo systemctl start education-platform

# Check status
sudo systemctl status education-platform
```

## Other Deployment Files

The following files are in the root directory:

- **Procfile** - For Heroku deployment
- **runtime.txt** - Specifies Python version for Heroku/Render
- **app.yaml** - For Google App Engine deployment
- **Dockerfile** - For containerized deployment
- **.dockerignore** - Files to exclude from Docker image
- **.env.example** - Environment variables template

## See Also

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Complete deployment guide
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
