# 🚀 Quick Deployment Reference

## One-Time Setup (30 minutes)

### 1️⃣ Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/garmently-app.git
git push -u origin main
```

### 2️⃣ Deploy Backend (Railway)
1. Railway.app → New Project → Deploy from GitHub
2. Select repo → Set Root Directory: `backend`
3. Generate Domain → Copy URL
4. Add Environment Variables:
   - `DJANGO_SECRET_KEY` (generate random)
   - `DJANGO_DEBUG=False`
   - `DJANGO_ALLOWED_HOSTS=.railway.app,.vercel.app`
   - `AWS_ACCESS_KEY_ID` (from your AWS)
   - `AWS_SECRET_ACCESS_KEY` (from your AWS)
   - `AWS_STORAGE_BUCKET_NAME=garmently-media`
   - `AWS_S3_REGION_NAME=ap-southeast-2`
5. Add PostgreSQL database (New → Database → PostgreSQL)

### 3️⃣ Deploy Frontend (Vercel)
1. Vercel.com → New Project → Import repo
2. Root Directory: `frontend`
3. Framework: Create React App
4. Add Environment Variable:
   - `REACT_APP_API_URL=https://your-railway-url.railway.app/api`
5. Deploy

### 4️⃣ Update CORS
Go to Railway → Variables → Update:
```
DJANGO_CORS_ORIGINS=https://your-vercel-url.vercel.app
```

---

## Daily Workflow (2 minutes)

```bash
# 1. Make changes locally
# Edit your code in VS Code

# 2. Test locally
cd backend && python manage.py runserver
cd frontend && npm start

# 3. Deploy
git add .
git commit -m "what you changed"
git push origin main

# ✅ Done! Auto-deploys in 2-3 minutes
```

---

## Your URLs

After deployment, save these:

**Frontend**: `https://__________.vercel.app`
**Backend**: `https://__________.railway.app`
**Admin**: `https://__________.railway.app/admin`

---

## Environment Variables Checklist

### Railway (Backend)
- [ ] DJANGO_SECRET_KEY
- [ ] DJANGO_DEBUG=False
- [ ] DJANGO_ALLOWED_HOSTS
- [ ] DJANGO_CORS_ORIGINS
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_STORAGE_BUCKET_NAME
- [ ] AWS_S3_REGION_NAME
- [ ] DATABASE_URL (auto-created)

### Vercel (Frontend)
- [ ] REACT_APP_API_URL

---

## Quick Fixes

**Backend not connecting?**
→ Check `REACT_APP_API_URL` in Vercel matches Railway URL

**CORS errors?**
→ Check `DJANGO_CORS_ORIGINS` in Railway matches Vercel URL

**Images not loading?**
→ Verify AWS credentials in Railway variables

**Database errors?**
→ Check PostgreSQL service is running in Railway

**Build failed?**
→ Check deployment logs in Railway/Vercel dashboard

---

## Commands

```bash
# View logs
railway logs              # Backend logs
vercel logs [url]        # Frontend logs

# Redeploy manually
railway up               # Backend
vercel --prod            # Frontend

# Generate Django secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Cost: $0/month
- Railway: $5 free credit
- Vercel: Free unlimited
- AWS S3: 5GB free
- PostgreSQL: Included

---

## Support
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- Full guide: See DEPLOY_GUIDE.md
