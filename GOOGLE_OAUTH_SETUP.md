# Google OAuth Setup Guide

This guide explains how to configure Google Sign-In for Garmently.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Garmently"
4. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type → Click "Create"
3. Fill in the required fields:
   - **App name**: Garmently
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click "Save and Continue"
5. On "Scopes" page, click "Add or Remove Scopes"
6. Select these scopes:
   - `userinfo.email`
   - `userinfo.profile`
7. Click "Update" → "Save and Continue"
8. On "Test users" page (optional for development):
   - Add test email addresses if in testing mode
9. Click "Save and Continue" → "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure settings:
   - **Name**: Garmently Web Client
   - **Authorized JavaScript origins**:
     - http://localhost:3000 (for local development)
     - https://your-frontend.vercel.app (your production URL)
   - **Authorized redirect URIs**:
     - http://localhost:3000 (for local development)
     - https://your-frontend.vercel.app (your production URL)
5. Click "Create"
6. **IMPORTANT**: Copy the Client ID and Client Secret

## Step 5: Configure Backend Environment Variables

### For Railway (Production)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your Garmently backend project
3. Go to "Variables" tab
4. Add these environment variables:
   - Key: `GOOGLE_OAUTH_CLIENT_ID`
     Value: `Your Client ID from Step 4`
   - Key: `GOOGLE_OAUTH_CLIENT_SECRET`
     Value: `Your Client Secret from Step 4`
5. Railway will auto-redeploy

### For Local Development

Create or update `backend/.env`:
```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
```

## Step 6: Configure Frontend Environment Variables

### For Vercel (Production)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Garmently frontend project
3. Go to "Settings" → "Environment Variables"
4. Add:
   - Key: `REACT_APP_GOOGLE_CLIENT_ID`
     Value: `Your Client ID from Step 4` (same as backend)
5. Redeploy your frontend

### For Local Development

Create or update `frontend/.env`:
```env
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Note**: The frontend only needs the Client ID, not the secret.

## Step 7: Install Dependencies

### Backend
```bash
cd backend
pip install -r requirements.txt
```

New packages added:
- `django-allauth==65.3.0`
- `requests==2.32.3`

### Frontend
```bash
cd frontend
npm install
```

New package added:
- `@react-oauth/google@^0.12.1`

## Step 8: Run Database Migrations

```bash
cd backend
python manage.py migrate
```

This creates tables for:
- `django.contrib.sites`
- `allauth.account`
- `allauth.socialaccount`

## Step 9: Test Google Sign-In

### Local Testing

1. Start backend:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Go to http://localhost:3000/login or http://localhost:3000/signup
4. Click "Sign in with Google" button
5. Select your Google account
6. You should be redirected to the dashboard

### Production Testing

1. Go to your production URL
2. Navigate to login or signup page
3. Click "Sign in with Google"
4. Authenticate with Google
5. Verify you're logged in

## How It Works

### Frontend Flow

1. User clicks "Sign in with Google" button
2. Google OAuth popup opens
3. User selects Google account
4. Google returns a credential (JWT token)
5. Frontend sends credential to backend `/api/auth/google/`

### Backend Flow

1. Backend receives Google credential
2. Verifies token with Google API
3. Extracts user info (email, name, picture)
4. Checks if user exists with that email
5. If user exists: Links Google account to existing user
6. If new user: Creates new user account
7. Returns Django auth token to frontend
8. Frontend stores token and user data

### Key Features

✅ **Email Linking**: If user already registered with email, Google account links to existing account
✅ **Auto-Registration**: New Google users automatically get accounts created
✅ **No Password**: Google users don't need passwords
✅ **Profile Picture**: Google profile picture is included in response
✅ **Secure**: Uses OAuth 2.0 standard with token verification

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

**Cause**: Redirect URI not configured in Google Cloud Console

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add your exact frontend URL to "Authorized JavaScript origins"
4. Add your exact frontend URL to "Authorized redirect URIs"
5. Save changes (may take a few minutes to propagate)

### "Google Sign-In button not showing"

**Cause**: Client ID not configured

**Solution**:
- Check `REACT_APP_GOOGLE_CLIENT_ID` is set in frontend environment
- Verify it matches the Client ID from Google Cloud Console
- Restart frontend development server after adding env variable

### "Invalid access token" Error

**Cause**: Backend can't verify Google token

**Solution**:
- Check backend has internet access
- Verify `GOOGLE_OAUTH_CLIENT_ID` matches frontend
- Check Railway logs for detailed error messages

### User Created But Can't Login Normally

**This is expected behavior**:
- Google users have no password set
- They must always use "Sign in with Google"
- To enable password login, user must set a password via "Forgot Password"

### Database Errors After Migration

**Cause**: Missing `django.contrib.sites` site object

**Solution**:
```bash
python manage.py shell
```

Then run:
```python
from django.contrib.sites.models import Site
Site.objects.create(domain='localhost:3000', name='Garmently Local')
```

For production, use your actual domain.

## Security Best Practices

✅ **Never commit** `.env` files or credentials to Git
✅ **Client Secret** should only be in backend (never frontend)
✅ **Client ID** can be public (it's safe in frontend code)
✅ **Use HTTPS** in production for all OAuth redirects
✅ **Restrict Origins** in Google Console to your actual domains
✅ **Rotate Secrets** if they're ever exposed

## Environment Variables Summary

### Backend (Railway)
```
GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxx
```

### Frontend (Vercel)
```
REACT_APP_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

## Testing Checklist

- [ ] Google button appears on Login page
- [ ] Google button appears on Signup page
- [ ] Clicking button opens Google OAuth popup
- [ ] Can select Google account
- [ ] New users are automatically registered
- [ ] Existing users (by email) have Google account linked
- [ ] After sign-in, user is redirected to dashboard
- [ ] Token is stored in localStorage
- [ ] User data is available in AuthContext
- [ ] Profile picture from Google is included

## Alternative: One Tap Sign-In

The implementation includes Google One Tap, which shows a popup automatically when:
- User visits login/signup page
- User is not already logged in
- User has previously used Google Sign-In

This improves user experience by reducing friction.

## Limitations

- Users who sign up with Google have no password
- They must use Google to log in every time
- Or they can set a password via password reset flow

## Future Enhancements

- [ ] Add more OAuth providers (Facebook, GitHub, Apple)
- [ ] Allow unlinking Google account
- [ ] Show "Connected Accounts" in profile
- [ ] Sync profile picture from Google
- [ ] Allow setting password for Google users
