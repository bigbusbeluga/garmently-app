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

  useEffect(() => {
    document.title = 'Dashboard - Garmently';
    fetchDashboardData();
  }, []);

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
