# Fix Google Auth in Production

## Problem
Google Sign-In works locally but shows "invalid credentials" in production. This happens because:
1. The `django-allauth` tables (including `SocialAccount`) don't exist in the production database
2. When a new Google user tries to sign in, the backend tries to create a SocialAccount record but fails

## Solution

### Step 1: Run Migrations in Railway

You need to run Django migrations in your Railway production environment to create the allauth tables.

**Option A: Using Railway CLI**
```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run python manage.py migrate
```

**Option B: Using Railway Dashboard**
1. Go to your Railway project
2. Click on your backend service
3. Go to the "Settings" tab
4. Add a one-time deployment command or use the terminal:
   ```bash
   python manage.py migrate
   ```

**Option C: Add to Build Command**
In Railway settings, update your build/start command to:
```bash
python manage.py migrate && python manage.py collectstatic --noinput && gunicorn garmently_backend.wsgi:application
```

### Step 2: Verify Allauth Tables Exist

After running migrations, verify these tables exist in your PostgreSQL database:
- `account_emailaddress`
- `account_emailconfirmation`
- `socialaccount_socialaccount`
- `socialaccount_socialapp`
- `socialaccount_socialtoken`

You can check this by:
1. Going to Railway Dashboard
2. Click on your PostgreSQL database
3. Go to "Data" or "Query" tab
4. Run: `\dt` (in psql) or check the tables list

### Step 3: Check Google OAuth Configuration

Make sure these environment variables are set in Railway:
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret (if using server-side verification)

### Step 4: Test the Flow

1. Try signing in with a new Google account
2. Check Railway logs for any errors:
   ```bash
   railway logs
   ```
3. The user should be created and able to set a password

## Expected Behavior After Fix

- **New Google User**: Creates account automatically, shows set password option
- **Existing Google User**: Logs in successfully
- **Existing Email/Password User**: Can also link Google account

## Alternative: Remove Allauth Dependency (Simpler)

If you don't need full allauth features, you can simplify by removing the SocialAccount dependency:

1. Remove these lines from `views.py` (around line 504-513):
```python
# Get or create social account
social_account, created = SocialAccount.objects.get_or_create(
    provider='google',
    uid=google_id,
    defaults={'user': user, 'extra_data': user_info}
)

if not created and social_account.user != user:
    social_account.user = user
    social_account.extra_data = user_info
    social_account.save()
```

2. This will still allow Google login but won't track social accounts in the database

Choose the solution that best fits your needs!
