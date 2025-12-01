# Complete Guide: Creating Google OAuth 2.0 Credentials (Free!)

## 🆓 Do I Need to Pay?

**NO!** Google OAuth 2.0 is completely **FREE** for most applications. You don't need:
- ❌ No credit card required
- ❌ No subscription needed
- ❌ No billing setup

The free tier includes thousands of OAuth requests per day - more than enough for most apps!

---

## Step-by-Step Guide with Visual Descriptions

### Step 1: Create Google Cloud Account (Free)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Click **"Select a project"** at the top

2. **Sign in with your Google Account**
   - Use any Gmail account (personal or work)
   - Accept the terms of service

3. **You're in!** No billing required for OAuth 2.0

---

### Step 2: Create a New Project

1. **Click "Select a project" dropdown** (top left, near Google Cloud logo)
   
2. **Click "NEW PROJECT"** button (top right of popup)
   
3. **Fill in project details:**
   ```
   Project name: Garmently
   Organization: No organization (unless you have one)
   Location: No organization
   ```

4. **Click "CREATE"**
   
5. **Wait 10-30 seconds** for project creation
   
6. **Select your new project** from the dropdown

**What you'll see:**
- Dashboard with "Getting Started" cards
- Left sidebar with navigation menu
- Your project name in the top bar

---

### Step 3: Enable Google+ API (Required for OAuth)

1. **Open the navigation menu** (☰ hamburger icon, top left)

2. **Go to "APIs & Services" > "Library"**
   - Or search "API Library" in the search bar

3. **In the API Library search box, type:** `Google+ API`

4. **Click on "Google+ API"** (might show as "Google People API")

5. **Click the blue "ENABLE" button**

6. **Wait for it to enable** (takes a few seconds)

**Visual cues:**
- You'll see "API enabled" with a checkmark
- The "ENABLE" button changes to "MANAGE"

---

### Step 4: Configure OAuth Consent Screen

This is what users see when they click "Sign in with Google"

1. **Go to "APIs & Services" > "OAuth consent screen"**
   - Use the left sidebar navigation
   - Or search for it in the top search bar

2. **Choose User Type:**
   - Select **"External"** (allows anyone with a Google account)
   - Click **"CREATE"**

3. **Fill out "OAuth consent screen" (Page 1):**

   ```
   App name: Garmently
   
   User support email: [Your email address]
   (Select from dropdown)
   
   App logo: [Optional - skip for now]
   
   Application home page: https://your-frontend.vercel.app
   (Or http://localhost:3000 for testing)
   
   Application privacy policy link: [Optional - skip]
   
   Application terms of service link: [Optional - skip]
   
   Authorized domains:
   - vercel.app (if using Vercel)
   - railway.app (if using Railway)
   
   Developer contact information:
   Email addresses: [Your email]
   ```

4. **Click "SAVE AND CONTINUE"**

5. **Scopes Page (Page 2):**
   - Click **"ADD OR REMOVE SCOPES"**
   
   - **Select these scopes** (check the boxes):
     ✅ `.../auth/userinfo.email` - View your email address
     ✅ `.../auth/userinfo.profile` - See your personal info
     ✅ `openid` - Associate you with your personal info
   
   - Click **"UPDATE"**
   
   - Click **"SAVE AND CONTINUE"**

6. **Test users Page (Page 3):**
   - **For testing only:** Add your email and other testers
   - Click **"+ ADD USERS"**
   - Enter email addresses (one per line)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**
   
   **Note:** Test users can use your app while it's in testing mode. You can add up to 100 test users.

7. **Summary Page (Page 4):**
   - Review everything
   - Click **"BACK TO DASHBOARD"**

**Important:** Your app is now in **"Testing"** mode. This is perfect for development and limited production use!

---

### Step 5: Create OAuth 2.0 Client ID

This gives you the credentials your app needs.

1. **Go to "APIs & Services" > "Credentials"**

2. **Click "+ CREATE CREDENTIALS"** (top of page)

3. **Select "OAuth client ID"**

4. **Choose Application type:**
   - Select **"Web application"** from dropdown

5. **Configure the OAuth client:**

   ```
   Name: Garmently Web Client
   ```

6. **Authorized JavaScript origins:**
   - Click **"+ ADD URI"**
   - Add for local development:
     ```
     http://localhost:3000
     ```
   - Click **"+ ADD URI"** again
   - Add for production:
     ```
     https://your-frontend-app.vercel.app
     ```
   
   **Replace `your-frontend-app.vercel.app` with your actual Vercel URL!**

7. **Authorized redirect URIs:**
   - Click **"+ ADD URI"**
   - Add for local:
     ```
     http://localhost:3000
     ```
   - Click **"+ ADD URI"** again
   - Add for production:
     ```
     https://your-frontend-app.vercel.app
     ```

8. **Click "CREATE"**

9. **🎉 Success! A popup appears with your credentials:**

   ```
   Your Client ID: 
   1234567890-abcdefghijklmnop.apps.googleusercontent.com
   
   Your Client Secret:
   GOCSPX-abc123def456ghi789
   ```

10. **IMPORTANT: Copy both values NOW!**
    - Click the **copy icon** next to each
    - Save them somewhere safe (we'll use them next)
    - You can also download as JSON

---

### Step 6: Save Your Credentials

You now have:
```
Client ID: 1234567890-abcdefghijklmnop.apps.googleusercontent.com
Client Secret: GOCSPX-abc123def456ghi789
```

**Keep these safe!** We'll add them to your app next.

---

### Step 7: Add Credentials to Your App

#### For Railway (Backend)

1. **Go to Railway Dashboard:** https://railway.app/dashboard

2. **Select your Garmently backend project**

3. **Click "Variables" tab**

4. **Click "New Variable"**

5. **Add first variable:**
   ```
   Variable: GOOGLE_OAUTH_CLIENT_ID
   Value: [Paste your Client ID]
   ```
   Click "Add"

6. **Add second variable:**
   ```
   Variable: GOOGLE_OAUTH_CLIENT_SECRET
   Value: [Paste your Client Secret]
   ```
   Click "Add"

7. **Railway will automatically redeploy** (takes 2-3 minutes)

#### For Vercel (Frontend)

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard

2. **Select your Garmently frontend project**

3. **Go to Settings > Environment Variables**

4. **Add variable:**
   ```
   Name: REACT_APP_GOOGLE_CLIENT_ID
   Value: [Paste your Client ID - same as backend]
   ```
   
5. **Select all environments** (Production, Preview, Development)

6. **Click "Save"**

7. **Redeploy your app:**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

#### For Local Development

**Backend `.env` file:**

Create/edit `backend/.env`:
```env
GOOGLE_OAUTH_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

**Frontend `.env` file:**

Create/edit `frontend/.env`:
```env
REACT_APP_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
```

**Restart both servers** after adding environment variables!

---

### Step 8: Test Your Google Sign-In

#### Local Testing

1. **Start backend:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start frontend** (in new terminal):
   ```bash
   cd frontend
   npm start
   ```

3. **Open browser:** http://localhost:3000/login

4. **Click "Sign in with Google"**

5. **What happens:**
   - Google popup opens
   - Shows "Garmently wants to access your Google Account"
   - Lists permissions: email, profile
   - Click your Google account
   - Click "Continue" or "Allow"

6. **Success!**
   - Popup closes
   - You're logged into Garmently
   - Redirected to dashboard

#### Production Testing

1. **Go to your live site:** https://your-app.vercel.app/login

2. **Click "Sign in with Google"**

3. **Should work the same as local!**

---

## 🎯 What Each Setting Does

### Authorized JavaScript Origins
- **What it is:** URLs where your frontend is hosted
- **Why needed:** Security - Google only allows sign-in from these URLs
- **Examples:** 
  - `http://localhost:3000` (local dev)
  - `https://garmently.vercel.app` (production)

### Authorized Redirect URIs
- **What it is:** Where Google sends users after authentication
- **Why needed:** Prevents unauthorized redirects
- **Best practice:** Usually the same as JavaScript origins

### Client ID
- **What it is:** Public identifier for your app
- **Safe to expose:** Yes, can be in frontend code
- **Used by:** Frontend to initiate Google sign-in

### Client Secret
- **What it is:** Private key for your app
- **Safe to expose:** NO! Backend only
- **Used by:** Backend to verify Google tokens

---

## 🔒 Security Best Practices

✅ **DO:**
- Keep Client Secret in backend environment variables only
- Use HTTPS in production (Vercel does this automatically)
- Add only your actual domains to authorized origins
- Restart servers after adding environment variables

❌ **DON'T:**
- Commit `.env` files to Git
- Put Client Secret in frontend code
- Share your Client Secret publicly
- Add `*` wildcards to authorized origins

---

## 🐛 Common Issues & Solutions

### Issue 1: "Error 400: redirect_uri_mismatch"

**Cause:** Your frontend URL isn't in authorized origins

**Fix:**
1. Go to Google Cloud Console > Credentials
2. Click your OAuth 2.0 Client ID
3. Add your exact URL to "Authorized JavaScript origins"
4. Add same URL to "Authorized redirect URIs"
5. Save (takes 1-2 minutes to update)

**Example:**
If your Vercel URL is `https://garmently-abc123.vercel.app`, add:
- Authorized JavaScript origins: `https://garmently-abc123.vercel.app`
- Authorized redirect URIs: `https://garmently-abc123.vercel.app`

### Issue 2: Google button not showing

**Cause:** `REACT_APP_GOOGLE_CLIENT_ID` not set

**Fix:**
1. Check frontend `.env` has the variable
2. Restart frontend server: `npm start`
3. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue 3: "Invalid client" error

**Cause:** Client ID/Secret mismatch

**Fix:**
1. Verify Client ID is identical in frontend and backend
2. Check for extra spaces or missing characters
3. Re-copy from Google Cloud Console if needed

### Issue 4: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured

**Fix:**
1. Go to "OAuth consent screen" in Google Console
2. Complete all required fields
3. Add required scopes (email, profile)
4. Save changes

### Issue 5: Works locally but not in production

**Cause:** Production URLs not added to authorized origins

**Fix:**
1. Add your production Vercel URL to authorized origins
2. Make sure it's **exact** - include `https://` and no trailing slash
3. Wait 1-2 minutes for changes to propagate

---

## 💰 Pricing & Limits (Free Tier)

**OAuth 2.0 Usage: FREE**
- No cost for authentication
- No request limits for typical use
- No billing required

**What's included in free tier:**
- Unlimited OAuth requests
- Up to 100 test users (in testing mode)
- All OAuth scopes available

**When you might pay:**
- If you use other Google Cloud services (not OAuth)
- If you exceed API quotas on other services
- OAuth itself remains free

**Bottom line:** You won't pay anything for Google Sign-In! 🎉

---

## 📝 Quick Reference

### Useful URLs

| What | URL |
|------|-----|
| Google Cloud Console | https://console.cloud.google.com/ |
| API Library | https://console.cloud.google.com/apis/library |
| OAuth Consent Screen | https://console.cloud.google.com/apis/credentials/consent |
| Credentials | https://console.cloud.google.com/apis/credentials |
| Railway Dashboard | https://railway.app/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |

### Your Credentials

```
Project Name: Garmently
Client ID: [Your ID].apps.googleusercontent.com
Client Secret: GOCSPX-[Your Secret]
```

Save this information in a password manager!

### Environment Variables Needed

**Railway (Backend):**
```
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
```

**Vercel (Frontend):**
```
REACT_APP_GOOGLE_CLIENT_ID=your-client-id
```

**Local Backend (.env):**
```
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
```

**Local Frontend (.env):**
```
REACT_APP_GOOGLE_CLIENT_ID=your-client-id
```

---

## ✅ Checklist

Print this and check off as you go:

- [ ] Created Google Cloud account (free)
- [ ] Created new project "Garmently"
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Added email and profile scopes
- [ ] Added test users (optional)
- [ ] Created OAuth 2.0 Client ID
- [ ] Added authorized JavaScript origins
- [ ] Added authorized redirect URIs
- [ ] Copied Client ID
- [ ] Copied Client Secret
- [ ] Added variables to Railway
- [ ] Added variable to Vercel
- [ ] Created backend `.env` file
- [ ] Created frontend `.env` file
- [ ] Tested locally
- [ ] Tested in production

---

## 🎓 Understanding OAuth 2.0 Flow

**What happens when user clicks "Sign in with Google":**

1. **Frontend:** Opens Google OAuth popup
2. **User:** Selects Google account, grants permissions
3. **Google:** Returns credential token to frontend
4. **Frontend:** Sends token to your backend `/api/auth/google/`
5. **Backend:** Verifies token with Google API
6. **Backend:** Extracts user info (email, name, picture)
7. **Backend:** Creates/finds user account
8. **Backend:** Returns your app's auth token
9. **Frontend:** Stores token, logs user in
10. **User:** Redirected to dashboard

**Security:** Google never shares the user's password with your app!

---

## 🚀 You're Done!

Your Google OAuth 2.0 is now set up! Users can:
- ✅ Sign in with one click
- ✅ No password to remember
- ✅ Automatic account creation
- ✅ Secure authentication

**Next time you need this:** Just refer back to this guide!

---

## 📞 Need Help?

**Common places to check:**
1. Google Cloud Console > Credentials (verify settings)
2. Railway logs (backend errors)
3. Browser console (frontend errors)
4. Vercel deployment logs

**Error messages to Google:**
- Copy the exact error
- Search: "Google OAuth [error message]"
- Usually finds solution quickly

**Still stuck?** Check `GOOGLE_OAUTH_SETUP.md` for more troubleshooting tips!
