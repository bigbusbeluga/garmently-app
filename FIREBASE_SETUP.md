# Firebase Cloud Messaging (FCM) Setup Guide

## Overview
Firebase Cloud Messaging has been integrated into Garmently for push notifications. This allows sending notifications to users for outfit suggestions, laundry reminders, and weather alerts.

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard

### 2. Enable Cloud Messaging
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Select **Cloud Messaging** tab
3. Under "Cloud Messaging API (Legacy)", note your **Server Key**
4. Under "Web Push certificates", click **Generate key pair**
5. Copy the **VAPID key** (starts with `B...`)

### 3. Get Firebase Configuration
In Firebase Console → Project Settings → General:
- Copy your **Web app configuration** object

### 4. Configure Frontend

#### A. Update `frontend/src/firebase/config.js`
Replace the placeholder values:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // From Firebase Console
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional (Analytics)
};
```

#### B. Update VAPID Key
In the same file, replace:
```javascript
vapidKey: 'YOUR_VAPID_KEY'  // The key from step 2
```

#### C. Update Service Worker
Edit `frontend/public/firebase-messaging-sw.js` with the same config:
```javascript
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
});
```

### 5. Test Locally
1. Start frontend: `npm start`
2. Start backend: `python manage.py runserver`
3. Allow notifications when prompted
4. Check browser console for FCM token

### 6. Sending Notifications (Backend)

Install Firebase Admin SDK:
```bash
pip install firebase-admin
```

Create `backend/notifications.py`:
```python
import firebase_admin
from firebase_admin import credentials, messaging

# Initialize Firebase Admin (do this once)
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

def send_notification(fcm_token, title, body, data=None):
    """Send push notification to a user"""
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data or {},
        token=fcm_token,
    )
    
    try:
        response = messaging.send(message)
        print(f'Successfully sent message: {response}')
        return response
    except Exception as e:
        print(f'Error sending message: {e}')
        return None

# Example usage:
from api.models import Profile

# Get user's FCM token
user_profile = Profile.objects.get(user=user)
if user_profile.fcm_token:
    send_notification(
        user_profile.fcm_token,
        "Weather Alert! ☀️",
        "It's sunny today! Perfect for your blue outfit.",
        {"type": "weather", "outfit_id": "123"}
    )
```

### 7. Get Service Account Key
1. Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key**
3. Save JSON file as `serviceAccountKey.json` in backend folder
4. Add to `.gitignore`:
   ```
   serviceAccountKey.json
   ```

### 8. Example Notification Scenarios

#### Outfit Suggestion
```python
send_notification(
    fcm_token,
    "Outfit of the Day 👔",
    "Based on today's weather, we suggest your navy blazer!",
    {"type": "outfit_suggestion", "outfit_id": "456"}
)
```

#### Laundry Reminder
```python
send_notification(
    fcm_token,
    "Laundry Reminder 🧺",
    "You have 5 items ready to wash",
    {"type": "laundry_reminder"}
)
```

#### Weather Alert
```python
send_notification(
    fcm_token,
    "Rain Alert! ☔",
    "Don't forget your jacket today",
    {"type": "weather_alert"}
)
```

## Testing with Firebase Console

### Send Test Message:
1. Firebase Console → Cloud Messaging
2. Click **Send your first message**
3. Enter notification title and text
4. Click **Send test message**
5. Paste your FCM token (from browser console)
6. Click **Test**

## Features Implemented

### Frontend
- ✅ Notification permission prompt with beautiful UI
- ✅ FCM token registration
- ✅ Foreground message handling (toast notifications)
- ✅ Background message handling (service worker)
- ✅ Token saved to backend automatically

### Backend
- ✅ `Profile.fcm_token` field to store tokens
- ✅ `/api/save-fcm-token/` endpoint
- ✅ Migration created and applied

### User Flow
1. User logs in
2. After 3 seconds, notification prompt appears
3. User clicks "Enable Notifications"
4. Browser asks for permission
5. If granted, FCM token is generated and saved to backend
6. Ready to receive notifications!

## Notification Types to Implement

### High Priority
1. **Weather-based outfit suggestions** - Daily at 7 AM
2. **Laundry reminders** - When dirty items > 5
3. **Favorite outfit available** - When favorite is clean

### Medium Priority
4. **Weekly outfit planning** - Sunday evening
5. **Seasonal wardrobe tips** - Monthly
6. **Outfit streak** - After wearing different outfits 7 days

### Low Priority
7. **New feature announcements**
8. **Social features** (if added later)

## Environment Variables (Production)

Add to `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## Security Notes

- ✅ Never commit `serviceAccountKey.json`
- ✅ Store FCM tokens securely in database
- ✅ Validate user owns token before sending
- ✅ Use environment variables for production
- ✅ Implement rate limiting for notifications

## Troubleshooting

### Token not generated?
- Check browser console for errors
- Verify Firebase config is correct
- Ensure HTTPS in production (FCM requires secure context)

### Notifications not received?
- Check if permission is granted
- Verify token is saved in database
- Test with Firebase Console first
- Check service worker is registered

### Background notifications not working?
- Verify `firebase-messaging-sw.js` is in `/public`
- Check service worker console for errors
- Make sure config matches in both files

## Next Steps

1. ✅ Configure Firebase project
2. ✅ Update config files with real credentials
3. ⏳ Install firebase-admin in backend
4. ⏳ Create notification scheduler
5. ⏳ Implement notification triggers
6. ⏳ Test all notification scenarios

## Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Web Push Notifications Guide](https://web.dev/push-notifications-overview/)
