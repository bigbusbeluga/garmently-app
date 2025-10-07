# Deployment Guide for Garmently App

## ✅ What Works in Production (Already Configured):

1. **S3 File Storage** - Your images will upload to AWS S3
2. **Django REST API** - All your endpoints will work
3. **CORS Configuration** - Frontend-backend communication
4. **Database Models** - All your garment data structure

## 🚀 Deployment Options:

### Option 1: Heroku (Recommended for beginners)
```bash
# 1. Install Heroku CLI
# 2. In your backend folder:
pip install -r requirements-production.txt
heroku create your-app-name
heroku config:set DJANGO_SETTINGS_MODULE=garmently_backend.settings_production
heroku config:set SECRET_KEY=your-secret-key
heroku config:set AWS_ACCESS_KEY_ID=your-aws-key
heroku config:set AWS_SECRET_ACCESS_KEY=your-aws-secret
heroku config:set AWS_STORAGE_BUCKET_NAME=garmently-media
heroku config:set AWS_S3_REGION_NAME=ap-southeast-2
git push heroku main
```

### Option 2: Railway
```bash
# 1. Connect your GitHub repo to Railway
# 2. Set environment variables in Railway dashboard
# 3. Deploy automatically
```

### Option 3: DigitalOcean App Platform
```bash
# 1. Connect GitHub repo
# 2. Configure environment variables
# 3. Deploy
```

### Option 4: Vercel (Backend) + Vercel (Frontend)
```bash
# Backend: Use Vercel with Python runtime
# Frontend: Standard Vercel React deployment
```

## 📋 Pre-Deployment Checklist:

### Backend Changes Needed:
- [ ] Set DEBUG=False in production
- [ ] Add your domain to ALLOWED_HOSTS
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set proper CORS origins (remove CORS_ALLOW_ALL_ORIGINS)
- [ ] Use environment variables for secrets
- [ ] Add proper logging

### Frontend Changes Needed:
- [ ] Update API URLs to point to production backend
- [ ] Build production version (`npm run build`)
- [ ] Configure environment variables

### AWS S3 (Already Done ✅):
- [x] S3 bucket created and configured
- [x] AWS credentials set up
- [x] File upload working

## 🔧 What You Need to Update:

### 1. Frontend API URLs
In your React app, update the API base URL:

```javascript
// In src/services/api.ts or wherever you define API calls
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api'
  : 'http://localhost:8000/api';
```

### 2. Environment Variables for Production
Create `.env.production` with:
- SECRET_KEY (generate a new random one)
- DATABASE_URL (PostgreSQL connection string)
- AWS credentials (same as development)
- ALLOWED_HOSTS (your domain)

### 3. Database Migration
```bash
# After deployment, run:
python manage.py migrate
python manage.py collectstatic
```

## 🌟 Production Benefits:

1. **Scalable File Storage** - S3 handles unlimited file uploads
2. **Fast Image Loading** - CDN delivery from S3
3. **Secure** - Environment variables for secrets
4. **Database** - PostgreSQL for better performance
5. **HTTPS** - Secure connections

## 🎯 Quick Start for Heroku:

1. **Install production requirements**:
   ```bash
   pip install -r requirements-production.txt
   ```

2. **Create Heroku app**:
   ```bash
   heroku create garmently-app
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set SECRET_KEY=your-new-secret-key
   heroku config:set AWS_ACCESS_KEY_ID=AKIAVE42IRGTY62NWQZO
   heroku config:set AWS_SECRET_ACCESS_KEY=your-secret
   heroku config:set AWS_STORAGE_BUCKET_NAME=garmently-media
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

Your S3 configuration will work perfectly in production! 🎉