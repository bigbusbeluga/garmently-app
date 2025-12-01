# Google OAuth 2.0 - Quick Setup Checklist

Print this page and check off each step as you complete it!

---

## ✅ Setup Checklist

### Part 1: Google Cloud Console (5-10 minutes)

- [ ] **1.1** Go to https://console.cloud.google.com/
- [ ] **1.2** Sign in with your Google account (free, no billing needed)
- [ ] **1.3** Click "Select a project" → "NEW PROJECT"
- [ ] **1.4** Name: "Garmently" → Click "CREATE"
- [ ] **1.5** Wait for project creation (~30 seconds)
- [ ] **1.6** Select "Garmently" project from dropdown

### Part 2: Enable API (1 minute)

- [ ] **2.1** Go to "APIs & Services" → "Library"
- [ ] **2.2** Search for "Google+ API"
- [ ] **2.3** Click "Google+ API"
- [ ] **2.4** Click "ENABLE"
- [ ] **2.5** Wait for "API enabled" confirmation

### Part 3: OAuth Consent Screen (3-5 minutes)

- [ ] **3.1** Go to "APIs & Services" → "OAuth consent screen"
- [ ] **3.2** Select "External" user type
- [ ] **3.3** Click "CREATE"
- [ ] **3.4** Fill in:
  - App name: `Garmently`
  - User support email: `[Your email]`
  - Developer contact: `[Your email]`
- [ ] **3.5** Click "SAVE AND CONTINUE"
- [ ] **3.6** Click "ADD OR REMOVE SCOPES"
- [ ] **3.7** Select these scopes:
  - ✅ `.../auth/userinfo.email`
  - ✅ `.../auth/userinfo.profile`
  - ✅ `openid`
- [ ] **3.8** Click "UPDATE" → "SAVE AND CONTINUE"
- [ ] **3.9** (Optional) Add test users
- [ ] **3.10** Click "SAVE AND CONTINUE"
- [ ] **3.11** Review summary → "BACK TO DASHBOARD"

### Part 4: Create Credentials (2-3 minutes)

- [ ] **4.1** Go to "APIs & Services" → "Credentials"
- [ ] **4.2** Click "+ CREATE CREDENTIALS"
- [ ] **4.3** Select "OAuth client ID"
- [ ] **4.4** Application type: "Web application"
- [ ] **4.5** Name: `Garmently Web Client`
- [ ] **4.6** Authorized JavaScript origins → "+ ADD URI":
  - `http://localhost:3000`
  - `https://[your-vercel-url].vercel.app`
- [ ] **4.7** Authorized redirect URIs → "+ ADD URI":
  - `http://localhost:3000`
  - `https://[your-vercel-url].vercel.app`
- [ ] **4.8** Click "CREATE"
- [ ] **4.9** **COPY Client ID** (save it!)
- [ ] **4.10** **COPY Client Secret** (save it!)

### Part 5: Railway Setup (2 minutes)

- [ ] **5.1** Go to https://railway.app/dashboard
- [ ] **5.2** Select your backend project
- [ ] **5.3** Click "Variables" tab
- [ ] **5.4** Add variable:
  - Name: `GOOGLE_OAUTH_CLIENT_ID`
  - Value: [Paste Client ID]
- [ ] **5.5** Add variable:
  - Name: `GOOGLE_OAUTH_CLIENT_SECRET`
  - Value: [Paste Client Secret]
- [ ] **5.6** Wait for automatic redeploy (~2 min)

### Part 6: Vercel Setup (2 minutes)

- [ ] **6.1** Go to https://vercel.com/dashboard
- [ ] **6.2** Select your frontend project
- [ ] **6.3** Go to Settings → Environment Variables
- [ ] **6.4** Add variable:
  - Name: `REACT_APP_GOOGLE_CLIENT_ID`
  - Value: [Paste Client ID]
- [ ] **6.5** Select all environments
- [ ] **6.6** Click "Save"
- [ ] **6.7** Go to Deployments tab
- [ ] **6.8** Click "..." → "Redeploy" on latest

### Part 7: Local Setup (1 minute)

- [ ] **7.1** Create `backend/.env` file:
  ```
  GOOGLE_OAUTH_CLIENT_ID=your-client-id
  GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
  ```
- [ ] **7.2** Create `frontend/.env` file:
  ```
  REACT_APP_GOOGLE_CLIENT_ID=your-client-id
  ```
- [ ] **7.3** Restart backend server
- [ ] **7.4** Restart frontend server

### Part 8: Testing (2 minutes)

- [ ] **8.1** Open http://localhost:3000/login
- [ ] **8.2** See "Sign in with Google" button
- [ ] **8.3** Click button
- [ ] **8.4** Google popup opens
- [ ] **8.5** Select Google account
- [ ] **8.6** Click "Continue"
- [ ] **8.7** Redirected to dashboard
- [ ] **8.8** Successfully logged in! 🎉

### Part 9: Production Testing (1 minute)

- [ ] **9.1** Go to your live Vercel URL
- [ ] **9.2** Click "Sign in with Google"
- [ ] **9.3** Successfully logs in
- [ ] **9.4** Everything works! 🚀

---

## 📝 Save These Values

Write your credentials here for reference:

```
Project Name: Garmently

Client ID: 
_______________________________________________.apps.googleusercontent.com

Client Secret: 
GOCSPX-_______________________________________

Frontend URL (Vercel):
https://________________________________________________.vercel.app

Backend URL (Railway):
https://________________________________________________.railway.app
```

---

## ⏱️ Total Time: 15-20 minutes

---

## 🐛 Troubleshooting Quick Fixes

**Google button not showing?**
→ Check `REACT_APP_GOOGLE_CLIENT_ID` in frontend .env
→ Restart frontend: `npm start`

**"redirect_uri_mismatch" error?**
→ Add your exact URL to authorized origins in Google Console

**Works locally but not in production?**
→ Check environment variables are set in Railway/Vercel
→ Wait 2-3 minutes for deployments to complete

**"Invalid client" error?**
→ Verify Client ID matches in frontend and backend

---

## 🎯 What You Accomplished

✅ Created free Google Cloud project (no billing!)
✅ Configured OAuth 2.0 authentication
✅ Integrated Google Sign-In to your app
✅ Set up production and local environments
✅ Tested end-to-end authentication flow

**Users can now sign in with one click!** 🎉

---

## 📚 Full Documentation

For detailed explanations and troubleshooting:
- `GOOGLE_OAUTH_STEP_BY_STEP.md` - Complete guide
- `GOOGLE_OAUTH_SETUP.md` - Technical details
- `GOOGLE_SIGNIN_COMPLETE.md` - Implementation summary

---

**Date Completed:** _______________

**Tested By:** _______________

**Status:** ✅ Working / ⚠️ Issues / ❌ Not tested
