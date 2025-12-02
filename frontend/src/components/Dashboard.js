import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    total_garments: 0,
    clean_garments: 0,
    dirty_garments: 0,
    favorite_garments: 0
  });
  const [recentGarments, setRecentGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    document.title = 'Dashboard - Garmently';
    fetchDashboardData();
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    console.log('Fetching weather...');
    try {
      // Get user's location
      if (navigator.geolocation) {
        console.log('Geolocation supported, requesting position...');
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            console.log('Position received:', position.coords);
            const { latitude, longitude } = position.coords;
            await getWeatherData(latitude, longitude);
          },
          (error) => {
            console.error('Location error:', error);
            setLocationError('Location access denied. Using default location.');
            // Fallback to a default location (Manila, Philippines)
            getWeatherData(14.5995, 120.9842);
          }
        );
      } else {
        console.log('Geolocation not supported');
        setLocationError('Geolocation not supported. Using default location.');
        getWeatherData(14.5995, 120.9842);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      setWeatherLoading(false);
    }
  };

  const getWeatherData = async (lat, lon) => {
    console.log('Getting weather data for:', lat, lon);
    try {
      const API_KEY = '1a2e29061f7d759b5d32c8e8560a9ec2'; // OpenWeatherMap API key
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      console.log('Weather API URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Weather API response:', data);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const weatherData = {
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          city: data.name,
          country: data.sys.country
        };
        console.log('Setting weather data:', weatherData);
        setWeather(weatherData);
      } else {
        console.error('Weather API error - Status:', response.status);
        console.error('Error details:', data);
        setLocationError(`Weather service unavailable: ${data.message || 'API key may be invalid'}`);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLocationError('Unable to fetch weather data');
    } finally {
      console.log('Weather loading complete');
      setWeatherLoading(false);
    }
  };

  const getOutfitSuggestion = (temp, description) => {
    const desc = description.toLowerCase();
    
    if (temp >= 30) {
      return {
        suggestion: 'Light & Breathable',
        items: ['Tank tops', 'Shorts', 'Sundress', 'Sandals'],
        icon: 'fa-sun',
        color: '#f59e0b'
      };
    } else if (temp >= 25) {
      return {
        suggestion: 'Casual & Comfortable',
        items: ['T-shirts', 'Light pants', 'Sneakers'],
        icon: 'fa-cloud-sun',
        color: '#10b981'
      };
    } else if (temp >= 20) {
      return {
        suggestion: 'Layer Up',
        items: ['Long sleeves', 'Jeans', 'Light jacket'],
        icon: 'fa-cloud',
        color: '#3b82f6'
      };
    } else if (temp >= 15) {
      return {
        suggestion: 'Warm Layers',
        items: ['Sweater', 'Jacket', 'Closed shoes'],
        icon: 'fa-wind',
        color: '#6366f1'
      };
    } else {
      return {
        suggestion: 'Bundle Up!',
        items: ['Heavy jacket', 'Scarf', 'Gloves', 'Boots'],
        icon: 'fa-snowflake',
        color: '#8b5cf6'
      };
    }
  };

  const fetchDashboardData = async () => {
    try {
      const garments = await apiService.getGarments();
      
      // Calculate stats
      const total = garments.length;
      const clean = garments.filter(g => g.status === 'clean').length;
      const dirty = garments.filter(g => g.status === 'dirty').length;
      const favorites = garments.filter(g => g.is_favorite).length;
      
      setStats({
        total_garments: total,
        clean_garments: clean,
        dirty_garments: dirty,
        favorite_garments: favorites
      });
      
      // Get recent garments (last 5)
      setRecentGarments(garments.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><i className="fas fa-tachometer-alt"></i> Dashboard</h1>
      </div>

      {/* Weather Widget */}
      {!weatherLoading && weather && (
        <div className="weather-widget">
          <div className="weather-main">
            <div className="weather-info">
              <div className="weather-icon-section">
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                  className="weather-icon-img"
                />
              </div>
              <div className="weather-details">
                <div className="weather-location">
                  <i className="fas fa-map-marker-alt"></i>
                  {weather.city}, {weather.country}
                </div>
                <div className="weather-temp">{weather.temp}°C</div>
                <div className="weather-desc">{weather.description}</div>
                <div className="weather-meta">
                  <span><i className="fas fa-temperature-high"></i> Feels like {weather.feels_like}°C</span>
                  <span><i className="fas fa-tint"></i> {weather.humidity}% humidity</span>
                </div>
              </div>
            </div>
            <div className="outfit-suggestion">
              <div className="suggestion-header">
                <i className={`fas ${getOutfitSuggestion(weather.temp, weather.description).icon}`} 
                   style={{ color: getOutfitSuggestion(weather.temp, weather.description).color }}></i>
                <h3>Today's Outfit Suggestion</h3>
              </div>
              <div className="suggestion-title">
                {getOutfitSuggestion(weather.temp, weather.description).suggestion}
              </div>
              <div className="suggestion-items">
                {getOutfitSuggestion(weather.temp, weather.description).items.map((item, index) => (
                  <span key={index} className="suggestion-tag">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {weatherLoading && (
        <div className="weather-widget loading-widget">
          <i className="fas fa-spinner fa-spin"></i> Loading weather...
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Garments</span>
            <i className="fas fa-tshirt stat-icon"></i>
          </div>
          <div className="stat-value">{stats.total_garments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Clean Items</span>
            <i className="fas fa-check-circle stat-icon text-success"></i>
          </div>
          <div className="stat-value">{stats.clean_garments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Dirty Items</span>
            <i className="fas fa-soap stat-icon text-warning"></i>
          </div>
          <div className="stat-value">{stats.dirty_garments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Favorites</span>
            <i className="fas fa-heart stat-icon text-danger"></i>
          </div>
          <div className="stat-value">{stats.favorite_garments}</div>
        </div>
      </div>

      {/* Recent Garments & Outfits */}
      <div className="dashboard-sections">
        {/* Recent Garments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h5>Recent Garments</h5>
            <Link to="/wardrobe" className="btn-view-all">View All</Link>
          </div>
          <div className="card-body">
            {recentGarments.length > 0 ? (
              <div className="recent-list">
                {recentGarments.map(garment => (
                  <div key={garment.id} className="recent-item">
                    <div className="item-info">
                      {garment.image_url ? (
                        <img src={garment.image_url} alt={garment.name} className="item-thumb" />
                      ) : (
                        <div className="item-thumb-placeholder">
                          <i className="fas fa-tshirt"></i>
                        </div>
                      )}
                      <div>
                        <h6>{garment.name}</h6>
                        <small>{garment.category_name} • {garment.color}</small>
                      </div>
                    </div>
                    <span className={`status-badge status-${garment.status || 'clean'}`}>
                      {garment.status || 'clean'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">
                No garments yet. <Link to="/add-garment">Add your first garment!</Link>
              </p>
            )}
          </div>
        </div>

        {/* Recent Outfits */}
        <div className="dashboard-card">
          <div className="card-header">
            <h5>Recent Outfits</h5>
            <Link to="/outfits" className="btn-view-all">View All</Link>
          </div>
          <div className="card-body">
            <p className="empty-message">
              No outfits yet. <Link to="/mixmatch">Create your first outfit!</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <div className="card-header">
          <h5>Quick Actions</h5>
        </div>
        <div className="card-body">
          <div className="quick-actions">
            <Link to="/add-garment" className="action-btn">
              <i className="fas fa-plus"></i>
              <span>Add Garment</span>
            </Link>
            <Link to="/mixmatch" className="action-btn">
              <i className="fas fa-palette"></i>
              <span>Create Outfit</span>
            </Link>
            <Link to="/laundry" className="action-btn">
              <i className="fas fa-soap"></i>
              <span>Laundry ({stats.dirty_garments})</span>
            </Link>
            <Link to="/mixmatch" className="action-btn">
              <i className="fas fa-wand-magic-sparkles"></i>
              <span>Mix & Match</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
