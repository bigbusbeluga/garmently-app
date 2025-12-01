import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './Calendar.css';

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledOutfits, setScheduledOutfits] = useState({});
  const [availableOutfits, setAvailableOutfits] = useState([]);
  const [showOutfitSelector, setShowOutfitSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Calendar - Garmently';
    fetchOutfits();
    loadScheduledOutfits();
  }, []);

  const fetchOutfits = async () => {
    try {
      const data = await apiService.getOutfits();
      setAvailableOutfits(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching outfits:', err);
      setLoading(false);
    }
  };

  const loadScheduledOutfits = () => {
    const stored = localStorage.getItem('scheduled_outfits');
    if (stored) {
      setScheduledOutfits(JSON.parse(stored));
    }
  };

  const saveScheduledOutfits = (schedule) => {
    localStorage.setItem('scheduled_outfits', JSON.stringify(schedule));
    setScheduledOutfits(schedule);
  };

  const scheduleOutfit = (date, outfit) => {
    const dateKey = formatDateKey(date);
    const newSchedule = {
      ...scheduledOutfits,
      [dateKey]: outfit
    };
    saveScheduledOutfits(newSchedule);
    setShowOutfitSelector(false);
    setSelectedDate(null);
  };

  const removeScheduledOutfit = (date) => {
    const dateKey = formatDateKey(date);
    const newSchedule = { ...scheduledOutfits };
    delete newSchedule[dateKey];
    saveScheduledOutfits(newSchedule);
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getScheduledOutfit = (date) => {
    if (!date) return null;
    const dateKey = formatDateKey(date);
    return scheduledOutfits[dateKey];
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1><i className="fas fa-calendar-alt"></i> Outfit Calendar</h1>
        <p>Plan your outfits for the week ahead</p>
      </div>

      <div className="calendar-container">
        <div className="calendar-nav">
          <button className="btn-nav" onClick={previousMonth}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button className="btn-nav" onClick={nextMonth}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}

          {days.map((date, index) => {
            const scheduledOutfit = getScheduledOutfit(date);
            const isCurrentDay = isToday(date);
            
            return (
              <div
                key={index}
                className={`calendar-cell ${!date ? 'empty' : ''} ${isCurrentDay ? 'today' : ''} ${scheduledOutfit ? 'has-outfit' : ''}`}
                onClick={() => {
                  if (date) {
                    setSelectedDate(date);
                    setShowOutfitSelector(true);
                  }
                }}
              >
                {date && (
                  <>
                    <div className="date-number">{date.getDate()}</div>
                    {scheduledOutfit && (
                      <div className="scheduled-outfit">
                        <div className="outfit-preview">
                          {scheduledOutfit.garments && scheduledOutfit.garments.length > 0 && scheduledOutfit.garments[0].image_url && (
                            <img src={scheduledOutfit.garments[0].image_url} alt={scheduledOutfit.name} />
                          )}
                        </div>
                        <div className="outfit-name">{scheduledOutfit.name}</div>
                        <button 
                          className="btn-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeScheduledOutfit(date);
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Outfit Selector Modal */}
      {showOutfitSelector && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowOutfitSelector(false)}>
          <div className="selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Outfit for {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}</h3>
              <button className="close-btn" onClick={() => setShowOutfitSelector(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="outfits-list">
              {loading ? (
                <p>Loading outfits...</p>
              ) : availableOutfits.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-users fa-3x"></i>
                  <p>No outfits available</p>
                  <p>Create outfits in Mix & Match first</p>
                </div>
              ) : (
                availableOutfits.map(outfit => (
                  <div
                    key={outfit.id}
                    className="outfit-item"
                    onClick={() => scheduleOutfit(selectedDate, outfit)}
                  >
                    <div className="outfit-thumbnail">
                      {outfit.garments && outfit.garments.length > 0 && outfit.garments[0].image_url ? (
                        <img src={outfit.garments[0].image_url} alt={outfit.name} />
                      ) : (
                        <i className="fas fa-tshirt"></i>
                      )}
                    </div>
                    <div className="outfit-info">
                      <h4>{outfit.name}</h4>
                      <p>{outfit.garments?.length || 0} items</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
