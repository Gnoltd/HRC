# Deployment Checklist

Use this checklist before deploying your Education Projects Platform to production.

## Pre-Deployment

### Code & Configuration
- [ ] All code tested locally
- [ ] All tests passing (`python test_app.py`)
- [ ] No debug statements or print() calls in production code
- [ ] Git repository up to date
- [ ] `.gitignore` properly configured
- [ ] No sensitive data in code

### Firebase Setup
- [ ] Firebase project created
- [ ] Firestore database created in correct mode (Firestore Native)
- [ ] Firebase Storage enabled
- [ ] Service account credentials downloaded
- [ ] `firebase_credentials.json` placed in project root (for local testing)
- [ ] Firestore security rules configured
- [ ] Firebase Storage security rules configured
- [ ] Authorized domains added in Firebase Console (for deployed app)

### Environment Variables
- [ ] `FLASK_DEBUG` set to `False`
- [ ] `FLASK_ENV` set to `production`
- [ ] `SECRET_KEY` generated (use: `python -c 'import secrets; print(secrets.token_hex(32))'`)
- [ ] Firebase credentials configured on platform (upload file or base64 encode)
- [ ] All environment variables documented

### Application Settings
- [ ] Production database configured
- [ ] File upload limits appropriate
- [ ] CORS configured if needed
- [ ] Admin panel access secured

## Deployment Platform Setup

### Choose Your Platform (pick one)

#### Google Cloud Platform
- [ ] GCP account created
- [ ] Billing enabled
- [ ] gcloud CLI installed
- [ ] Project ID set correctly
- [ ] `app.yaml` configured
- [ ] Deployed with `gcloud app deploy`

#### Heroku
- [ ] Heroku account created
- [ ] Heroku CLI installed
- [ ] App created
- [ ] `Procfile` present
- [ ] `runtime.txt` present
- [ ] Environment variables set
- [ ] Firebase credentials uploaded
- [ ] Deployed with `git push heroku main`

#### Railway
- [ ] Railway account created
- [ ] GitHub repo connected
- [ ] Environment variables set
- [ ] Firebase credentials uploaded
- [ ] Auto-deployment configured

#### Render
- [ ] Render account created
- [ ] Web service created
- [ ] Build/start commands configured
- [ ] Environment variables set
- [ ] Firebase credentials uploaded

#### Docker
- [ ] Docker installed
- [ ] `Dockerfile` created
- [ ] `.dockerignore` configured
- [ ] Image built successfully
- [ ] Container tested locally
- [ ] Pushed to container registry

#### VPS (DigitalOcean, AWS, etc.)
- [ ] Server provisioned (Ubuntu 20.04+ recommended)
- [ ] SSH access configured
- [ ] Python 3.8+ installed
- [ ] Nginx installed
- [ ] Application deployed
- [ ] Systemd service created
- [ ] Nginx reverse proxy configured
- [ ] Firewall configured (allow 80, 443, 22)

## Post-Deployment

### Domain & SSL
- [ ] Domain purchased (if using custom domain)
- [ ] DNS configured correctly
- [ ] A record pointing to server IP
- [ ] CNAME for www subdomain
- [ ] DNS propagation complete (check with `dig` or `nslookup`)
- [ ] SSL certificate installed
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate auto-renewal configured

### Security
- [ ] `FLASK_DEBUG` is `False`
- [ ] Firestore security rules tested
- [ ] Admin panel protected
- [ ] File upload validation working
- [ ] CORS configured properly
- [ ] Sensitive data encrypted
- [ ] Firebase credentials not in Git
- [ ] Environment variables secured

### Testing
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Project submission works
- [ ] File upload works (if applicable)
- [ ] Admin panel accessible
- [ ] Database connection working
- [ ] Static files loading
- [ ] Mobile responsive
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance testing

### Monitoring & Backups
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Log aggregation configured
- [ ] Database backups automated
- [ ] Backup restoration tested
- [ ] Alerts configured for downtime

### Documentation
- [ ] Deployment documented
- [ ] Admin credentials secured
- [ ] Runbook created for common tasks
- [ ] Emergency contacts documented
- [ ] Backup/restore procedures documented

## Launch

### Final Checks
- [ ] All functionality tested in production
- [ ] Performance acceptable
- [ ] No errors in logs
- [ ] Analytics tracking working (Firebase Analytics)
- [ ] Team notified of launch
- [ ] Support channels ready

### Post-Launch
- [ ] Monitor for first 24 hours
- [ ] Check error logs regularly
- [ ] Verify database writes
- [ ] Test user flows
- [ ] Collect initial feedback
- [ ] Plan for updates

## Maintenance

### Regular Tasks
- [ ] Weekly: Review error logs
- [ ] Weekly: Check uptime reports
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security
- [ ] Quarterly: Backup testing
- [ ] Quarterly: Performance optimization

### Updates
- [ ] Staging environment for testing updates
- [ ] Update procedure documented
- [ ] Rollback plan in place
- [ ] Database migration strategy
- [ ] Zero-downtime deployment if needed

## Rollback Plan

If something goes wrong:

1. **Immediate Actions**
   - [ ] Stop deployment
   - [ ] Check error logs
   - [ ] Identify issue

2. **Rollback Options**
   - [ ] Heroku: `heroku rollback`
   - [ ] Git: `git revert <commit>` and redeploy
   - [ ] Docker: Switch to previous image tag
   - [ ] VPS: Restore from backup

3. **Communication**
   - [ ] Notify users if needed
   - [ ] Update status page
   - [ ] Inform team

## Platform-Specific Notes

### Heroku
- Free tier sleeps after 30 min inactivity
- Upgrade for always-on service
- Configure automatic SSL

### Railway
- $5/month free credit
- Auto-deployment on git push
- Built-in SSL

### Render
- Free tier available
- Auto SSL certificates
- Build times can be slow

### GCP
- Pay-as-you-go pricing
- Automatic scaling
- Integrated with Firebase

### VPS
- Full control
- Manual SSL renewal
- Requires more maintenance

## Resources

- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [FIREBASE_TROUBLESHOOTING.md](FIREBASE_TROUBLESHOOTING.md) - Firebase issues
- Platform documentation for your chosen host

---

**Remember**: Always test thoroughly before deploying to production!
