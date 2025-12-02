# Cache Update Guide - Garmently

## Problem: Sometimes Features Don't Show Up on Vercel Deployment

When you visit `garmently-app.vercel.app`, sometimes you see new features and sometimes you don't. This is caused by **caching issues**.

## Why This Happens

1. **Browser Cache** - Your browser stores old versions of files
2. **CDN Cache** - Vercel's CDN caches static assets
3. **Service Worker** - PWA service worker caches the old version

---

## Quick Fixes (For Testing)

### Option 1: Hard Refresh
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### Option 2: DevTools Clear Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Option 3: Clear Service Worker
1. Open DevTools (F12)
2. Go to Application tab
3. Click Service Workers
4. Click "Unregister"
5. Refresh the page

### Option 4: Clear All Site Data
1. Open DevTools (F12)
2. Application tab
3. Storage → Clear storage
4. Click "Clear site data"
5. Refresh

### Option 5: Mobile
- Clear browser cache in settings
- Or use incognito/private mode

---

## Permanent Solution: Update Service Worker Version

**When to do this:** Every time you want to force all users to get the latest version

**File to edit:** `frontend/public/service-worker.js`

**Change this line:**
```javascript
const CACHE_NAME = 'garmently-v2.1'; // Increment this number
```

**Increment the version:**
- `v2.1` → `v2.2`
- `v2.2` → `v2.3`
- etc.

**Then:**
1. Commit and push changes
2. Wait for Vercel to deploy (2-3 minutes)
3. Users will automatically get the new version on next visit

---

## Steps After Pushing New Features

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Wait for Vercel deployment** (check Vercel dashboard)

3. **Test the deployment:**
   - Open incognito window
   - Visit `garmently-app.vercel.app`
   - Features should show up

4. **If features still don't show:**
   - Increment service worker version
   - Push changes again
   - Clear browser cache (Ctrl + Shift + R)

---

## Important Notes

- **Previous deployments don't need to be deleted** - Vercel automatically uses the latest
- **Service worker cache version** is the key to forcing updates
- **Always test in incognito mode** after deployment to see fresh content
- **Mobile users** may need to clear app cache or reinstall PWA

---

## Current Service Worker Version

**Last updated:** December 2, 2025
**Current version:** `garmently-v2.1`

**Remember to increment this version number when you want to force cache refresh!**
