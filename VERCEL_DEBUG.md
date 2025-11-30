# Vercel Deployment Checklist

## ✅ Steps to Fix Your Current Issues

### 1. **Rebuild Frontend on Vercel**
The environment variable needs to be baked into the build:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Confirm `REACT_APP_API_URL` is set to: `https://garmently-production.up.railway.app/api`
3. Go to Deployments → Latest Deployment → Click ⋯ → **Redeploy**
4. ✅ Check "Use existing Build Cache" is **OFF** (force fresh build)

### 2. **Verify Backend CORS on Railway**
Your backend needs to allow Vercel's domain:

1. Open Railway Dashboard → Backend Service → Variables
2. Confirm these are set:
   ```
   ALLOWED_HOSTS=garmently-production.up.railway.app,.vercel.app
   ```
3. The code already has `CORS_ALLOW_ALL_ORIGINS = True` so it should work

### 3. **Test the Connection**
After redeploying:

1. Visit your Vercel site: `https://garmently-app.vercel.app`
2. Open Browser DevTools → Console tab
3. Look for the log: `API Configuration: { API_BASE_URL: '...', USE_MOCK_DATA: false }`
4. If `USE_MOCK_DATA: true` appears, the env var didn't load—repeat step 1

### 4. **Debug Add Garment Navigation**
The blank page issue is likely:
- API call failing (check Console for errors)
- Missing categories from backend
- Auth token expired

**To fix:**
1. Check Console logs when clicking "Add Garment"
2. Look for errors like "401 Unauthorized" or "Network Error"
3. If 401: backend isn't recognizing the token—might need to login again
4. If no categories load: backend database might be empty

### 5. **Backend Database Setup**
If starting fresh on Railway, create initial categories:

```bash
# SSH into Railway or use their console
python manage.py shell

# Then run:
from api.models import Category
Category.objects.get_or_create(name='Tops', icon='fa-shirt')
Category.objects.get_or_create(name='Bottoms', icon='fa-pants')
Category.objects.get_or_create(name='Outerwear', icon='fa-jacket')
Category.objects.get_or_create(name='Shoes', icon='fa-shoe')
```

## 🔍 Debug Commands

**Check if env var is set (in your local terminal):**
```bash
cd frontend
npm run build
# Should see API_BASE_URL in the build output
```

**Test backend directly:**
```bash
curl https://garmently-production.up.railway.app/api/categories/
# Should return JSON with categories
```

## 🚨 Common Issues

### Mock mode still active
**Symptom:** Fake accounts log in  
**Fix:** Force redeploy on Vercel with cleared cache

### Blank Add Garment page
**Symptom:** Page loads but nothing shows  
**Fix:** 
1. Check Console for API errors
2. Verify categories exist in Railway database
3. Check Network tab for failed requests

### Can't navigate back
**Symptom:** Browser back button doesn't work  
**Fix:** This is likely a React Router issue—try refreshing the page or clicking sidebar links

## ✅ Confirmation Checklist
- [ ] REACT_APP_API_URL set in Vercel
- [ ] Frontend redeployed with fresh build
- [ ] Console shows `USE_MOCK_DATA: false`
- [ ] Backend CORS allows Vercel domain
- [ ] Categories exist in Railway database
- [ ] Can see API requests in Network tab
- [ ] Login creates token and stores it
- [ ] Add Garment shows form fields

## 🎯 Quick Fix Command
```bash
cd frontend
git add .
git commit -m "Force use production API, add debug logging"
git push

# Then trigger Vercel redeploy with cache cleared
```
