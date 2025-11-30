# Railway Backend Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- Railway account (sign up at railway.app)

## Step-by-Step Deployment

### 1. Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select your `garmently-app` repository

### 2. Add PostgreSQL Database

1. In your Railway project dashboard, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create a PostgreSQL instance
4. **Important**: Copy the `DATABASE_URL` connection string (Railway auto-populates this)

### 3. Configure Backend Service

1. Click "+ New" → "GitHub Repo"
2. Select your repository
3. **Important**: Set the root directory to `/backend`
   - Go to Settings → General
   - Set "Root Directory" to `backend`
4. Railway will detect `railway.json` and `nixpacks.toml` automatically

### 4. Set Environment Variables

In your backend service, go to "Variables" tab and add:

```
DJANGO_SETTINGS_MODULE=garmently_backend.settings_production
SECRET_KEY=<generate-a-strong-random-key>
DEBUG=False
```

**To generate a SECRET_KEY**, run this in Python:
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

59d^y6o(zyu^*oymmz_t(ji&13@z$jn$*lj^o23f8zl6tp^lxx
```

### 5. Link Database to Backend

**Option A - Automatic (Recommended):**
1. Railway usually auto-detects and links the PostgreSQL database
2. Check your backend service → "Variables" tab
3. Look for `DATABASE_URL` - if it's there, you're all set!

**Option B - Manual Linking:**
1. Click on your backend service card in the Railway dashboard
2. Go to "Variables" tab
3. Click "+ New Variable" → "Add Reference"
4. Select your PostgreSQL database
5. Choose `DATABASE_URL` from the dropdown
6. Railway will automatically connect them

**To verify the connection:**
- In Variables tab, you should see `DATABASE_URL` with a value starting with `postgresql://`
    
### 6. Deploy

1. Railway will automatically deploy after configuration
2. Monitor the build logs in the "Deployments" tab
3. Watch for any errors in the deployment process

### 7. Get Your Backend URL

1. Go to your backend service → "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://your-app.railway.app`)

### 8. Update Frontend to Use Backend

If you want to connect your Vercel frontend to the Railway backend:

1. In `frontend/src/services/api.js`:
   - Change `USE_MOCK_DATA = true` to `USE_MOCK_DATA = false`
   - Update `API_URL` to your Railway backend URL

2. Redeploy your frontend on Vercel

### 9. Update ALLOWED_HOSTS (if needed)

If you get "DisallowedHost" errors, update `settings_production.py`:
- Add your Railway domain to `ALLOWED_HOSTS`

## Common Issues & Solutions

### Issue: Build fails with "ModuleNotFoundError"
**Solution**: Check that `requirements-production.txt` includes all dependencies

### Issue: "DisallowedHost" error
**Solution**: Add your Railway domain to `ALLOWED_HOSTS` in `settings_production.py`

### Issue: Database connection fails
**Solution**: 
- Verify DATABASE_URL is set
- Ensure PostgreSQL service is linked to backend service
- Check Railway logs for specific error

### Issue: Static files not loading
**Solution**: Railway runs `collectstatic` automatically via `railway.json`

### Issue: Migrations fail
**Solution**: 
- Check Railway logs for migration errors
- May need to run migrations manually via Railway CLI

## Testing Your Deployment

Once deployed, test these endpoints:

1. Health check: `https://your-app.railway.app/`
2. API endpoint: `https://your-app.railway.app/api/garments/`
3. Admin panel: `https://your-app.railway.app/admin/`

## Create Superuser (Optional)

To access Django admin:

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Run command: `railway run python manage.py createsuperuser`

## Estimated Costs

- Railway free tier: $5 credit/month
- PostgreSQL: ~$5/month after free credits
- Backend service: Based on usage

## Need Help?

- Railway Docs: https://docs.railway.app
- Check deployment logs in Railway dashboard
- Monitor resource usage in Railway metrics
