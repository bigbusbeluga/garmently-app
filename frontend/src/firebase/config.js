// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyB5aOeriedYuPtDFDzCta-4jQ5kZ8Df35A",
  authDomain: "garmently-c18c5.firebaseapp.com",
  projectId: "garmently-c18c5",
  storageBucket: "garmently-c18c5.firebasestorage.app",
  messagingSenderId: "980901791282",
  appId: "1:980901791282:web:e12e14682ae94fbe531e2b",
  measurementId: "G-F9NJD38NLQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'BDUQFQlMtaldq001D49I1-Y4hzfsdMuPLIX2U2V37fF_hz8exEIsbPYCgs7RqWyDaRO9AAAzYypvPToOdEKIDN0'
      });
      
      if (token) {
        console.log('FCM Token:', token);
        // Send this token to your backend to store it
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });

export { messaging };
