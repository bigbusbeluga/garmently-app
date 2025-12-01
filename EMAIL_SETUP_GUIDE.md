# Email Verification Setup Guide

This guide explains how to configure Gmail SMTP for email verification in Garmently.

## Prerequisites

- A Gmail account
- 2-Factor Authentication enabled on your Gmail account (required for App Passwords)

## Step 1: Enable 2-Factor Authentication

1. Go to your [Google Account Security Settings](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on "2-Step Verification"
3. Follow the prompts to enable 2FA if not already enabled

## Step 2: Generate Gmail App Password

1. Visit [Google App Passwords](https://myaccount.google.com/apppasswords)
2. You may need to sign in again
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter "Garmently" as the custom name
6. Click **Generate**
7. Google will show a 16-character password - **COPY THIS NOW** (you won't be able to see it again)

The app password looks like: `abcd efgh ijkl mnop` (4 groups of 4 characters)

## Step 3: Configure Backend Environment Variables

### For Local Development

Create or update `backend/.env` file:

```env
EMAIL_HOST_USER=your.email@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
```

**Important:** 
- Replace `your.email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with the 16-character app password (remove spaces)
- Never commit `.env` file to version control

### For Railway Deployment

1. Go to your [Railway Dashboard](https://railway.app/dashboard)
2. Select your Garmently backend project
3. Go to the **Variables** tab
4. Add the following environment variables:
   - Key: `EMAIL_HOST_USER`
     Value: `your.email@gmail.com`
   - Key: `EMAIL_HOST_PASSWORD`
     Value: `abcdefghijklmnop`
5. Click **Add** for each variable
6. Railway will automatically redeploy with new environment variables

## Step 4: Test Email Sending

### Test Locally

1. Start your Django development server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Try the signup flow:
   - Go to http://localhost:3000/signup
   - Enter an email address
   - Click "Send Verification Code"
   - Check your inbox for the verification code

### Test in Production

1. Go to your production frontend URL
2. Try the signup flow
3. Check your inbox for verification email

## Troubleshooting

### "Authentication failed" Error

**Cause:** Invalid app password or wrong email address

**Solution:**
- Double-check that `EMAIL_HOST_USER` is your correct Gmail address
- Verify `EMAIL_HOST_PASSWORD` is the 16-character app password (no spaces)
- Try generating a new app password

### Email Not Received

**Possible Causes:**
1. **In Spam Folder** - Check your spam/junk folder
2. **Rate Limiting** - Gmail may rate limit if sending too many emails
3. **Invalid Email** - Verify the recipient email address is correct

**Solution:**
- Check spam folder
- Wait a few minutes and try again
- Use Django logs to verify email was sent: Check Railway logs or console output

### "535-5.7.8 Username and Password not accepted"

**Cause:** 2FA not enabled or trying to use regular password instead of app password

**Solution:**
- Ensure 2-Factor Authentication is enabled on your Gmail account
- Generate a new App Password (don't use your regular Gmail password)

### "Less secure app access"

**Note:** This setting is deprecated. You **must** use App Passwords now.

**Solution:**
- Enable 2FA on your Gmail account
- Generate and use an App Password

## Email Configuration Details

The backend is configured in `backend/garmently_backend/settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('EMAIL_HOST_USER', 'noreply@garmently.com')
VERIFICATION_CODE_EXPIRY = 10  # minutes
```

## Verification Flow

1. User enters email on signup page
2. Backend generates 6-digit verification code
3. Code is saved to database with timestamp
4. Email sent to user with code
5. User enters code (valid for 10 minutes)
6. Backend verifies code and timestamp
7. User completes registration

## Security Notes

- **Never commit** `.env` files or hardcode credentials
- App passwords are safer than using your main Gmail password
- Verification codes expire after 10 minutes
- Codes are deleted after successful verification
- Rate limiting prevents abuse

## Alternative Email Providers

If you prefer not to use Gmail, you can use other SMTP providers:

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your_sendgrid_api_key
```

### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=postmaster@yourdomain.mailgun.org
EMAIL_HOST_PASSWORD=your_mailgun_password
```

### AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_ses_smtp_username
EMAIL_HOST_PASSWORD=your_ses_smtp_password
```

## Need Help?

- Check Railway logs for backend errors
- Check browser console for frontend errors
- Verify environment variables are set correctly
- Ensure backend is deployed with latest code
