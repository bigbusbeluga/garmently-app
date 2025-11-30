# 🚀 Complete Vercel Deployment Guide for Garmently

## Prerequisites
1. ✅ Vercel account (sign up at vercel.com)
2. ✅ GitHub account with your code pushed
3. ✅ AWS S3 bucket configured (you already have this!)

## 📋 Deployment Steps

### Step 1: Deploy Backend to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"

2. **Import Backend**
   - Select your `Garmently` repository
   - Choose "Import"
   - Set **Root Directory** to `backend`
   - **Framework Preset**: Other
   - Click "Deploy"

3. **Configure Environment Variables** (Critical!)
   ```
   SECRET_KEY=your-super-secret-key-here
   DJANGO_SETTINGS_MODULE=garmently_backend.settings_vercel
   DEBUG=False
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_STORAGE_BUCKET_NAME=garmently-media
   AWS_S3_REGION_NAME=us-east-1
   ```

4. **Note Your Backend URL**
   - Copy the deployment URL (e.g., `https://garmently-backend.vercel.app`)
     garmently-app-production.up.railway.app
   - You'll need this for the frontend

### Step 2: Deploy Frontend to Vercel

1. **Create New Project**
   - Go to Vercel Dashboard
   - Click "New Project" again
   - Select your `Garmently` repository
   - Choose "Import"

2. **Configure Frontend**
   - Set **Root Directory** to `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app/api
   GENERATE_SOURCEMAP=false
   ```

4. **Deploy Frontend**
   - Click "Deploy"
   - Wait for deployment to complete

### Step 3: Update CORS Settings

After both deployments, update your backend settings:

1. **Update Backend Settings**
   - Go to your backend Vercel project
   - Go to Settings → Environment Variables
   - Add a new variable:
   ```
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```

2. **Redeploy Backend**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

## 🎯 Quick Deploy Commands (Alternative)

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod

# Deploy frontend  
cd ../frontend
vercel --prod
```

## 🔧 Environment Variables You Need

### Backend Environment Variables
- `SECRET_KEY`: Generate a new Django secret key
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_STORAGE_BUCKET_NAME`: garmently-media
- `AWS_S3_REGION_NAME`: us-east-1
- `DJANGO_SETTINGS_MODULE`: garmently_backend.settings_vercel

### Frontend Environment Variables
- `REACT_APP_API_URL`: Your backend Vercel URL + /api

## 🎉 After Deployment

Your app will be live at:
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.vercel.app/api`

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure frontend URL is in CORS_ALLOWED_ORIGINS
   - Redeploy backend after adding frontend URL

2. **Environment Variables**
   - Double-check all environment variables are set
   - Make sure SECRET_KEY is set properly

3. **Build Errors**
   - Check Vercel function logs
   - Ensure all dependencies are in requirements.txt

4. **S3 Upload Issues**
   - Verify AWS credentials are correct
   - Check S3 bucket permissions

## 🚀 Benefits of Vercel Deployment

✅ **Automatic HTTPS**
✅ **Global CDN**
✅ **Serverless Functions**
✅ **Automatic Git Integration**
✅ **Preview Deployments**
✅ **Custom Domains**

## 📱 Next Steps

1. Test your deployed application
2. Add a custom domain (optional)
3. Set up monitoring and analytics
4. Configure automatic deployments from GitHub

Your Garmently app is now live on Vercel! 🎉