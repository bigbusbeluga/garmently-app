# 🚀 Garmently Deployment Guide

## Quick Start Checklist
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Test deployment working

---

## 📋 Prerequisites

1. **GitHub Account**: https://github.com/signup
2. **Railway Account**: https://railway.app (sign up with GitHub)
3. **Vercel Account**: https://vercel.com (sign up with GitHub)
4. **AWS Credentials**: Already configured for S3

---

## Step 1: Push to GitHub (5 minutes)

### 1.1 Initialize Git Repository
Open PowerShell in your project folder:

```powershell
cd C:\Users\ojena\Desktop\Garmently

# Initialize git if not already done
git init

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `garmently-app`
3. Description: "Digital wardrobe management application"
4. **Make it Private** (important for security)
5. **Don't** initialize with README
6. Click "Create repository"

### 1.3 Push Code
```powershell
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/garmently-app.git

# Rename branch to main
git branch -M main

# Push code
git push -u origin main
```

✅ **Verify**: Check GitHub - you should see all your code

---

## Step 2: Deploy Backend to Railway (10 minutes)

### 2.1 Create Railway Project
1. Go to https://railway.app
2. Click "Login" → Sign in with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select `garmently-app` repository
6. Railway will auto-detect Django

### 2.2 Configure Backend Service
1. Click on the deployed service
2. Go to "Settings" tab
3. **Root Directory**: Enter `backend`
4. Click "Generate Domain" button
5. Copy the generated URL (e.g., `garmently-backend-production.up.railway.app`)
6. Save this URL - you'll need it for the frontend

### 2.3 Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway automatically connects it to your backend
4. The `DATABASE_URL` environment variable is auto-created

### 2.4 Configure Environment Variables
1. Click on your backend service
2. Go to "Variables" tab
3. Click "New Variable" and add each of these:

```bash
# Django Settings
DJANGO_SECRET_KEY=generate-a-super-secret-key-here-use-random-string
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=.railway.app,.vercel.app
DJANGO_CORS_ORIGINS=https://your-app-name.vercel.app

# AWS S3 Credentials (copy from your system)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_STORAGE_BUCKET_NAME=garmently-media
AWS_S3_REGION_NAME=ap-southeast-2

# Database URL is auto-created by Railway - don't add this manually
```

**To generate Django secret key:**
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2.5 Deploy
1. Click "Deploy" or Railway auto-deploys
2. Check "Deployments" tab for progress
3. Wait 2-3 minutes for build to complete
4. Check logs for any errors

✅ **Verify**: Visit `https://your-backend-url.railway.app/admin` - should see Django admin login

---

## Step 3: Deploy Frontend to Vercel (10 minutes)

### 3.1 Import Project
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your `garmently-app` repository
4. Vercel will detect it's a monorepo

### 3.2 Configure Build Settings
**Framework Preset**: Create React App
**Root Directory**: `frontend` (click "Edit" to change)
**Build Command**: `npm run build`
**Output Directory**: `build`
**Install Command**: `npm install`

### 3.3 Add Environment Variable
1. Before deploying, expand "Environment Variables"
2. Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-railway-backend-url.railway.app/api`
   - (Use the Railway URL from Step 2.2)
3. Select "Production", "Preview", and "Development"

### 3.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Vercel will give you a URL like: `https://garmently-app.vercel.app`

✅ **Verify**: Visit your Vercel URL - should see the app loading

---

## Step 4: Final Configuration (5 minutes)

### 4.1 Update Backend CORS
1. Go back to Railway dashboard
2. Click on backend service → "Variables"
3. Update `DJANGO_CORS_ORIGINS` with your actual Vercel URL:
   ```
   DJANGO_CORS_ORIGINS=https://garmently-app.vercel.app
   ```
4. Railway will automatically redeploy

### 4.2 Test Full Stack
1. Visit your Vercel frontend URL
2. Click "Sign Up" → Create account
3. Login
4. Go to "Add Garment"
5. Upload an image
6. Verify:
   - Registration works ✅
   - Login works ✅
   - Image uploads to S3 ✅
   - Image displays ✅
   - Filtering works ✅

---

## Step 5: Making Updates

### Workflow for Future Changes
```powershell
# 1. Make changes locally
# Edit files in VS Code

# 2. Test locally
cd backend
python manage.py runserver  # Test backend

cd ../frontend
npm start  # Test frontend

# 3. Commit changes
git add .
git commit -m "Description of what you changed"

# 4. Push to GitHub
git push origin main

# 5. Automatic deployment
# Vercel and Railway automatically detect the push and redeploy
# Wait 2-3 minutes, then check your live sites
```

**That's it!** No manual redeployment needed. Just push to GitHub and both platforms auto-deploy.

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Railway build fails
```powershell
# Check logs in Railway dashboard
# Common fixes:
1. Verify ROOT_DIRECTORY is set to "backend"
2. Check environment variables are set
3. Look for Python/Django errors in logs
```

**Problem**: Database connection errors
```powershell
# Railway auto-provides DATABASE_URL
# Verify PostgreSQL service is running
# Check service logs
```

**Problem**: Static files not loading
```powershell
# In Railway, run:
python manage.py collectstatic --noinput
# This happens automatically in railway.json
```

### Frontend Issues

**Problem**: "Backend not connected"
```powershell
# Check REACT_APP_API_URL in Vercel:
1. Vercel Dashboard → Settings → Environment Variables
2. Verify URL matches Railway backend URL
3. Must include /api at the end
4. Redeploy: Deployments → ... → Redeploy
```

**Problem**: CORS errors in browser console
```powershell
# Update Railway DJANGO_CORS_ORIGINS:
1. Must match exact Vercel URL
2. Include https://
3. No trailing slash
```

**Problem**: Images not displaying
```powershell
# Check AWS S3:
1. Verify bucket policy is public (we set this up)
2. Check AWS credentials in Railway variables
3. Test direct S3 URL in browser
```

### Common Solutions

```powershell
# View Railway logs
railway logs

# Redeploy Railway manually
railway up

# View Vercel logs (get deployment URL from dashboard)
vercel logs [deployment-url]

# Redeploy Vercel manually
vercel --prod

# Check environment variables
railway variables  # For backend
vercel env ls     # For frontend
```

---

## 💰 Cost Breakdown

### Free Tier Limits
- **Railway**: $5 credit/month (~500 hours of service)
- **Vercel**: 100 GB bandwidth/month, unlimited deployments
- **AWS S3**: 5 GB storage free, then $0.023/GB/month
- **PostgreSQL**: Included with Railway free tier

**Your app will run completely free** for personal use and portfolio purposes. You'll only start paying if you get significant traffic.

---

## 🔒 Security Checklist

✅ Never commit `.env` files to GitHub
✅ Use strong `DJANGO_SECRET_KEY` in production
✅ Set `DJANGO_DEBUG=False` in production
✅ Restrict `ALLOWED_HOSTS` to your domains only
✅ Configure CORS to allow only your frontend domain
✅ S3 bucket: public read, private write
✅ Use HTTPS (Railway and Vercel provide this automatically)

---

## 📊 Monitoring

### Railway Dashboard
- View real-time logs
- Monitor CPU/memory usage
- Check database metrics
- See deployment history

### Vercel Analytics
- Page views
- Performance metrics
- Error tracking
- Build times

### AWS S3
- Storage usage in AWS Console
- Cost estimates
- Bucket metrics

---

## 🎯 Next Steps

### Custom Domain (Optional)
1. Buy domain from Namecheap/Google Domains
2. **For Vercel** (frontend):
   - Settings → Domains → Add domain
   - Follow DNS instructions
3. **For Railway** (backend):
   - Settings → Domains → Add domain
   - Update DNS records

### Enable HTTPS (Already Done)
Both Railway and Vercel provide free SSL certificates automatically.

### Set Up Monitoring (Optional)
- Add Sentry for error tracking
- Enable Vercel Analytics
- Set up Railway notifications

### Database Backups
Railway provides automatic backups. To export manually:
1. Railway Dashboard → PostgreSQL service
2. Data → Export

---

## 📚 Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Django Deployment**: https://docs.djangoproject.com/en/5.2/howto/deployment/
- **React Deployment**: https://create-react-app.dev/docs/deployment/

---

## ✅ Deployment Complete!

Your app is now live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **Admin Panel**: `https://your-backend.railway.app/admin`

**Test everything**, then share your portfolio project with the world! 🎉

---

## 🆘 Need Help?

If you run into issues:
1. Check the troubleshooting section above
2. Review logs in Railway/Vercel dashboards
3. Verify all environment variables are set correctly
4. Ensure GitHub repo is up to date
5. Check that S3 bucket policy allows public read

Common first-deploy issues are usually:
- Missing environment variables
- Incorrect API URL in frontend
- CORS configuration mismatch
- S3 credentials not set
