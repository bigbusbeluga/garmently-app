import React, { useState, useEffect } from 'react';
import './Notifications.css';

function Notifications({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    checkScheduledOutfits();
  }, [isOpen]);

  const checkScheduledOutfits = () => {
    const scheduled = localStorage.getItem('scheduled_outfits');
    if (!scheduled) return;

    const outfits = JSON.parse(scheduled);
    const today = new Date().toISOString().split('T')[0];
    const notifs = [];

    // Check for today's outfit
    if (outfits[today]) {
      notifs.push({
        id: 'today',
        type: 'reminder',
        message: `Time to wear your outfit: ${outfits[today].name}!`,
        time: 'Today',
        outfit: outfits[today]
      });
    }

    // Check for upcoming outfits (next 3 days)
    for (let i = 1; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (outfits[dateStr]) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        notifs.push({
          id: dateStr,
          type: 'upcoming',
          message: `Upcoming: ${outfits[dateStr].name}`,
          time: dayName,
          outfit: outfits[dateStr]
        });
      }
    }

    setNotifications(notifs);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="notifications-overlay" onClick={onClose}></div>
      <div className="notifications-panel">
        <div className="notifications-header">
          <h3><i className="fas fa-bell"></i> Notifications</h3>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="notifications-content">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <i className="fas fa-bell-slash"></i>
              <p>No outfit reminders</p>
              <small>Schedule outfits in the calendar to get reminders</small>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notif => (
                <div key={notif.id} className={`notification-item ${notif.type}`}>
                  <div className="notif-icon">
                    {notif.type === 'reminder' ? (
                      <i className="fas fa-clock"></i>
                    ) : (
                      <i className="fas fa-calendar-day"></i>
                    )}
                  </div>
                  <div className="notif-content">
                    <p className="notif-message">{notif.message}</p>
                    <small className="notif-time">{notif.time}</small>
                    {notif.outfit && notif.outfit.garments && (
                      <div className="notif-outfit-preview">
                        {notif.outfit.garments.slice(0, 3).map((garment, idx) => (
                          <img 
                            key={idx}
                            src={garment.image_url} 
                            alt={garment.name}
                            className="notif-garment-thumb"
                          />
                        ))}
                        {notif.outfit.garments.length > 3 && (
                          <span className="more-count">+{notif.outfit.garments.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => clearNotification(notif.id)}
                    className="clear-notif-btn"
                    title="Clear"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Notifications;
