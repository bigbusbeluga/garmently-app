# SendGrid Setup Guide for Garmently

# SendGrid Setup Guide for Garmently

## Step 1: Create a SendGrid Account

1. Go to [https://sendgrid.com/](https://sendgrid.com/)
2. Click **Start for Free** and create a free account
3. Complete the signup form (you may need to verify your email)
4. You'll get **100 emails per day FREE** (no credit card required)

## Step 2: Create an API Key

1. After logging in, go to **Settings** → **API Keys** (left sidebar)
2. Click **Create API Key** button
3. Give it a name like "Garmently Production"
4. Select **Full Access** (or Restricted Access with Mail Send permissions)
5. Click **Create & View**
6. **COPY THE API KEY NOW** - you won't be able to see it again!
   - It starts with `SG.`
   - Example: `SG.xxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyy`

## Step 3: Verify a Sender Identity

SendGrid requires you to verify who's sending emails:

### Option A: Single Sender Verification (Easiest - Good for Testing)

1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Click **Create New Sender** or **Get Started**
3. Fill in the form:
   - **From Name**: Garmently
   - **From Email Address**: Your verified email (e.g., `your-email@gmail.com`)
   - **Reply To**: Same as from email
   - **Company**: Garmently
   - **Address, City, State, ZIP, Country**: Your info
4. Click **Create**
5. Check your email inbox and click the verification link
6. Once verified, you can send emails from this address

### Option B: Domain Authentication (Best for Production)

1. Go to **Settings** → **Sender Authentication** → **Authenticate Your Domain**
2. Click **Get Started**
3. Select your DNS host (where your domain is registered)
4. Enter your domain (e.g., `garmently.com`)
5. Follow the instructions to add DNS records (CNAME records)
6. Wait for verification (usually 24-48 hours)

## Step 4: Add Environment Variables to Railway

Go to your Railway project → **Variables** tab and add:

### Using Single Sender (Testing/Production):
```
SENDGRID_API_KEY=SG.your-actual-api-key-here
SENDGRID_FROM_EMAIL=Garmently <your-verified-email@gmail.com>
```

### Using Domain Authentication (Production):
```
SENDGRID_API_KEY=SG.your-actual-api-key-here
SENDGRID_FROM_EMAIL=Garmently <noreply@yourdomain.com>
```

**Important**: The email address in `SENDGRID_FROM_EMAIL` MUST match a verified sender or authenticated domain!

## Step 5: Deploy and Test

1. Commit and push your changes:
   ```powershell
   git add .
   git commit -m "Switch to SendGrid for email"
   git push origin main
   ```

2. Wait for Railway to redeploy

3. Test the signup flow:
   - Try to sign up with an email
   - You should receive the verification code email within seconds
   - Check spam folder if you don't see it

## Troubleshooting

### "The from address does not match a verified Sender Identity"
- Make sure the email in `SENDGRID_FROM_EMAIL` exactly matches your verified sender
- Check **Settings** → **Sender Authentication** → **Single Sender Verification** to see verified emails

### Email not arriving
- Check your spam/junk folder
- Verify your API key is correct (starts with `SG.`)
- Check Railway logs for error messages
- Make sure you're within the 100 emails/day limit

### "API key does not have permission"
- Recreate your API key with **Full Access** or ensure **Mail Send** permission is enabled

### "Invalid API Key"
- Double-check you copied the entire API key (they're long!)
- Make sure there are no extra spaces or line breaks
- Recreate the API key if needed

## SendGrid Free Tier Limits

### Free Plan (Essentials):
- **100 emails per day** forever
- No credit card required
- 2,000 contacts
- Email API
- Single sender verification
- Perfect for testing and small apps

### To Send More Emails:
- **Basic Plan** ($19.95/month): 50,000 emails/month
- **Advanced Plan** ($89.95/month): 100,000 emails/month
- Can scale up as needed

## Best Practices

1. **Start with Single Sender Verification** - it's instant and perfect for testing
2. **Use Domain Authentication for production** - better deliverability and professional appearance
3. **Monitor your sending** - Check **Activity** in SendGrid dashboard
4. **Set up webhooks** - Get notifications about bounces, opens, clicks (optional)
5. **Use templates** - SendGrid has a template editor for prettier emails (optional)

## Next Steps After Setup

1. Test that emails are arriving
2. Check SendGrid **Activity** dashboard to see email status
3. Consider setting up email templates for nicer looking emails
4. Add unsubscribe links if sending marketing emails (required by law)
5. Monitor your sending reputation in the SendGrid dashboard

