import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '../firebase/config';
import './NotificationPrompt.css';

function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Check if user has already granted or denied permission
    if (Notification.permission === 'default') {
      // Show prompt after a short delay
      setTimeout(() => setShow(true), 3000);
    } else if (Notification.permission === 'granted') {
      // Request FCM token if permission already granted
      handleEnableNotifications();
    }

    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body
        });
        // Auto-hide after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      })
      .catch((err) => console.log('Error listening to messages:', err));
  }, []);

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    
    if (token) {
      // Send token to backend
      try {
        const authToken = localStorage.getItem('token');
        await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/save-fcm-token/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`
          },
          body: JSON.stringify({ fcm_token: token })
        });
        console.log('FCM token saved to backend');
      } catch (error) {
        console.error('Error saving FCM token:', error);
      }
    }
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show && !notification) return null;

  return (
    <>
      {/* Permission Prompt */}
      {show && (
        <div className="notification-prompt-overlay">
          <div className="notification-prompt">
            <div className="notification-prompt-icon">
              <i className="fas fa-bell"></i>
            </div>
            <h3>Stay Updated!</h3>
            <p>Get notifications for outfit suggestions, laundry reminders, and weather alerts.</p>
            <div className="notification-prompt-actions">
              <button className="btn-secondary" onClick={handleDismiss}>
                Not Now
              </button>
              <button className="btn-primary" onClick={handleEnableNotifications}>
                <i className="fas fa-bell"></i> Enable Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Foreground Notification Toast */}
      {notification && (
        <div className="notification-toast">
          <div className="notification-toast-icon">
            <i className="fas fa-bell"></i>
          </div>
          <div className="notification-toast-content">
            <h4>{notification.title}</h4>
            <p>{notification.body}</p>
          </div>
          <button 
            className="notification-toast-close"
            onClick={() => setNotification(null)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </>
  );
}

export default NotificationPrompt;
