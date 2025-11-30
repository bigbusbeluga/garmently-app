# Test Your Railway Backend

Open a new terminal and run these commands to verify your backend is working:

## 1. Test if backend is reachable
```bash
curl https://garmently-production.up.railway.app/api/status/
```
**Expected:** JSON response with status info

## 2. Test login endpoint exists
```bash
curl -X OPTIONS https://garmently-production.up.railway.app/api/auth/login/ -v
```
**Expected:** Should show `Allow: POST, OPTIONS` in headers

## 3. Test actual login (will fail with invalid creds, but should NOT be 405)
```bash
curl -X POST https://garmently-production.up.railway.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -v
```
**Expected:** 400 or 401 error (NOT 405)

## 4. Check if URL is correct in Vercel
1. Go to Vercel → Settings → Environment Variables
2. Verify `REACT_APP_API_URL` = `https://garmently-production.up.railway.app`
3. NO `/api` at the end!

## 5. After redeploy, check browser console
Should see:
```
API Configuration: {
  API_BASE_URL: "https://garmently-production.up.railway.app",
  USE_MOCK_DATA: false
}
```

## Common Issues:

### If 405 persists:
- Backend might not have CORS configured for Vercel domain
- Railway service might be sleeping (takes 30s to wake)
- Wrong HTTP method in frontend code

### If network error:
- Railway backend is down
- Check Railway logs for crashes
- Verify DATABASE_URL and AWS credentials are set

### If still getting mock data:
- Vercel didn't rebuild with new env vars
- Browser cache is stale
- Need to hard refresh (Ctrl+Shift+R)
