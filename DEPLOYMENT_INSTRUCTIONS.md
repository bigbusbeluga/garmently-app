# Garmently Deployment Guide

This guide will help you deploy your Garmently application with:
- **Frontend**: Vercel (React app)
- **Backend**: Railway (Django API)
- **Storage**: AWS S3 (already configured)

---

## Prerequisites

1. **GitHub Account** - Your code needs to be on GitHub
2. **Vercel Account** - Sign up at https://vercel.com (free tier is fine)
3. **Railway Account** - Sign up at https://railway.app (free $5 credit/month)
4. **AWS Account** - You already have this (for S3)

---

## Part 1: Push Code to GitHub

### Step 1: Initialize Git (if not already done)
```bash
cd C:\Users\ojena\Desktop\Garmently
git init
git add .
git commit -m "Initial commit - ready for deployment"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Name it: `garmently-app`
3. Make it **Private** (important for security)
4. Don't initialize with README (we already have code)
5. Click "Create repository"

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/garmently-app.git
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Backend to Railway

### Step 1: Sign Up & Connect GitHub
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select `garmently-app` repository

### Step 2: Configure Backend Service
1. Railway will detect Django automatically
2. Click on the service → "Settings"
3. Set **Root Directory**: `backend`
4. Click "Generate Domain" to get your backend URL
5. Copy this URL (e.g., `https://garmently-backend-production.up.railway.app`)

### Step 3: Add Environment Variables
In Railway dashboard, go to "Variables" tab and add:

```
DJANGO_SECRET_KEY=your-super-secret-key-here-change-this
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=.railway.app,.vercel.app
DJANGO_CORS_ORIGINS=https://your-frontend-url.vercel.app

# AWS S3 (copy from your system environment)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=garmently-media
AWS_S3_REGION_NAME=ap-southeast-2

# Database (Railway provides this automatically)
DATABASE_URL=postgresql://...  # Railway auto-fills this
```

### Step 4: Update Django Settings for Production
Your backend should automatically use these environment variables.

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Sign Up & Import Project
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import `garmently-app` repository

### Step 2: Configure Frontend Build
1. **Framework Preset**: Create React App
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Install Command**: `npm install`

### Step 3: Add Environment Variable
In Vercel dashboard, go to "Settings" → "Environment Variables":

```
REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api
```

Replace with your actual Railway backend URL from Part 2.

### Step 4: Deploy
Click "Deploy" and wait ~2 minutes. You'll get a URL like:
`https://garmently-app.vercel.app`

---

## Part 4: Final Configuration

### Step 1: Update Backend CORS
Go back to Railway → Variables and update:
```
DJANGO_CORS_ORIGINS=https://garmently-app.vercel.app
```
(Use your actual Vercel URL)

Railway will auto-redeploy.

### Step 2: Test Your Deployment
1. Visit your Vercel URL
2. Try to register/login
3. Upload a garment with an image
4. Verify images load from S3

---

## Part 5: Future Updates

### To Deploy Changes:
```bash
# 1. Make your changes locally
# 2. Test on localhost

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to GitHub
git push origin main

# 5. Done! Vercel and Railway auto-deploy
```

Both platforms automatically redeploy when you push to GitHub.

---

## Troubleshooting

### Backend Issues
- **Check Railway Logs**: Dashboard → "Deployments" → Click latest → "View Logs"
- **Database Issues**: Railway provides PostgreSQL free. Migrations run automatically.
- **CORS Errors**: Double-check `DJANGO_CORS_ORIGINS` matches your Vercel URL

### Frontend Issues
- **API Connection Failed**: Verify `REACT_APP_API_URL` in Vercel environment variables
- **White Screen**: Check Vercel deployment logs for build errors
- **Images Not Loading**: Confirm S3 bucket policy is public (we already set this up)

### Common Fixes
```bash
# If Railway build fails
railway logs  # View logs

# If Vercel build fails
vercel logs [deployment-url]  # View logs

# Redeploy manually
railway up  # For backend
vercel --prod  # For frontend
```

---

## Cost Breakdown

### Free Tier Limits:
- **Vercel**: 100 GB bandwidth/month, unlimited projects
- **Railway**: $5 credit/month (~500 hours of backend uptime)
- **AWS S3**: First 5GB storage free, $0.023/GB after

Your app should run completely free on these services for development/portfolio purposes.

---

## Security Checklist

✅ **Environment Variables**: Never commit `.env` files to GitHub
✅ **Django Secret Key**: Generated new one for production
✅ **Debug Mode**: Set to `False` in production
✅ **ALLOWED_HOSTS**: Restricted to your domains
✅ **CORS**: Only allow your frontend domain
✅ **S3 Bucket**: Public read only, not write

---

## Next Steps After Deployment

1. **Custom Domain** (optional):
   - Buy domain from Namecheap/Google Domains
   - Add to Vercel: Settings → Domains
   - Add to Railway: Settings → Domains

2. **Monitor Usage**:
   - Railway dashboard shows usage
   - AWS S3 cost calculator
   - Vercel analytics

3. **Set Up CI/CD** (advanced):
   - Already done! Push to GitHub = auto-deploy

4. **Database Backups**:
   - Railway provides automatic backups
   - Can export anytime

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/5.2/howto/deployment/

---

**Ready to deploy!** Start with Part 1 and work through each section. The whole process takes about 30 minutes.
